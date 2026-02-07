// Color palettes for dark and light themes

import type { Theme } from '@/types/theme'

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    // Backgrounds (Supabase-inspired dark)
    bgPrimary: '#1c1c1c',
    bgSecondary: '#232323',
    bgTertiary: '#2a2a2a',
    bgElevated: '#303030',
    bgCanvas: '#1a1a1a',

    // Borders
    borderDefault: '#333333',
    borderSubtle: '#2a2a2a',
    borderStrong: '#444444',

    // Text
    textPrimary: '#ededed',
    textSecondary: '#a1a1a1',
    textMuted: '#666666',
    textInverse: '#1c1c1c',

    // Accent (Green - Diagmo brand)
    accentPrimary: '#3ECF8E',
    accentHover: '#2eb77a',
    accentMuted: 'rgba(62, 207, 142, 0.15)',
    accentText: '#1c1c1c',

    // Status
    success: '#3ECF8E',
    successMuted: 'rgba(62, 207, 142, 0.15)',
    warning: '#F5A623',
    warningMuted: 'rgba(245, 166, 35, 0.15)',
    error: '#F25C54',
    errorMuted: 'rgba(242, 92, 84, 0.15)',
    info: '#3B82F6',
    infoMuted: 'rgba(59, 130, 246, 0.15)',

    // Special
    selection: 'rgba(62, 207, 142, 0.3)',
    focusRing: 'rgba(62, 207, 142, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: 'rgba(0, 0, 0, 0.4)',

    // Scrollbar
    scrollbarTrack: 'transparent',
    scrollbarThumb: '#333333',
    scrollbarThumbHover: '#444444',
  },
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    // Backgrounds (Clean light theme)
    bgPrimary: '#ffffff',
    bgSecondary: '#f8f9fa',
    bgTertiary: '#f1f3f4',
    bgElevated: '#ffffff',
    bgCanvas: '#f5f5f5',

    // Borders
    borderDefault: '#e5e7eb',
    borderSubtle: '#f1f3f4',
    borderStrong: '#d1d5db',

    // Text
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    textMuted: '#9ca3af',
    textInverse: '#ffffff',

    // Accent (Same green for brand consistency)
    accentPrimary: '#10b981', // Slightly adjusted for light bg
    accentHover: '#059669',
    accentMuted: 'rgba(16, 185, 129, 0.1)',
    accentText: '#ffffff',

    // Status
    success: '#10b981',
    successMuted: 'rgba(16, 185, 129, 0.1)',
    warning: '#f59e0b',
    warningMuted: 'rgba(245, 158, 11, 0.1)',
    error: '#ef4444',
    errorMuted: 'rgba(239, 68, 68, 0.1)',
    info: '#3b82f6',
    infoMuted: 'rgba(59, 130, 246, 0.1)',

    // Special
    selection: 'rgba(16, 185, 129, 0.2)',
    focusRing: 'rgba(16, 185, 129, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.4)',
    shadow: 'rgba(0, 0, 0, 0.1)',

    // Scrollbar
    scrollbarTrack: 'transparent',
    scrollbarThumb: '#d1d5db',
    scrollbarThumbHover: '#9ca3af',
  },
}
