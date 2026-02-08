import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import {
  HelpCircle,
  Settings,
  User,
  LogOut,
  Search,
  ChevronRight,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { ProfileDialog } from '@/components/shared/ProfileDialog'
import { SettingsDialog } from '@/components/shared/SettingsDialog'
import { NotificationsDropdown } from '@/components/shared/NotificationsDropdown'
import { FeedbackDialog } from '@/components/shared/FeedbackDialog'
import { HelpDialog } from '@/components/shared/HelpDialog'

interface TopBarProps {
  breadcrumbs?: { label: string; href?: string }[]
  actions?: React.ReactNode
  showSearch?: boolean
}

export function TopBar({ breadcrumbs, actions, showSearch = true }: TopBarProps) {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()

  // Dialog states
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Get initials for avatar
  const getInitials = (email?: string): string => {
    if (!email) return 'U'
    const localPart = email.split('@')[0] ?? ''
    if (!localPart) return 'U'
    const parts = localPart.split(/[._-]/)
    const first = parts[0]
    const second = parts[1]
    if (parts.length >= 2 && first && second && first.length > 0 && second.length > 0) {
      const char1 = first.charAt(0)
      const char2 = second.charAt(0)
      return (char1 + char2).toUpperCase()
    }
    return localPart.slice(0, 2).toUpperCase()
  }

  return (
    <>
      <header className="h-14 bg-supabase-bg border-b border-supabase-border flex items-center justify-between px-4">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs?.map((crumb, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="w-4 h-4 text-supabase-text-muted" />}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="text-supabase-text-secondary hover:text-supabase-text-primary transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-supabase-text-primary">{crumb.label}</span>
              )}
            </div>
          ))}
        </div>

        {/* Center: Search (optional) */}
        {showSearch && (
          <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-supabase-bg-secondary border border-supabase-border text-sm text-supabase-text-muted hover:text-supabase-text-secondary hover:border-supabase-border-strong transition-colors cursor-pointer">
            <Search className="w-4 h-4" />
            <span>Search...</span>
            <div className="flex items-center gap-1 ml-4">
              <kbd className="px-1.5 py-0.5 text-[10px] bg-supabase-bg-tertiary rounded border border-supabase-border">
                Ctrl
              </kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-supabase-bg-tertiary rounded border border-supabase-border">
                K
              </kbd>
            </div>
          </button>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Custom Actions */}
          {actions}

          {/* Feedback */}
          <button
            onClick={() => setFeedbackOpen(true)}
            className="px-3 py-1.5 text-sm text-supabase-text-secondary hover:text-supabase-text-primary transition-colors hidden lg:block cursor-pointer"
          >
            Feedback
          </button>

          {/* Theme Switcher */}
          <ThemeSwitcher showLabel={false} />

          {/* Help */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setHelpOpen(true)}
                className="p-2 rounded-md text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Help</TooltipContent>
          </Tooltip>

          {/* Notifications */}
          <NotificationsDropdown />

          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-md text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-md hover:bg-supabase-bg-tertiary transition-colors cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {getInitials(user?.email)}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-supabase-bg-secondary border-supabase-border">
              <DropdownMenuLabel className="border-b border-supabase-border pb-2">
                <p className="text-sm font-medium text-supabase-text-primary">Account</p>
                <p className="text-xs text-supabase-text-muted truncate">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setProfileOpen(true)}
                className="text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary cursor-pointer"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSettingsOpen(true)}
                className="text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-supabase-border" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Dialogs */}
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  )
}
