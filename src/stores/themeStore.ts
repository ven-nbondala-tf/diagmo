// Theme store with Zustand for managing light/dark/system theme

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect } from 'react'
import { darkTheme, lightTheme } from '@/constants/themes'
import type { ThemeMode, Theme } from '@/types/theme'

interface ThemeState {
  mode: ThemeMode
  resolvedTheme: 'light' | 'dark'
  theme: Theme
}

interface ThemeActions {
  setMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

type ThemeStore = ThemeState & ThemeActions

// Detect system preference
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Resolve theme based on mode
function resolveTheme(mode: ThemeMode): { resolved: 'light' | 'dark'; theme: Theme } {
  if (mode === 'system') {
    const systemTheme = getSystemTheme()
    return {
      resolved: systemTheme,
      theme: systemTheme === 'dark' ? darkTheme : lightTheme,
    }
  }
  return {
    resolved: mode,
    theme: mode === 'dark' ? darkTheme : lightTheme,
  }
}

// Apply theme class to document
function applyThemeToDocument(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#1c1c1c' : '#ffffff')
  }
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => {
      const initialMode: ThemeMode = 'dark' // Default to dark
      const { resolved, theme } = resolveTheme(initialMode)

      return {
        mode: initialMode,
        resolvedTheme: resolved,
        theme,

        setMode: (mode) => {
          const { resolved, theme } = resolveTheme(mode)
          set({ mode, resolvedTheme: resolved, theme })

          // Apply to document
          applyThemeToDocument(resolved)
        },

        toggleTheme: () => {
          const currentMode = get().mode
          let newMode: ThemeMode

          if (currentMode === 'system') {
            // If system, toggle to opposite of current system preference
            newMode = getSystemTheme() === 'dark' ? 'light' : 'dark'
          } else {
            newMode = currentMode === 'dark' ? 'light' : 'dark'
          }

          const { resolved, theme } = resolveTheme(newMode)
          set({ mode: newMode, resolvedTheme: resolved, theme })
          applyThemeToDocument(resolved)
        },
      }
    },
    {
      name: 'diagmo-theme',
      version: 1,
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { resolved, theme } = resolveTheme(state.mode)
          state.resolvedTheme = resolved
          state.theme = theme
          applyThemeToDocument(resolved)
        }
      },
    }
  )
)

// Hook to listen for system theme changes
export function useSystemThemeListener() {
  const { mode, setMode } = useThemeStore()

  useEffect(() => {
    if (mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = () => {
      // Re-apply system theme when system preference changes
      setMode('system')
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [mode, setMode])
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('diagmo-theme')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      const mode = parsed.state?.mode || 'dark'
      const { resolved } = resolveTheme(mode)
      applyThemeToDocument(resolved)
    } catch {
      applyThemeToDocument('dark')
    }
  } else {
    applyThemeToDocument('dark')
  }
}
