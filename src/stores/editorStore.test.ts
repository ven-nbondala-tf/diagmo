import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from './editorStore'
import type { DiagramNode } from '@/types'

describe('editorStore', () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor()
  })

  it('should have initial state', () => {
    const state = useEditorStore.getState()
    expect(state.nodes).toEqual([])
    expect(state.edges).toEqual([])
    expect(state.selectedNodes).toEqual([])
    expect(state.gridEnabled).toBe(true)
    expect(state.snapToGrid).toBe(true)
  })

  it('should add a node', () => {
    useEditorStore.getState().addNode('rectangle', { x: 100, y: 100 })
    const state = useEditorStore.getState()
    expect(state.nodes).toHaveLength(1)
    expect(state.nodes[0].data.type).toBe('rectangle')
    expect(state.nodes[0].position).toEqual({ x: 100, y: 100 })
  })

  it('should toggle grid', () => {
    expect(useEditorStore.getState().gridEnabled).toBe(true)
    useEditorStore.getState().toggleGrid()
    expect(useEditorStore.getState().gridEnabled).toBe(false)
    useEditorStore.getState().toggleGrid()
    expect(useEditorStore.getState().gridEnabled).toBe(true)
  })

  it('should toggle snap to grid', () => {
    expect(useEditorStore.getState().snapToGrid).toBe(true)
    useEditorStore.getState().toggleSnapToGrid()
    expect(useEditorStore.getState().snapToGrid).toBe(false)
  })

  it('should load diagram', () => {
    const nodes = [
      {
        id: '1',
        type: 'custom' as const,
        position: { x: 0, y: 0 },
        data: { label: 'Test', type: 'rectangle' as const, style: {} },
      },
    ]
    const edges = [
      { id: 'e1', source: '1', target: '2' },
    ]

    useEditorStore.getState().loadDiagram(nodes, edges)
    const state = useEditorStore.getState()
    expect(state.nodes).toEqual(nodes)
    expect(state.edges).toEqual(edges)
    expect(state.isDirty).toBe(false)
  })

  it('should track dirty state', () => {
    expect(useEditorStore.getState().isDirty).toBe(false)
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    expect(useEditorStore.getState().isDirty).toBe(true)
    useEditorStore.getState().setDirty(false)
    expect(useEditorStore.getState().isDirty).toBe(false)
  })

  it('should handle undo/redo', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    expect(useEditorStore.getState().nodes).toHaveLength(1)
    expect(useEditorStore.getState().past).toHaveLength(1)

    useEditorStore.getState().undo()
    expect(useEditorStore.getState().nodes).toHaveLength(0)
    expect(useEditorStore.getState().future).toHaveLength(1)

    useEditorStore.getState().redo()
    expect(useEditorStore.getState().nodes).toHaveLength(1)
  })

  it('should not undo when history is empty', () => {
    useEditorStore.getState().undo()
    expect(useEditorStore.getState().nodes).toEqual([])
  })

  it('should not redo when future is empty', () => {
    useEditorStore.getState().redo()
    expect(useEditorStore.getState().nodes).toEqual([])
  })
})

describe('editorStore - node operations', () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor()
  })

  it('should update node data', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    const nodeId = useEditorStore.getState().nodes[0].id

    useEditorStore.getState().updateNode(nodeId, { label: 'Updated Label' })

    expect(useEditorStore.getState().nodes[0].data.label).toBe('Updated Label')
  })

  it('should update node style', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    const nodeId = useEditorStore.getState().nodes[0].id

    useEditorStore.getState().updateNodeStyle(nodeId, { backgroundColor: '#ff0000' })

    expect(useEditorStore.getState().nodes[0].data.style?.backgroundColor).toBe('#ff0000')
  })

  it('should select nodes', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    useEditorStore.getState().addNode('ellipse', { x: 100, y: 100 })
    const nodeIds = useEditorStore.getState().nodes.map(n => n.id)

    useEditorStore.getState().selectNodes(nodeIds)

    expect(useEditorStore.getState().selectedNodes).toEqual(nodeIds)
  })

  it('should select edges', () => {
    useEditorStore.getState().selectEdges(['e1', 'e2'])
    expect(useEditorStore.getState().selectedEdges).toEqual(['e1', 'e2'])
  })

  it('should set zoom', () => {
    useEditorStore.getState().setZoom(1.5)
    expect(useEditorStore.getState().zoom).toBe(1.5)
  })

  it('should set grid size', () => {
    useEditorStore.getState().setGridSize(30)
    expect(useEditorStore.getState().gridSize).toBe(30)
  })

  it('should set nodes directly', () => {
    const nodes: DiagramNode[] = [
      {
        id: '1',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Test', type: 'rectangle', style: {} },
      },
    ]
    useEditorStore.getState().setNodes(nodes)
    expect(useEditorStore.getState().nodes).toEqual(nodes)
    expect(useEditorStore.getState().isDirty).toBe(true)
  })

  it('should set edges directly', () => {
    const edges = [{ id: 'e1', source: '1', target: '2' }]
    useEditorStore.getState().setEdges(edges)
    expect(useEditorStore.getState().edges).toEqual(edges)
    expect(useEditorStore.getState().isDirty).toBe(true)
  })
})

