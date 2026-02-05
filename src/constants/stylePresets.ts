import type { NodeStyle } from '@/types'

export interface StylePreset {
  id: string
  name: string
  preview: {
    bg: string
    border: string
    text: string
  }
  style: Partial<NodeStyle>
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'default',
    name: 'Default',
    preview: { bg: '#ffffff', border: '#9ca3af', text: '#1f2937' },
    style: {
      backgroundColor: '#ffffff',
      backgroundOpacity: 1,
      borderColor: '#9ca3af',
      borderWidth: 1,
      borderRadius: 8,
      borderStyle: 'solid',
      textColor: '#1f2937',
      fontSize: 14,
      fontWeight: 'normal',
      shadowEnabled: false,
    },
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    preview: { bg: '#dbeafe', border: '#3b82f6', text: '#1e3a5f' },
    style: {
      backgroundColor: '#dbeafe',
      backgroundOpacity: 1,
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 4,
      borderStyle: 'solid',
      textColor: '#1e3a5f',
      fontSize: 14,
      fontWeight: 'bold',
      shadowEnabled: true,
      shadowColor: 'rgba(59,130,246,0.2)',
      shadowBlur: 8,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
    },
  },
  {
    id: 'pastel',
    name: 'Pastel',
    preview: { bg: '#fce7f3', border: '#f9a8d4', text: '#4b5563' },
    style: {
      backgroundColor: '#fce7f3',
      backgroundOpacity: 1,
      borderColor: '#f9a8d4',
      borderWidth: 1,
      borderRadius: 16,
      borderStyle: 'solid',
      textColor: '#4b5563',
      fontSize: 14,
      fontWeight: 'normal',
      shadowEnabled: false,
    },
  },
  {
    id: 'corporate',
    name: 'Corporate',
    preview: { bg: '#ffffff', border: '#6b7280', text: '#111827' },
    style: {
      backgroundColor: '#ffffff',
      backgroundOpacity: 1,
      borderColor: '#6b7280',
      borderWidth: 1,
      borderRadius: 2,
      borderStyle: 'solid',
      textColor: '#111827',
      fontSize: 13,
      fontWeight: 'normal',
      shadowEnabled: false,
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    preview: { bg: '#ecfdf5', border: '#22c55e', text: '#166534' },
    style: {
      backgroundColor: '#ecfdf5',
      backgroundOpacity: 1,
      borderColor: '#22c55e',
      borderWidth: 2,
      borderRadius: 8,
      borderStyle: 'solid',
      textColor: '#166534',
      fontSize: 14,
      fontWeight: 'bold',
      shadowEnabled: true,
      shadowColor: 'rgba(34,197,94,0.25)',
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    },
  },
]
