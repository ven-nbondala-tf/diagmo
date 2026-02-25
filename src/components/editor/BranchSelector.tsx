/**
 * Branch Selector
 * Git-like branch switcher for diagrams
 */

import { useState, useEffect, useCallback } from 'react'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useEditorStore } from '@/stores/editorStore'
import {
  branchingService,
  type DiagramBranch,
} from '@/services/branchingService'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'
import {
  GitBranch,
  ChevronDown,
  Plus,
  Check,
  Trash2,
  Edit2,
  GitMerge,
  Loader2,
} from 'lucide-react'
import { cn } from '@/utils'
import { toast } from 'sonner'

interface BranchSelectorProps {
  diagramId: string
  currentBranchId?: string
  onBranchChange: (branchId: string, nodes: unknown[], edges: unknown[]) => void
  onMergeRequest?: (sourceBranchId: string, targetBranchId: string) => void
}

export function BranchSelector({
  diagramId,
  currentBranchId,
  onBranchChange,
  onMergeRequest,
}: BranchSelectorProps) {
  const secondaryAccentColor = usePreferencesStore((s) => s.secondaryAccentColor)
  const secondaryAccentTextColor = usePreferencesStore((s) => s.secondaryAccentTextColor)

  // Get current diagram state for creating versions
  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)

  const [branches, setBranches] = useState<DiagramBranch[]>([])
  const [currentBranch, setCurrentBranch] = useState<DiagramBranch | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [creating, setCreating] = useState(false)
  const [mergingFrom, setMergingFrom] = useState<string | null>(null)

  // Load branches
  useEffect(() => {
    const loadBranches = async () => {
      setLoading(true)
      try {
        const allBranches = await branchingService.getBranches(diagramId)
        setBranches(allBranches)

        // Find current branch
        if (currentBranchId) {
          const branch = allBranches.find(b => b.id === currentBranchId)
          setCurrentBranch(branch || null)
        } else {
          // Default to main branch
          const defaultBranch = allBranches.find(b => b.isDefault)
          setCurrentBranch(defaultBranch || null)
        }
      } catch (error) {
        console.error('Failed to load branches:', error)
      } finally {
        setLoading(false)
      }
    }

    if (diagramId) {
      loadBranches()
    }
  }, [diagramId, currentBranchId])

  // Switch branch
  const handleSwitchBranch = useCallback(async (branch: DiagramBranch) => {
    if (branch.id === currentBranch?.id) return

    try {
      // Save current state to current branch before switching
      if (currentBranch) {
        await branchingService.createVersion(
          currentBranch.id,
          nodes,
          edges,
          'Auto-save before branch switch'
        )
      }

      // Load the target branch's state
      if (branch.headVersionId) {
        const version = await branchingService.getVersion(branch.headVersionId)
        if (version) {
          onBranchChange(branch.id, version.nodes, version.edges)
          setCurrentBranch(branch)
          toast.success(`Switched to ${branch.name}`)
        }
      } else {
        // Branch has no version yet, just switch context
        setCurrentBranch(branch)
        toast.success(`Switched to ${branch.name}`)
      }
    } catch (error) {
      console.error('Failed to switch branch:', error)
      toast.error('Failed to switch branch')
    }
  }, [currentBranch, onBranchChange, nodes, edges])

  // Create new branch
  const handleCreateBranch = useCallback(async () => {
    const branchName = newBranchName.trim() || 'main'

    // Validate branch name
    const validName = branchName.replace(/[^a-zA-Z0-9-_/]/g, '-')
    if (branches.some(b => b.name.toLowerCase() === validName.toLowerCase())) {
      toast.error('Branch name already exists')
      return
    }

    setCreating(true)
    try {
      // If this is the first branch, use initializeBranching
      if (branches.length === 0) {
        const result = await branchingService.initializeBranching(
          diagramId,
          nodes,
          edges
        )
        setBranches([result.branch])
        setCurrentBranch(result.branch)
        toast.success(`Initialized branching with "${result.branch.name}"`)
      } else {
        // Create branch from current branch
        const newBranch = await branchingService.createBranch(
          diagramId,
          validName,
          { fromBranchId: currentBranch?.id }
        )

        // Save current state as a version on the new branch
        await branchingService.createVersion(
          newBranch.id,
          nodes,
          edges,
          `Created branch ${validName}`
        )

        // Refresh to get updated branch with headVersionId
        const updatedBranch = await branchingService.getBranch(newBranch.id)
        if (updatedBranch) {
          setBranches([...branches, updatedBranch])
          setCurrentBranch(updatedBranch)
        }
        toast.success(`Created branch ${validName}`)
      }

      setShowCreateDialog(false)
      setNewBranchName('')
    } catch (error) {
      console.error('Failed to create branch:', error)
      toast.error('Failed to create branch')
    } finally {
      setCreating(false)
    }
  }, [diagramId, newBranchName, branches, currentBranch, nodes, edges])

  // Delete branch
  const handleDeleteBranch = useCallback(async (branch: DiagramBranch) => {
    if (branch.isDefault) {
      toast.error('Cannot delete default branch')
      return
    }

    if (branch.id === currentBranch?.id) {
      toast.error('Cannot delete current branch')
      return
    }

    try {
      await branchingService.deleteBranch(branch.id)
      setBranches(branches.filter(b => b.id !== branch.id))
      toast.success(`Deleted branch ${branch.name}`)
    } catch (error) {
      console.error('Failed to delete branch:', error)
      toast.error('Failed to delete branch')
    }
  }, [branches, currentBranch])

  // Start merge
  const handleStartMerge = useCallback((fromBranchId: string) => {
    setMergingFrom(fromBranchId)
    if (onMergeRequest && currentBranch) {
      onMergeRequest(fromBranchId, currentBranch.id)
    }
    setShowMergeDialog(false)
  }, [onMergeRequest, currentBranch])

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled className="h-7 gap-1.5">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="text-xs">Loading...</span>
      </Button>
    )
  }

  // Show "Initialize Branching" button when no branches exist
  if (branches.length === 0) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowCreateDialog(true)}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Initialize Branching</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Create your first branch to enable version control</TooltipContent>
        </Tooltip>

        {/* Create Branch Dialog - for initializing */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Initialize Branching
              </DialogTitle>
              <DialogDescription>
                Create a "main" branch to start versioning this diagram. You can create additional branches later.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="init-branch-name">Branch Name</Label>
                <Input
                  id="init-branch-name"
                  value={newBranchName || 'main'}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="main"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateBranch()
                  }}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateBranch}
                disabled={creating}
                style={{ backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor }}
                className="hover:opacity-90"
              >
                {creating ? 'Creating...' : 'Initialize'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
            <GitBranch className="w-3.5 h-3.5" />
            <span className="max-w-[100px] truncate">
              {currentBranch?.name || 'Select branch'}
            </span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Branches
          </div>

          {branches.map((branch) => (
            <DropdownMenuItem
              key={branch.id}
              onClick={() => handleSwitchBranch(branch)}
              className="gap-2"
            >
              <div className="flex items-center gap-2 flex-1">
                <GitBranch className="w-3.5 h-3.5" />
                <span className="flex-1 truncate">{branch.name}</span>
                {branch.isDefault && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded">
                    default
                  </span>
                )}
              </div>
              {branch.id === currentBranch?.id && (
                <Check className="w-3.5 h-3.5 text-primary" />
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="w-3.5 h-3.5" />
            Create new branch
          </DropdownMenuItem>

          {branches.length > 1 && (
            <DropdownMenuItem onClick={() => setShowMergeDialog(true)} className="gap-2">
              <GitMerge className="w-3.5 h-3.5" />
              Merge branch...
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Branch Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Create New Branch
            </DialogTitle>
            <DialogDescription>
              Create a new branch from {currentBranch?.name || 'current branch'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="branch-name">Branch Name</Label>
              <Input
                id="branch-name"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="feature/my-changes"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateBranch()
                }}
              />
              <p className="text-xs text-muted-foreground">
                Use lowercase letters, numbers, hyphens, and slashes
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateBranch}
              disabled={creating || !newBranchName.trim()}
              style={{ backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor }}
              className="hover:opacity-90"
            >
              {creating ? 'Creating...' : 'Create Branch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Branch Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="w-5 h-5" />
              Merge Branch
            </DialogTitle>
            <DialogDescription>
              Merge changes into {currentBranch?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <Label>Select branch to merge from:</Label>
            <div className="space-y-1">
              {branches
                .filter(b => b.id !== currentBranch?.id)
                .map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => handleStartMerge(branch.id)}
                    className={cn(
                      'w-full flex items-center gap-2 p-2 rounded-md border transition-colors',
                      'hover:bg-muted hover:border-primary/50',
                      'text-left text-sm'
                    )}
                  >
                    <GitBranch className="w-4 h-4" />
                    <span className="flex-1">{branch.name}</span>
                    <GitMerge className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {currentBranch?.name}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
