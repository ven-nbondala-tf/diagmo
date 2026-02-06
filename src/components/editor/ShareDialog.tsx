import { useState } from 'react'
import { useShares, useShareDiagram, useRemoveShare, useUpdateSharePermission } from '@/hooks'
import type { SharePermission, DiagramShare } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { UserPlus, Trash2, Mail, Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  diagramId: string
  diagramName: string
}

export function ShareDialog({
  open,
  onOpenChange,
  diagramId,
  diagramName,
}: ShareDialogProps) {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<SharePermission>('view')

  const { data: shares = [], isLoading } = useShares(diagramId)
  const shareMutation = useShareDiagram()
  const removeMutation = useRemoveShare()
  const updatePermissionMutation = useUpdateSharePermission()

  const handleShare = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    const result = await shareMutation.mutateAsync({
      diagramId,
      email: email.trim(),
      permission,
    })

    if (result.success) {
      toast.success(`Shared with ${email}`)
      setEmail('')
    } else {
      toast.error(result.error || 'Failed to share diagram')
    }
  }

  const handleRemove = async (share: DiagramShare) => {
    const confirmed = window.confirm(
      `Remove access for ${share.user?.email || share.sharedWithEmail}?`
    )
    if (!confirmed) return

    const success = await removeMutation.mutateAsync({
      shareId: share.id,
      diagramId,
    })

    if (success) {
      toast.success('Access removed')
    } else {
      toast.error('Failed to remove access')
    }
  }

  const handlePermissionChange = async (
    share: DiagramShare,
    newPermission: SharePermission
  ) => {
    const success = await updatePermissionMutation.mutateAsync({
      shareId: share.id,
      permission: newPermission,
      diagramId,
    })

    if (success) {
      toast.success('Permission updated')
    } else {
      toast.error('Failed to update permission')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Share "{diagramName}"
          </DialogTitle>
          <DialogDescription>
            Invite collaborators to view or edit this diagram
          </DialogDescription>
        </DialogHeader>

        {/* Invite form */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleShare()
                }}
              />
            </div>
            <Select
              value={permission}
              onValueChange={(v) => setPermission(v as SharePermission)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleShare}
              disabled={shareMutation.isPending || !email.trim()}
            >
              {shareMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Current collaborators */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">
              People with access ({shares.length})
            </h4>

            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : shares.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No collaborators yet. Invite someone above.
              </p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {shares.map((share) => (
                  <ShareRow
                    key={share.id}
                    share={share}
                    onRemove={() => handleRemove(share)}
                    onPermissionChange={(p) => handlePermissionChange(share, p)}
                    isUpdating={updatePermissionMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Copy link section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Share link
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/editor/${diagramId}`
                  )
                  toast.success('Link copied to clipboard')
                }}
              >
                Copy link
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Only people you've shared with can access this link
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ShareRowProps {
  share: DiagramShare
  onRemove: () => void
  onPermissionChange: (permission: SharePermission) => void
  isUpdating: boolean
}

function ShareRow({
  share,
  onRemove,
  onPermissionChange,
  isUpdating,
}: ShareRowProps) {
  const displayName = share.user?.fullName || share.sharedWithEmail || 'Unknown'
  const displayEmail = share.user?.email || share.sharedWithEmail
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
        {share.user?.avatarUrl ? (
          <img
            src={share.user.avatarUrl}
            alt={displayName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials || '?'
        )}
      </div>

      {/* Name and email */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{displayName}</p>
        {displayEmail && displayEmail !== displayName && (
          <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
        )}
        {!share.acceptedAt && (
          <p className="text-xs text-amber-600">Pending invite</p>
        )}
      </div>

      {/* Permission selector */}
      <Select
        value={share.permission}
        onValueChange={(v) => onPermissionChange(v as SharePermission)}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-20 h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="view">View</SelectItem>
          <SelectItem value="edit">Edit</SelectItem>
        </SelectContent>
      </Select>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
