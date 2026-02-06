import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserPreferences {
  // Grid settings
  gridEnabled: boolean
  snapToGrid: boolean
  gridSize: number

  // Panel states
  propertiesPanelOpen: boolean
  shapePanelCollapsed: boolean
  layersPanelOpen: boolean

  // Interaction
  interactionMode: 'select' | 'pan'

  // Recent items
  recentTemplateIds: string[]
  recentDiagramIds: string[]

  // View preferences
  defaultZoom: number
  showMinimap: boolean
  showGrid: boolean
}

interface PreferencesActions {
  // Grid settings
  setGridEnabled: (enabled: boolean) => void
  setSnapToGrid: (snap: boolean) => void
  setGridSize: (size: number) => void

  // Panel states
  setPropertiesPanelOpen: (open: boolean) => void
  setShapePanelCollapsed: (collapsed: boolean) => void
  setLayersPanelOpen: (open: boolean) => void

  // Interaction
  setInteractionMode: (mode: 'select' | 'pan') => void

  // Recent items
  addRecentTemplate: (templateId: string) => void
  addRecentDiagram: (diagramId: string) => void
  clearRecentItems: () => void

  // View preferences
  setDefaultZoom: (zoom: number) => void
  setShowMinimap: (show: boolean) => void
  setShowGrid: (show: boolean) => void

  // Reset
  resetPreferences: () => void
}

type PreferencesStore = UserPreferences & PreferencesActions

const MAX_RECENT_ITEMS = 10

const defaultPreferences: UserPreferences = {
  gridEnabled: true,
  snapToGrid: false,
  gridSize: 10,
  propertiesPanelOpen: true,
  shapePanelCollapsed: false,
  layersPanelOpen: false,
  interactionMode: 'select',
  recentTemplateIds: [],
  recentDiagramIds: [],
  defaultZoom: 1,
  showMinimap: true,
  showGrid: true,
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      ...defaultPreferences,

      // Grid settings
      setGridEnabled: (enabled) => set({ gridEnabled: enabled }),
      setSnapToGrid: (snap) => set({ snapToGrid: snap }),
      setGridSize: (size) => set({ gridSize: size }),

      // Panel states
      setPropertiesPanelOpen: (open) => set({ propertiesPanelOpen: open }),
      setShapePanelCollapsed: (collapsed) => set({ shapePanelCollapsed: collapsed }),
      setLayersPanelOpen: (open) => set({ layersPanelOpen: open }),

      // Interaction
      setInteractionMode: (mode) => set({ interactionMode: mode }),

      // Recent items
      addRecentTemplate: (templateId) => {
        const current = get().recentTemplateIds
        const filtered = current.filter((id) => id !== templateId)
        const updated = [templateId, ...filtered].slice(0, MAX_RECENT_ITEMS)
        set({ recentTemplateIds: updated })
      },

      addRecentDiagram: (diagramId) => {
        const current = get().recentDiagramIds
        const filtered = current.filter((id) => id !== diagramId)
        const updated = [diagramId, ...filtered].slice(0, MAX_RECENT_ITEMS)
        set({ recentDiagramIds: updated })
      },

      clearRecentItems: () => set({ recentTemplateIds: [], recentDiagramIds: [] }),

      // View preferences
      setDefaultZoom: (zoom) => set({ defaultZoom: zoom }),
      setShowMinimap: (show) => set({ showMinimap: show }),
      setShowGrid: (show) => set({ showGrid: show }),

      // Reset
      resetPreferences: () => set(defaultPreferences),
    }),
    {
      name: 'diagmo-preferences',
      version: 1,
      partialize: (state) => ({
        gridEnabled: state.gridEnabled,
        snapToGrid: state.snapToGrid,
        gridSize: state.gridSize,
        propertiesPanelOpen: state.propertiesPanelOpen,
        shapePanelCollapsed: state.shapePanelCollapsed,
        layersPanelOpen: state.layersPanelOpen,
        interactionMode: state.interactionMode,
        recentTemplateIds: state.recentTemplateIds,
        recentDiagramIds: state.recentDiagramIds,
        defaultZoom: state.defaultZoom,
        showMinimap: state.showMinimap,
        showGrid: state.showGrid,
      }),
    }
  )
)

// Hook to sync preferences with editor store on mount
export function useSyncPreferencesWithEditor() {
  const preferences = usePreferencesStore()
  return preferences
}
