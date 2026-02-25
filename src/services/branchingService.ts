/**
 * Diagram Branching Service
 * Git-like branching and merging for diagrams
 */

import { supabase } from './supabase'
import type { DiagramNode, DiagramEdge } from '@/types'

// Branch definition
export interface DiagramBranch {
  id: string
  diagramId: string
  name: string
  parentBranchId?: string
  parentVersionId?: string
  createdAt: string
  createdBy: string
  isDefault: boolean
  headVersionId?: string
}

// Branch version (commit)
export interface BranchVersion {
  id: string
  branchId: string
  parentVersionId?: string
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  message?: string
  createdAt: string
  createdBy: string
}

// Merge conflict types
export interface MergeConflict {
  type: 'node-modified' | 'node-deleted' | 'node-added' | 'edge-modified' | 'edge-deleted'
  elementId: string
  elementType: 'node' | 'edge'
  baseVersion?: DiagramNode | DiagramEdge
  ourVersion?: DiagramNode | DiagramEdge
  theirVersion?: DiagramNode | DiagramEdge
  resolution?: 'ours' | 'theirs' | 'manual'
  resolvedValue?: DiagramNode | DiagramEdge
}

// Merge result
export interface MergeResult {
  success: boolean
  merged?: {
    nodes: DiagramNode[]
    edges: DiagramEdge[]
  }
  conflicts?: MergeConflict[]
  message?: string
}

// Diff result
export interface DiffResult {
  addedNodes: DiagramNode[]
  removedNodes: DiagramNode[]
  modifiedNodes: Array<{ before: DiagramNode; after: DiagramNode }>
  addedEdges: DiagramEdge[]
  removedEdges: DiagramEdge[]
  modifiedEdges: Array<{ before: DiagramEdge; after: DiagramEdge }>
}

// Database row types
interface BranchRow {
  id: string
  diagram_id: string
  name: string
  parent_branch_id: string | null
  parent_version_id: string | null
  created_at: string
  created_by: string
  is_default: boolean
  head_version_id: string | null
}

interface VersionRow {
  id: string
  branch_id: string
  parent_version_id: string | null
  nodes: unknown
  edges: unknown
  message: string | null
  created_at: string
  created_by: string
}

// Map database rows to types
function mapBranchRow(row: BranchRow): DiagramBranch {
  return {
    id: row.id,
    diagramId: row.diagram_id,
    name: row.name,
    parentBranchId: row.parent_branch_id || undefined,
    parentVersionId: row.parent_version_id || undefined,
    createdAt: row.created_at,
    createdBy: row.created_by,
    isDefault: row.is_default,
    headVersionId: row.head_version_id || undefined,
  }
}

function mapVersionRow(row: VersionRow): BranchVersion {
  return {
    id: row.id,
    branchId: row.branch_id,
    parentVersionId: row.parent_version_id || undefined,
    nodes: (row.nodes as DiagramNode[]) || [],
    edges: (row.edges as DiagramEdge[]) || [],
    message: row.message || undefined,
    createdAt: row.created_at,
    createdBy: row.created_by,
  }
}

