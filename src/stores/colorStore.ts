import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ColorStore {
  recentColors: string[]
  addRecentColor: (color: string) => void
}

export const useColorStore = create<ColorStore>()(
  persist(
    (set, get) => ({
      recentColors: [],
      addRecentColor: (color) => {
        const recent = get().recentColors.filter((c) => c !== color)
        set({ recentColors: [color, ...recent].slice(0, 8) })
      },
    }),
    { name: 'diagmo-recent-colors' }
  )
)
