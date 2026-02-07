// Theme Switch - Animated toggle switch

import { useThemeStore } from '@/stores/themeStore'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/utils'

interface ThemeSwitchProps {
  className?: string
}

export function ThemeSwitch({ className }: ThemeSwitchProps) {
  const { resolvedTheme, toggleTheme } = useThemeStore()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative w-14 h-7 rounded-full transition-colors duration-300',
        isDark ? 'bg-supabase-bg-tertiary' : 'bg-supabase-green/20',
        className
      )}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Track icons */}
      <Sun className="absolute left-1.5 top-1.5 w-4 h-4 text-yellow-500" />
      <Moon className="absolute right-1.5 top-1.5 w-4 h-4 text-blue-400" />

      {/* Thumb */}
      <div
        className={cn(
          'absolute top-0.5 w-6 h-6 rounded-full bg-supabase-bg-elevated shadow-md',
          'transition-transform duration-300 ease-in-out',
          isDark ? 'translate-x-7' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}