export const branchingService = {
  /**
   * Get all branches for a diagram
   */
  async getBranches(diagramId: string): Promise<DiagramBranch[]> {
    const { data, error } = await supabase
      .from('diagram_branches')
      .select('*')
      .eq('diagram_id', diagramId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data || []).map(mapBranchRow)
  },

  /**
   * Get a specific branch
   */
  async getBranch(branchId: string): Promise<DiagramBranch | null> {
    const { data, error } = await supabase
      .from('diagram_branches')
      .select('*')
      .eq('id', branchId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return mapBranchRow(data)
  },

  /**
   * Get the default branch for a diagram
   */
  async getDefaultBranch(diagramId: string): Promise<DiagramBranch | null> {
    const { data, error } = await supabase
      .from('diagram_branches')
      .select('*')
      .eq('diagram_id', diagramId)
      .eq('is_default', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return mapBranchRow(data)
  },

  /**
   * Create a new branch
   */
  async createBranch(
    diagramId: string,
    name: string,
    options?: {
      fromBranchId?: string
      fromVersionId?: string
    }
  ): Promise<DiagramBranch> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    // Get the source version
    let sourceVersionId: string | null = null
    if (options?.fromVersionId) {
      sourceVersionId = options.fromVersionId
    } else if (options?.fromBranchId) {
      const sourceBranch = await this.getBranch(options.fromBranchId)
      sourceVersionId = sourceBranch?.headVersionId || null
    }

    const { data, error } = await supabase
      .from('diagram_branches')
      .insert({
        diagram_id: diagramId,
        name,
        parent_branch_id: options?.fromBranchId || null,
        parent_version_id: sourceVersionId,
        created_by: userData.user.id,
        is_default: false,
        head_version_id: sourceVersionId,
      })
      .select()
      .single()

    if (error) throw error
    return mapBranchRow(data)
  },

  /**
   * Initialize branching for a diagram (creates main branch)
   */
  async initializeBranching(
    diagramId: string,
    nodes: DiagramNode[],
    edges: DiagramEdge[]
  ): Promise<{ branch: DiagramBranch; version: BranchVersion }> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    // Create main branch
    const { data: branchData, error: branchError } = await supabase
      .from('diagram_branches')
      .insert({
        diagram_id: diagramId,
        name: 'main',
        created_by: userData.user.id,
        is_default: true,
      })
      .select()
      .single()

    if (branchError) throw branchError

    // Create initial version
    const { data: versionData, error: versionError } = await supabase
      .from('branch_versions')
      .insert({
        branch_id: branchData.id,
        nodes,
        edges,
        message: 'Initial commit',
        created_by: userData.user.id,
      })
      .select()
      .single()

    if (versionError) throw versionError

    // Update branch head
    await supabase
      .from('diagram_branches')
      .update({ head_version_id: versionData.id })
      .eq('id', branchData.id)

    return {
      branch: mapBranchRow({ ...branchData, head_version_id: versionData.id }),
      version: mapVersionRow(versionData),
    }
  },

  /**
   * Create a new version (commit) on a branch
   */
  async createVersion(
    branchId: string,
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    message?: string
  ): Promise<BranchVersion> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    // Get current branch head
    const branch = await this.getBranch(branchId)
    if (!branch) throw new Error('Branch not found')

    // Create version
    const { data, error } = await supabase
      .from('branch_versions')
      .insert({
        branch_id: branchId,
        parent_version_id: branch.headVersionId || null,
        nodes,
        edges,
        message: message || null,
        created_by: userData.user.id,
      })
      .select()
      .single()

    if (error) throw error

    // Update branch head
    await supabase
      .from('diagram_branches')
      .update({ head_version_id: data.id })
      .eq('id', branchId)

    return mapVersionRow(data)
  },

  /**
   * Get version history for a branch
   */
  async getVersionHistory(branchId: string, limit = 50): Promise<BranchVersion[]> {
    const { data, error } = await supabase
      .from('branch_versions')
      .select('*')
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []).map(mapVersionRow)
  },

  /**
   * Get a specific version
   */
  async getVersion(versionId: string): Promise<BranchVersion | null> {
    const { data, error } = await supabase
      .from('branch_versions')
      .select('*')
      .eq('id', versionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return mapVersionRow(data)
  },

  /**
   * Calculate diff between two versions
   */
  calculateDiff(
    baseNodes: DiagramNode[],
    baseEdges: DiagramEdge[],
    newNodes: DiagramNode[],
    newEdges: DiagramEdge[]
  ): DiffResult {
    const baseNodeMap = new Map(baseNodes.map(n => [n.id, n]))
    const newNodeMap = new Map(newNodes.map(n => [n.id, n]))
    const baseEdgeMap = new Map(baseEdges.map(e => [e.id, e]))
    const newEdgeMap = new Map(newEdges.map(e => [e.id, e]))

    // Find added/removed/modified nodes
    const addedNodes: DiagramNode[] = []
    const removedNodes: DiagramNode[] = []
    const modifiedNodes: Array<{ before: DiagramNode; after: DiagramNode }> = []

    for (const [id, node] of newNodeMap) {
      const baseNode = baseNodeMap.get(id)
      if (!baseNode) {
        addedNodes.push(node)
      } else if (JSON.stringify(baseNode) !== JSON.stringify(node)) {
        modifiedNodes.push({ before: baseNode, after: node })
      }
    }

    for (const [id, node] of baseNodeMap) {
      if (!newNodeMap.has(id)) {
        removedNodes.push(node)
      }
    }

    // Find added/removed/modified edges
    const addedEdges: DiagramEdge[] = []
    const removedEdges: DiagramEdge[] = []
    const modifiedEdges: Array<{ before: DiagramEdge; after: DiagramEdge }> = []

    for (const [id, edge] of newEdgeMap) {
      const baseEdge = baseEdgeMap.get(id)
      if (!baseEdge) {
        addedEdges.push(edge)
      } else if (JSON.stringify(baseEdge) !== JSON.stringify(edge)) {
        modifiedEdges.push({ before: baseEdge, after: edge })
      }
    }

    for (const [id, edge] of baseEdgeMap) {
      if (!newEdgeMap.has(id)) {
        removedEdges.push(edge)
      }
    }

    return {
      addedNodes,
      removedNodes,
      modifiedNodes,
      addedEdges,
      removedEdges,
      modifiedEdges,
    }
  },

  /**
   * Find common ancestor between two branches
   */
  async findCommonAncestor(
    branchAId: string,
    branchBId: string
  ): Promise<BranchVersion | null> {
    // Get version histories
    const historyA = await this.getVersionHistory(branchAId, 100)
    const historyB = await this.getVersionHistory(branchBId, 100)

    // Find common version
    const versionSetB = new Set(historyB.map(v => v.id))
    for (const version of historyA) {
      if (versionSetB.has(version.id)) {
        return version
      }
      // Check parent versions
      if (version.parentVersionId && versionSetB.has(version.parentVersionId)) {
        return await this.getVersion(version.parentVersionId)
      }
    }

    return null
  },

  /**
   * Three-way merge of branches
   */
  async mergeBranches(
    sourceBranchId: string,
    targetBranchId: string
  ): Promise<MergeResult> {
    // Get branch heads
    const sourceBranch = await this.getBranch(sourceBranchId)
    const targetBranch = await this.getBranch(targetBranchId)

    if (!sourceBranch || !targetBranch) {
      return { success: false, message: 'Branch not found' }
    }

    if (!sourceBranch.headVersionId || !targetBranch.headVersionId) {
      return { success: false, message: 'Branch has no versions' }
    }

    // Get versions
    const sourceVersion = await this.getVersion(sourceBranch.headVersionId)
    const targetVersion = await this.getVersion(targetBranch.headVersionId)

    if (!sourceVersion || !targetVersion) {
      return { success: false, message: 'Version not found' }
    }

    // Find common ancestor
    const baseVersion = await this.findCommonAncestor(sourceBranchId, targetBranchId)

    // If no common ancestor, can't merge
    if (!baseVersion) {
      // Try direct merge (no common history)
      return this.directMerge(sourceVersion, targetVersion)
    }

    // Three-way merge
    return this.threeWayMerge(baseVersion, sourceVersion, targetVersion)
  },

  /**
   * Direct merge (no common ancestor)
   */
  directMerge(
    sourceVersion: BranchVersion,
    targetVersion: BranchVersion
  ): MergeResult {
    const conflicts: MergeConflict[] = []
    const mergedNodes: DiagramNode[] = [...targetVersion.nodes]
    const mergedEdges: DiagramEdge[] = [...targetVersion.edges]

    const targetNodeMap = new Map(targetVersion.nodes.map(n => [n.id, n]))
    const targetEdgeMap = new Map(targetVersion.edges.map(e => [e.id, e]))

    // Add nodes from source that don't exist in target
    for (const node of sourceVersion.nodes) {
      const existing = targetNodeMap.get(node.id)
      if (!existing) {
        mergedNodes.push(node)
      } else if (JSON.stringify(existing) !== JSON.stringify(node)) {
        // Conflict - same ID, different content
        conflicts.push({
          type: 'node-modified',
          elementId: node.id,
          elementType: 'node',
          ourVersion: existing,
          theirVersion: node,
        })
      }
    }

    // Add edges from source that don't exist in target
    for (const edge of sourceVersion.edges) {
      const existing = targetEdgeMap.get(edge.id)
      if (!existing) {
        mergedEdges.push(edge)
      } else if (JSON.stringify(existing) !== JSON.stringify(edge)) {
        conflicts.push({
          type: 'edge-modified',
          elementId: edge.id,
          elementType: 'edge',
          ourVersion: existing,
          theirVersion: edge,
        })
      }
    }

    if (conflicts.length > 0) {
      return {
        success: false,
        conflicts,
        message: `${conflicts.length} conflict(s) need resolution`,
      }
    }

    return {
      success: true,
      merged: {
        nodes: mergedNodes,
        edges: mergedEdges,
      },
    }
  },

  /**
   * Three-way merge
   */
  threeWayMerge(
    baseVersion: BranchVersion,
    sourceVersion: BranchVersion,
    targetVersion: BranchVersion
  ): MergeResult {
    const conflicts: MergeConflict[] = []
    const mergedNodes: DiagramNode[] = []
    const mergedEdges: DiagramEdge[] = []

    const baseNodeMap = new Map(baseVersion.nodes.map(n => [n.id, n]))
    const sourceNodeMap = new Map(sourceVersion.nodes.map(n => [n.id, n]))
    const targetNodeMap = new Map(targetVersion.nodes.map(n => [n.id, n]))

    // Process nodes
    const allNodeIds = new Set([
      ...baseVersion.nodes.map(n => n.id),
      ...sourceVersion.nodes.map(n => n.id),
      ...targetVersion.nodes.map(n => n.id),
    ])

    for (const nodeId of allNodeIds) {
      const base = baseNodeMap.get(nodeId)
      const source = sourceNodeMap.get(nodeId)
      const target = targetNodeMap.get(nodeId)

      // Case 1: Node only in source (added in source)
      if (!base && source && !target) {
        mergedNodes.push(source)
        continue
      }

      // Case 2: Node only in target (added in target)
      if (!base && !source && target) {
        mergedNodes.push(target)
        continue
      }

      // Case 3: Node in both source and target but not base (both added)
      if (!base && source && target) {
        if (JSON.stringify(source) === JSON.stringify(target)) {
          mergedNodes.push(source)
        } else {
          conflicts.push({
            type: 'node-added',
            elementId: nodeId,
            elementType: 'node',
            ourVersion: target,
            theirVersion: source,
          })
        }
        continue
      }

      // Case 4: Node deleted in source
      if (base && !source && target) {
        if (JSON.stringify(base) === JSON.stringify(target)) {
          // Deleted in source, unchanged in target - delete
          continue
        } else {
          // Deleted in source, modified in target - conflict
          conflicts.push({
            type: 'node-deleted',
            elementId: nodeId,
            elementType: 'node',
            baseVersion: base,
            ourVersion: target,
            theirVersion: undefined,
          })
        }
        continue
      }

      // Case 5: Node deleted in target
      if (base && source && !target) {
        if (JSON.stringify(base) === JSON.stringify(source)) {
          // Deleted in target, unchanged in source - delete
          continue
        } else {
          // Deleted in target, modified in source - conflict
          conflicts.push({
            type: 'node-deleted',
            elementId: nodeId,
            elementType: 'node',
            baseVersion: base,
            ourVersion: undefined,
            theirVersion: source,
          })
        }
        continue
      }

      // Case 6: Node deleted in both - delete
      if (base && !source && !target) {
        continue
      }

      // Case 7: Node exists in all three
      if (base && source && target) {
        const baseJson = JSON.stringify(base)
        const sourceJson = JSON.stringify(source)
        const targetJson = JSON.stringify(target)

        if (sourceJson === targetJson) {
          // Same change in both - use either
          mergedNodes.push(source)
        } else if (baseJson === sourceJson) {
          // Changed only in target - use target
          mergedNodes.push(target)
        } else if (baseJson === targetJson) {
          // Changed only in source - use source
          mergedNodes.push(source)
        } else {
          // Changed in both - conflict
          conflicts.push({
            type: 'node-modified',
            elementId: nodeId,
            elementType: 'node',
            baseVersion: base,
            ourVersion: target,
            theirVersion: source,
          })
        }
      }
    }

    // Process edges similarly
    const baseEdgeMap = new Map(baseVersion.edges.map(e => [e.id, e]))
    const sourceEdgeMap = new Map(sourceVersion.edges.map(e => [e.id, e]))
    const targetEdgeMap = new Map(targetVersion.edges.map(e => [e.id, e]))

    const allEdgeIds = new Set([
      ...baseVersion.edges.map(e => e.id),
      ...sourceVersion.edges.map(e => e.id),
      ...targetVersion.edges.map(e => e.id),
    ])

    for (const edgeId of allEdgeIds) {
      const base = baseEdgeMap.get(edgeId)
      const source = sourceEdgeMap.get(edgeId)
      const target = targetEdgeMap.get(edgeId)

      // Similar logic to nodes
      if (!base && source && !target) {
        mergedEdges.push(source)
      } else if (!base && !source && target) {
        mergedEdges.push(target)
      } else if (!base && source && target) {
        if (JSON.stringify(source) === JSON.stringify(target)) {
          mergedEdges.push(source)
        } else {
          conflicts.push({
            type: 'edge-modified',
            elementId: edgeId,
            elementType: 'edge',
            ourVersion: target,
            theirVersion: source,
          })
        }
      } else if (base && !source && target && JSON.stringify(base) === JSON.stringify(target)) {
        // Deleted in source
      } else if (base && source && !target && JSON.stringify(base) === JSON.stringify(source)) {
        // Deleted in target
      } else if (base && source && target) {
        const baseJson = JSON.stringify(base)
        const sourceJson = JSON.stringify(source)
        const targetJson = JSON.stringify(target)

        if (sourceJson === targetJson) {
          mergedEdges.push(source)
        } else if (baseJson === sourceJson) {
          mergedEdges.push(target)
        } else if (baseJson === targetJson) {
          mergedEdges.push(source)
        } else {
          conflicts.push({
            type: 'edge-modified',
            elementId: edgeId,
            elementType: 'edge',
            baseVersion: base,
            ourVersion: target,
            theirVersion: source,
          })
        }
      }
    }

    if (conflicts.length > 0) {
      return {
        success: false,
        conflicts,
        merged: { nodes: mergedNodes, edges: mergedEdges },
        message: `${conflicts.length} conflict(s) need resolution`,
      }
    }

    return {
      success: true,
      merged: {
        nodes: mergedNodes,
        edges: mergedEdges,
      },
    }
  },

  /**
   * Apply conflict resolutions
   */
  applyResolutions(
    partialMerge: { nodes: DiagramNode[]; edges: DiagramEdge[] },
    resolvedConflicts: MergeConflict[]
  ): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
    const nodes = [...partialMerge.nodes]
    const edges = [...partialMerge.edges]

    for (const conflict of resolvedConflicts) {
      if (conflict.resolution && conflict.resolvedValue) {
        if (conflict.elementType === 'node') {
          const existingIndex = nodes.findIndex(n => n.id === conflict.elementId)
          if (existingIndex >= 0) {
            nodes[existingIndex] = conflict.resolvedValue as DiagramNode
          } else {
            nodes.push(conflict.resolvedValue as DiagramNode)
          }
        } else {
          const existingIndex = edges.findIndex(e => e.id === conflict.elementId)
          if (existingIndex >= 0) {
            edges[existingIndex] = conflict.resolvedValue as DiagramEdge
          } else {
            edges.push(conflict.resolvedValue as DiagramEdge)
          }
        }
      }
    }

    return { nodes, edges }
  },

  /**
   * Delete a branch
   */
  async deleteBranch(branchId: string): Promise<void> {
    const branch = await this.getBranch(branchId)
    if (!branch) throw new Error('Branch not found')
    if (branch.isDefault) throw new Error('Cannot delete default branch')

    const { error } = await supabase
      .from('diagram_branches')
      .delete()
      .eq('id', branchId)

    if (error) throw error
  },

  /**
   * Rename a branch
   */
  async renameBranch(branchId: string, newName: string): Promise<DiagramBranch> {
    const { data, error } = await supabase
      .from('diagram_branches')
      .update({ name: newName })
      .eq('id', branchId)
      .select()
      .single()

    if (error) throw error
    return mapBranchRow(data)
  },

  /**
   * Switch current branch (update user preference)
   */
  async switchBranch(diagramId: string, branchId: string): Promise<void> {
    // This would typically update a user preference or diagram metadata
    // For now, we'll just verify the branch exists
    const branch = await this.getBranch(branchId)
    if (!branch) throw new Error('Branch not found')
    if (branch.diagramId !== diagramId) throw new Error('Branch does not belong to this diagram')
  },
}
