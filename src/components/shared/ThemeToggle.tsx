// Theme Toggle - Simple button to toggle between dark/light

import { useThemeStore } from '@/stores/themeStore'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative p-2 rounded-md transition-colors',
        'text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary',
        className
      )}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon (visible in dark mode) */}
      <Sun
        className={cn(
          'w-4 h-4 transition-all duration-300',
          resolvedTheme === 'dark'
            ? 'rotate-0 scale-100'
            : 'rotate-90 scale-0 absolute'
        )}
      />
      {/* Moon icon (visible in light mode) */}
      <Moon
        className={cn(
          'w-4 h-4 transition-all duration-300',
          resolvedTheme === 'light'
            ? 'rotate-0 scale-100'
            : '-rotate-90 scale-0 absolute'
        )}
      />
    </button>
  )
}
