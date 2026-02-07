// Theme type definitions for dual theme system

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeColors {
  // Backgrounds
  bgPrimary: string
  bgSecondary: string
  bgTertiary: string
  bgElevated: string
  bgCanvas: string // Editor canvas background

  // Borders
  borderDefault: string
  borderSubtle: string
  borderStrong: string

  // Text
  textPrimary: string
  textSecondary: string
  textMuted: string
  textInverse: string

  // Accent (Brand color - same for both themes)
  accentPrimary: string
  accentHover: string
  accentMuted: string
  accentText: string // Text on accent background

  // Status Colors
  success: string
  successMuted: string
  warning: string
  warningMuted: string
  error: string
  errorMuted: string
  info: string
  infoMuted: string

  // Special
  selection: string
  focusRing: string
  overlay: string
  shadow: string

  // Scrollbar
  scrollbarTrack: string
  scrollbarThumb: string
  scrollbarThumbHover: string
}

export interface Theme {
  mode: 'light' | 'dark'
  colors: ThemeColors
}
