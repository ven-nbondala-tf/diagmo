import { useState } from 'react'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useAuthStore } from '@/stores/authStore'
import {
  useWorkspace,
  useWorkspaceMembers,
  useUpdateWorkspace,
  useDeleteWorkspace,
  useInviteMember,
  useUpdateMemberRole,
  useRemoveMember,
  useAcceptInvite,
  useDeclineInvite,
  useLeaveWorkspace,
  usePendingInvites,
} from '@/hooks/useWorkspaces'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
  Textarea,
  Tabs,
  TabsContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  ScrollArea,
  Separator,
} from '@/components/ui'
import { Loader2, UserPlus, Trash2, LogOut, Mail, Crown, Shield, Pencil, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils'
import type { WorkspaceRole, WorkspaceMember } from '@/types'

const roleIcons: Record<WorkspaceRole, React.ReactNode> = {
  owner: <Crown className="h-3.5 w-3.5" />,
  admin: <Shield className="h-3.5 w-3.5" />,
  editor: <Pencil className="h-3.5 w-3.5" />,
  viewer: <Eye className="h-3.5 w-3.5" />,
}

const roleLabels: Record<WorkspaceRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
}

const roleDescriptions: Record<WorkspaceRole, string> = {
  owner: 'Full access and can delete workspace',
  admin: 'Can manage members and all content',
  editor: 'Can create and edit diagrams',
  viewer: 'Can only view diagrams',
}