describe('editorStore - copy/paste', () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor()
  })

  it('should copy selected nodes', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    const nodeId = useEditorStore.getState().nodes[0].id
    useEditorStore.getState().selectNodes([nodeId])

    useEditorStore.getState().copyNodes()

    expect(useEditorStore.getState().clipboard).toHaveLength(1)
  })

  it('should not copy when no nodes selected', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    // Explicitly clear selection
    useEditorStore.getState().selectNodes([])
    useEditorStore.getState().copyNodes()

    // Clipboard should remain empty (or unchanged from initial state)
    expect(useEditorStore.getState().selectedNodes).toHaveLength(0)
  })

  it('should paste copied nodes with offset', () => {
    useEditorStore.getState().addNode('rectangle', { x: 100, y: 100 })
    const originalNode = useEditorStore.getState().nodes[0]
    useEditorStore.getState().selectNodes([originalNode.id])
    useEditorStore.getState().copyNodes()

    useEditorStore.getState().pasteNodes()

    expect(useEditorStore.getState().nodes).toHaveLength(2)
    const pastedNode = useEditorStore.getState().nodes[1]
    expect(pastedNode.position.x).toBe(150) // 100 + 50 offset
    expect(pastedNode.position.y).toBe(150)
  })

  it('should not paste when clipboard is empty', () => {
    useEditorStore.getState().pasteNodes()
    expect(useEditorStore.getState().nodes).toHaveLength(0)
  })

  it('should select pasted nodes after paste', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    const originalNode = useEditorStore.getState().nodes[0]
    useEditorStore.getState().selectNodes([originalNode.id])
    useEditorStore.getState().copyNodes()
    useEditorStore.getState().pasteNodes()

    const pastedNodeId = useEditorStore.getState().nodes[1].id
    expect(useEditorStore.getState().selectedNodes).toContain(pastedNodeId)
  })
})

describe('editorStore - delete', () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor()
  })

  it('should delete selected nodes', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    useEditorStore.getState().addNode('ellipse', { x: 100, y: 100 })
    const nodeId = useEditorStore.getState().nodes[0].id
    useEditorStore.getState().selectNodes([nodeId])

    useEditorStore.getState().deleteSelected()

    expect(useEditorStore.getState().nodes).toHaveLength(1)
  })

  it('should not delete locked nodes', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    const nodeId = useEditorStore.getState().nodes[0].id
    useEditorStore.getState().selectNodes([nodeId])
    useEditorStore.getState().lockNodes()

    useEditorStore.getState().deleteSelected()

    expect(useEditorStore.getState().nodes).toHaveLength(1)
  })

  it('should delete connected edges when node is deleted', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    useEditorStore.getState().addNode('ellipse', { x: 200, y: 0 })
    const [node1, node2] = useEditorStore.getState().nodes

    // Add an edge between nodes
    useEditorStore.getState().setEdges([
      { id: 'e1', source: node1.id, target: node2.id },
    ])

    useEditorStore.getState().selectNodes([node1.id])
    useEditorStore.getState().deleteSelected()

    expect(useEditorStore.getState().edges).toHaveLength(0)
  })

  it('should clear selection after delete', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    const nodeId = useEditorStore.getState().nodes[0].id
    useEditorStore.getState().selectNodes([nodeId])

    useEditorStore.getState().deleteSelected()

    expect(useEditorStore.getState().selectedNodes).toHaveLength(0)
  })

  it('should not delete when nothing is selected', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    // Explicitly clear selection before testing
    useEditorStore.getState().selectNodes([])
    useEditorStore.getState().selectEdges([])
    const initialLength = useEditorStore.getState().nodes.length

    useEditorStore.getState().deleteSelected()

    expect(useEditorStore.getState().nodes).toHaveLength(initialLength)
  })
})

