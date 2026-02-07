// Theme Provider - Wraps the app and manages theme state

import { useEffect } from 'react'
import { useThemeStore, useSystemThemeListener } from '@/stores/themeStore'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { resolvedTheme } = useThemeStore()

  // Listen for system theme changes
  useSystemThemeListener()

  // Apply theme class on mount and changes
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  return <>{children}</>
}
