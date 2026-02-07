import { usePendingInvites, useAcceptInvite, useDeclineInvite } from '@/hooks/useWorkspaces'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { Button, Badge } from '@/components/ui'
import { Mail, X, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function PendingInvitesBanner() {
  const { data: pendingInvites = [], isLoading } = usePendingInvites()
  const { setWorkspaceSettingsOpen, setCurrentWorkspace } = useWorkspaceStore()
  const acceptInvite = useAcceptInvite()
  const declineInvite = useDeclineInvite()

  if (isLoading || pendingInvites.length === 0) {
    return null
  }

  const handleAccept = async (workspaceId: string, workspaceName: string) => {
    const result = await acceptInvite.mutateAsync(workspaceId)
    if (result.success) {
      toast.success(`Joined ${workspaceName}`)
      setCurrentWorkspace(workspaceId)
    } else {
      toast.error(result.error || 'Failed to accept invitation')
    }
  }

  const handleDecline = async (workspaceId: string) => {
    const result = await declineInvite.mutateAsync(workspaceId)
    if (result.success) {
      toast.success('Invitation declined')
    } else {
      toast.error(result.error || 'Failed to decline invitation')
    }
  }

  const handleViewDetails = (workspaceId: string) => {
    setWorkspaceSettingsOpen(true, workspaceId)
  }

  return (
    <div className="bg-supabase-green/5 border border-supabase-green/20 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-supabase-green/10">
          <Mail className="h-5 w-5 text-supabase-green" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-supabase-text-primary">
            You have {pendingInvites.length} pending workspace{' '}
            {pendingInvites.length === 1 ? 'invitation' : 'invitations'}
          </h3>
          <div className="mt-3 space-y-2">
            {pendingInvites.map(({ workspace, invite }) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-3 bg-supabase-bg-secondary rounded-md border border-supabase-border"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <button
                      onClick={() => handleViewDetails(workspace.id)}
                      className="font-medium text-supabase-text-primary hover:text-supabase-green hover:underline transition-colors"
                    >
                      {workspace.name}
                    </button>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-xs bg-supabase-bg-tertiary text-supabase-text-secondary">
                        {invite.role}
                      </Badge>
                      {workspace.description && (
                        <span className="text-xs text-supabase-text-muted truncate max-w-[200px]">
                          {workspace.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDecline(workspace.id)}
                    disabled={declineInvite.isPending}
                    className="border-supabase-border hover:bg-supabase-bg-tertiary"
                  >
                    {declineInvite.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    <span className="ml-1 hidden sm:inline">Decline</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAccept(workspace.id, workspace.name)}
                    disabled={acceptInvite.isPending}
                    className="bg-supabase-green hover:bg-supabase-green-hover text-supabase-bg"
                  >
                    {acceptInvite.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span className="ml-1">Accept</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