describe('editorStore - grouping', () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor()
  })

  it('should group selected nodes', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    useEditorStore.getState().addNode('ellipse', { x: 100, y: 100 })
    const nodeIds = useEditorStore.getState().nodes.map(n => n.id)
    useEditorStore.getState().selectNodes(nodeIds)

    useEditorStore.getState().groupNodes()

    const groupIds = useEditorStore.getState().nodes.map(n => n.data.groupId)
    expect(groupIds[0]).toBeDefined()
    expect(groupIds[0]).toBe(groupIds[1])
  })

  it('should not group when less than 2 nodes selected', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    const nodeId = useEditorStore.getState().nodes[0].id
    useEditorStore.getState().selectNodes([nodeId])

    useEditorStore.getState().groupNodes()

    expect(useEditorStore.getState().nodes[0].data.groupId).toBeUndefined()
  })

  it('should ungroup selected nodes', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    useEditorStore.getState().addNode('ellipse', { x: 100, y: 100 })
    const nodeIds = useEditorStore.getState().nodes.map(n => n.id)
    useEditorStore.getState().selectNodes(nodeIds)
    useEditorStore.getState().groupNodes()

    useEditorStore.getState().ungroupNodes()

    const groupIds = useEditorStore.getState().nodes.map(n => n.data.groupId)
    expect(groupIds[0]).toBeUndefined()
    expect(groupIds[1]).toBeUndefined()
  })

  it('should not ungroup when no nodes selected', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    useEditorStore.getState().addNode('ellipse', { x: 100, y: 100 })
    const nodeIds = useEditorStore.getState().nodes.map(n => n.id)
    useEditorStore.getState().selectNodes(nodeIds)
    useEditorStore.getState().groupNodes()

    useEditorStore.getState().selectNodes([])
    useEditorStore.getState().ungroupNodes()

    // Group should remain
    expect(useEditorStore.getState().nodes[0].data.groupId).toBeDefined()
  })
})

describe('editorStore - locking', () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor()
  })

  it('should lock selected nodes', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    const nodeId = useEditorStore.getState().nodes[0].id
    useEditorStore.getState().selectNodes([nodeId])

    useEditorStore.getState().lockNodes()

    expect(useEditorStore.getState().nodes[0].data.locked).toBe(true)
  })

  it('should unlock selected nodes', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    const nodeId = useEditorStore.getState().nodes[0].id
    useEditorStore.getState().selectNodes([nodeId])
    useEditorStore.getState().lockNodes()

    useEditorStore.getState().unlockNodes()

    expect(useEditorStore.getState().nodes[0].data.locked).toBe(false)
  })

  it('should toggle lock on selected nodes', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    const nodeId = useEditorStore.getState().nodes[0].id
    useEditorStore.getState().selectNodes([nodeId])

    useEditorStore.getState().toggleLockNodes()
    expect(useEditorStore.getState().nodes[0].data.locked).toBe(true)

    useEditorStore.getState().toggleLockNodes()
    expect(useEditorStore.getState().nodes[0].data.locked).toBe(false)
  })

  it('should not lock when no nodes selected', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    // Explicitly clear selection
    useEditorStore.getState().selectNodes([])
    useEditorStore.getState().lockNodes()

    // Node should not be locked since nothing was selected
    expect(useEditorStore.getState().nodes[0].data.locked).toBeFalsy()
  })
})