export function WorkspaceSettingsDialog() {
  const { user } = useAuthStore()
  const secondaryAccentColor = usePreferencesStore((state) => state.secondaryAccentColor)
  const secondaryAccentTextColor = usePreferencesStore((state) => state.secondaryAccentTextColor)
  const [activeTab, setActiveTab] = useState<'members' | 'settings'>('members')
  const {
    workspaceSettingsOpen,
    selectedWorkspaceId,
    setWorkspaceSettingsOpen,
    setCurrentWorkspace,
  } = useWorkspaceStore()

  const { data: workspace, isLoading: workspaceLoading } = useWorkspace(selectedWorkspaceId || undefined)
  const { data: members = [], isLoading: membersLoading } = useWorkspaceMembers(selectedWorkspaceId || undefined)
  const { data: pendingInvites = [] } = usePendingInvites()

  const updateWorkspace = useUpdateWorkspace()
  const deleteWorkspace = useDeleteWorkspace()
  const inviteMember = useInviteMember()
  const updateMemberRole = useUpdateMemberRole()
  const removeMember = useRemoveMember()
  const acceptInvite = useAcceptInvite()
  const declineInvite = useDeclineInvite()
  const leaveWorkspace = useLeaveWorkspace()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('editor')
  const [editingSettings, setEditingSettings] = useState(false)

  // Check if this is a pending invite for the current user
  const pendingInvite = pendingInvites.find(p => p.workspace.id === selectedWorkspaceId)
  const isPendingInvite = !!pendingInvite

  // Find current user's role
  const currentUserMember = members.find(m => m.userId === user?.id)
  const isOwner = workspace?.ownerId === user?.id
  const isAdmin = isOwner || currentUserMember?.role === 'admin'
  const canManageMembers = isAdmin

  // Initialize form when workspace loads
  const initializeForm = () => {
    if (workspace) {
      setName(workspace.name)
      setDescription(workspace.description || '')
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditingSettings(false)
      setInviteEmail('')
      setInviteRole('editor')
    }
    setWorkspaceSettingsOpen(open, open ? selectedWorkspaceId : null)
  }

  const handleSaveSettings = async () => {
    if (!selectedWorkspaceId || !name.trim()) return

    const result = await updateWorkspace.mutateAsync({
      id: selectedWorkspaceId,
      name: name.trim(),
      description: description.trim() || undefined,
    })

    if (result.success) {
      toast.success('Workspace updated')
      setEditingSettings(false)
    } else {
      toast.error(result.error || 'Failed to update workspace')
    }
  }

  const handleInvite = async () => {
    if (!selectedWorkspaceId || !inviteEmail.trim()) return

    const result = await inviteMember.mutateAsync({
      workspaceId: selectedWorkspaceId,
      email: inviteEmail.trim(),
      role: inviteRole,
    })

    if (result.success) {
      toast.success(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      setInviteRole('editor')
    } else {
      toast.error(result.error || 'Failed to send invitation')
    }
  }

  const handleUpdateRole = async (memberId: string, role: WorkspaceRole) => {
    if (!selectedWorkspaceId) return

    const result = await updateMemberRole.mutateAsync({
      memberId,
      role,
      workspaceId: selectedWorkspaceId,
    })

    if (result.success) {
      toast.success('Role updated')
    } else {
      toast.error(result.error || 'Failed to update role')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedWorkspaceId) return

    const result = await removeMember.mutateAsync({
      memberId,
      workspaceId: selectedWorkspaceId,
    })

    if (result.success) {
      toast.success('Member removed')
    } else {
      toast.error(result.error || 'Failed to remove member')
    }
  }

  const handleAcceptInvite = async () => {
    if (!selectedWorkspaceId) return

    const result = await acceptInvite.mutateAsync(selectedWorkspaceId)

    if (result.success) {
      toast.success('Invitation accepted! Welcome to the workspace.')
      setCurrentWorkspace(selectedWorkspaceId)
      handleOpenChange(false)
    } else {
      toast.error(result.error || 'Failed to accept invitation')
    }
  }

  const handleDeclineInvite = async () => {
    if (!selectedWorkspaceId) return

    const result = await declineInvite.mutateAsync(selectedWorkspaceId)

    if (result.success) {
      toast.success('Invitation declined')
      handleOpenChange(false)
    } else {
      toast.error(result.error || 'Failed to decline invitation')
    }
  }

  const handleLeave = async () => {
    if (!selectedWorkspaceId) return

    const result = await leaveWorkspace.mutateAsync(selectedWorkspaceId)

    if (result.success) {
      toast.success('You have left the workspace')
      setCurrentWorkspace(null)
      handleOpenChange(false)
    } else {
      toast.error(result.error || 'Failed to leave workspace')
    }
  }

  const handleDelete = async () => {
    if (!selectedWorkspaceId) return

    const result = await deleteWorkspace.mutateAsync(selectedWorkspaceId)

    if (result.success) {
      toast.success('Workspace deleted')
      setCurrentWorkspace(null)
      handleOpenChange(false)
    } else {
      toast.error(result.error || 'Failed to delete workspace')
    }
  }

  if (workspaceLoading) {
    return (
      <Dialog open={workspaceSettingsOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Pending invite view
  if (isPendingInvite && pendingInvite) {
    return (
      <Dialog open={workspaceSettingsOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Workspace Invitation</DialogTitle>
            <DialogDescription>
              You have been invited to join this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Workspace</Label>
                <p className="text-lg font-semibold">{pendingInvite.workspace.name}</p>
                {pendingInvite.workspace.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {pendingInvite.workspace.description}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Your Role</Label>
                <div className="flex items-center gap-2 mt-1">
                  {roleIcons[pendingInvite.invite.role]}
                  <span className="font-medium">{roleLabels[pendingInvite.invite.role]}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {roleDescriptions[pendingInvite.invite.role]}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleDeclineInvite}
              disabled={declineInvite.isPending}
            >
              {declineInvite.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Decline
            </Button>
            <Button onClick={handleAcceptInvite} disabled={acceptInvite.isPending}>
              {acceptInvite.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Accept Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  if (!workspace) return null

  return (
    <Dialog open={workspaceSettingsOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{workspace.name}</DialogTitle>
          <DialogDescription>
            Manage workspace settings and members
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'members' | 'settings')} className="mt-2">
          <div className="grid w-full grid-cols-2 bg-supabase-bg-tertiary rounded-lg p-1 gap-1">
            <button
              onClick={() => setActiveTab('members')}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-all',
                activeTab === 'members'
                  ? 'font-medium shadow-sm'
                  : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-secondary/50'
              )}
              style={activeTab === 'members' ? { backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor } : undefined}
            >
              Members
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-all',
                activeTab === 'settings'
                  ? 'font-medium shadow-sm'
                  : 'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-secondary/50'
              )}
              style={activeTab === 'settings' ? { backgroundColor: secondaryAccentColor, color: secondaryAccentTextColor } : undefined}
            >
              Settings
            </button>
          </div>

          <TabsContent value="members" className="mt-4">
            {/* Invite form */}
            {canManageMembers && (
              <div className="space-y-3 mb-4">
                <Label>Invite Member</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Email address"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={inviteRole}
                    onValueChange={(v) => setInviteRole(v as WorkspaceRole)}
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleInvite}
                    disabled={inviteMember.isPending || !inviteEmail.trim()}
                  >
                    {inviteMember.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <Separator className="my-4" />

            {/* Members list */}
            <ScrollArea className="h-[280px] pr-4">
              {membersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      isCurrentUser={member.userId === user?.id}
                      canManage={canManageMembers && member.role !== 'owner'}
                      onUpdateRole={(role) => handleUpdateRole(member.id, role)}
                      onRemove={() => handleRemoveMember(member.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Leave workspace button (for non-owners) */}
            {!isOwner && currentUserMember && (
              <div className="mt-4 pt-4 border-t">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave Workspace
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave Workspace?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will lose access to all diagrams in this workspace.
                        You&apos;ll need a new invitation to rejoin.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLeave}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Leave Workspace
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-4 space-y-4">
            {editingSettings ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ws-name">Name</Label>
                  <Input
                    id="ws-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ws-desc">Description</Label>
                  <Textarea
                    id="ws-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingSettings(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveSettings}
                    disabled={updateWorkspace.isPending}
                  >
                    {updateWorkspace.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="mt-1">{workspace.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1 text-sm">
                    {workspace.description || 'No description'}
                  </p>
                </div>
                {isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      initializeForm()
                      setEditingSettings(true)
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Settings
                  </Button>
                )}
              </>
            )}

            {/* Delete workspace (owner only) */}
            {isOwner && (
              <div className="pt-6 border-t">
                <h4 className="text-sm font-medium text-destructive mb-2">Danger Zone</h4>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Workspace
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Workspace?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All diagrams in this workspace
                        will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Workspace
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

interface MemberRowProps {
  member: WorkspaceMember
  isCurrentUser: boolean
  canManage: boolean
  onUpdateRole: (role: WorkspaceRole) => void
  onRemove: () => void
}

function MemberRow({ member, isCurrentUser, canManage, onUpdateRole, onRemove }: MemberRowProps) {
  const isPending = !member.acceptedAt

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          {member.userAvatar ? (
            <img
              src={member.userAvatar}
              alt=""
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <span className="text-xs font-medium text-primary">
              {(member.userName ?? member.email ?? '?')[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {member.userName || member.email}
            </span>
            {isCurrentUser && (
              <Badge variant="outline" className="text-[10px]">You</Badge>
            )}
            {isPending && (
              <Badge variant="secondary" className="text-[10px]">
                <Mail className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>
          {member.userName && member.email && (
            <p className="text-xs text-muted-foreground">{member.email}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {canManage && !isPending ? (
          <Select
            value={member.role}
            onValueChange={(v) => onUpdateRole(v as WorkspaceRole)}
          >
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge
            variant="secondary"
            className={cn(
              'text-xs',
              member.role === 'owner' && 'bg-amber-500/10 text-amber-600'
            )}
          >
            {roleIcons[member.role]}
            <span className="ml-1">{roleLabels[member.role]}</span>
          </Badge>
        )}

        {canManage && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