describe('editorStore - alignment', () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor()
  })

  it('should not align when less than 2 nodes selected', () => {
    useEditorStore.getState().addNode('rectangle', { x: 100, y: 100 })
    const nodeId = useEditorStore.getState().nodes[0].id
    useEditorStore.getState().selectNodes([nodeId])

    const originalPosition = { ...useEditorStore.getState().nodes[0].position }
    useEditorStore.getState().alignNodes('left')

    expect(useEditorStore.getState().nodes[0].position).toEqual(originalPosition)
  })

  it('should align nodes to the left', () => {
    useEditorStore.getState().addNode('rectangle', { x: 50, y: 0 })
    useEditorStore.getState().addNode('rectangle', { x: 200, y: 100 })
    const nodeIds = useEditorStore.getState().nodes.map(n => n.id)
    useEditorStore.getState().selectNodes(nodeIds)

    useEditorStore.getState().alignNodes('left')

    const positions = useEditorStore.getState().nodes.map(n => n.position.x)
    expect(positions[0]).toBe(50)
    expect(positions[1]).toBe(50)
  })

  it('should align nodes to the top', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 50 })
    useEditorStore.getState().addNode('rectangle', { x: 100, y: 200 })
    const nodeIds = useEditorStore.getState().nodes.map(n => n.id)
    useEditorStore.getState().selectNodes(nodeIds)

    useEditorStore.getState().alignNodes('top')

    const positions = useEditorStore.getState().nodes.map(n => n.position.y)
    expect(positions[0]).toBe(50)
    expect(positions[1]).toBe(50)
  })

  it('should not align locked nodes', () => {
    useEditorStore.getState().addNode('rectangle', { x: 50, y: 0 })
    useEditorStore.getState().addNode('rectangle', { x: 200, y: 100 })
    const nodeIds = useEditorStore.getState().nodes.map(n => n.id)
    useEditorStore.getState().selectNodes([nodeIds[1]])
    useEditorStore.getState().lockNodes()
    useEditorStore.getState().selectNodes(nodeIds)

    useEditorStore.getState().alignNodes('left')

    // Second node should not move because it's locked
    expect(useEditorStore.getState().nodes[1].position.x).toBe(200)
  })
})

describe('editorStore - distribution', () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor()
  })

  it('should not distribute when less than 3 nodes selected', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    useEditorStore.getState().addNode('rectangle', { x: 200, y: 0 })
    const nodeIds = useEditorStore.getState().nodes.map(n => n.id)
    useEditorStore.getState().selectNodes(nodeIds)

    const originalPositions = useEditorStore.getState().nodes.map(n => ({ ...n.position }))
    useEditorStore.getState().distributeNodes('horizontal')

    expect(useEditorStore.getState().nodes[0].position).toEqual(originalPositions[0])
    expect(useEditorStore.getState().nodes[1].position).toEqual(originalPositions[1])
  })

  it('should distribute nodes horizontally', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    useEditorStore.getState().addNode('rectangle', { x: 100, y: 0 })
    useEditorStore.getState().addNode('rectangle', { x: 400, y: 0 })
    const nodeIds = useEditorStore.getState().nodes.map(n => n.id)
    useEditorStore.getState().selectNodes(nodeIds)

    useEditorStore.getState().distributeNodes('horizontal')

    // First and last should stay in place
    expect(useEditorStore.getState().nodes[0].position.x).toBe(0)
    expect(useEditorStore.getState().nodes[2].position.x).toBe(400)
  })

  it('should distribute nodes vertically', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 100 })
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 400 })
    const nodeIds = useEditorStore.getState().nodes.map(n => n.id)
    useEditorStore.getState().selectNodes(nodeIds)

    useEditorStore.getState().distributeNodes('vertical')

    // First and last should stay in place
    expect(useEditorStore.getState().nodes[0].position.y).toBe(0)
    expect(useEditorStore.getState().nodes[2].position.y).toBe(400)
  })
})

describe('editorStore - connections', () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor()
  })

  it('should add edge on connect', () => {
    useEditorStore.getState().addNode('rectangle', { x: 0, y: 0 })
    useEditorStore.getState().addNode('ellipse', { x: 200, y: 0 })
    const [node1, node2] = useEditorStore.getState().nodes

    useEditorStore.getState().onConnect({
      source: node1!.id,
      target: node2!.id,
      sourceHandle: null,
      targetHandle: null,
    })

    expect(useEditorStore.getState().edges).toHaveLength(1)
    expect(useEditorStore.getState().edges[0]!.source).toBe(node1!.id)
    expect(useEditorStore.getState().edges[0]!.target).toBe(node2!.id)
  })
})
