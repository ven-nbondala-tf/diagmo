import { useEffect } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

/**
 * Hook to sync user preferences from localStorage with the editor store.
 * Call this once at the top level of the editor to restore preferences on mount.
 */
export function usePreferencesSync() {
  const preferences = usePreferencesStore()

  // Editor store setters
  const setGridEnabled = useEditorStore((state) => state.setGridEnabled)
  const setSnapToGrid = useEditorStore((state) => state.setSnapToGrid)
  const setGridSize = useEditorStore((state) => state.setGridSize)
  const setPropertiesPanelOpen = useEditorStore((state) => state.setPropertiesPanelOpen)
  const setShapePanelCollapsed = useEditorStore((state) => state.setShapePanelCollapsed)
  const setLayersPanelOpen = useEditorStore((state) => state.setLayersPanelOpen)
  const setInteractionMode = useEditorStore((state) => state.setInteractionMode)

  // Sync preferences to editor store on mount
  useEffect(() => {
    // Only sync if preferences have been loaded from localStorage
    if (preferences.gridEnabled !== undefined) {
      setGridEnabled(preferences.gridEnabled)
    }
    if (preferences.snapToGrid !== undefined) {
      setSnapToGrid(preferences.snapToGrid)
    }
    if (preferences.gridSize !== undefined) {
      setGridSize(preferences.gridSize)
    }
    if (preferences.propertiesPanelOpen !== undefined) {
      setPropertiesPanelOpen(preferences.propertiesPanelOpen)
    }
    if (preferences.shapePanelCollapsed !== undefined) {
      setShapePanelCollapsed(preferences.shapePanelCollapsed)
    }
    if (preferences.layersPanelOpen !== undefined) {
      setLayersPanelOpen(preferences.layersPanelOpen)
    }
    if (preferences.interactionMode !== undefined) {
      setInteractionMode(preferences.interactionMode)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  return preferences
}

/**
 * Hook to save editor state changes to preferences.
 * Subscribe to editor store changes and update preferences accordingly.
 */
export function usePreferencesPersist() {
  const gridEnabled = useEditorStore((state) => state.gridEnabled)
  const snapToGrid = useEditorStore((state) => state.snapToGrid)
  const gridSize = useEditorStore((state) => state.gridSize)
  const propertiesPanelOpen = useEditorStore((state) => state.propertiesPanelOpen)
  const shapePanelCollapsed = useEditorStore((state) => state.shapePanelCollapsed)
  const layersPanelOpen = useEditorStore((state) => state.layersPanelOpen)
  const interactionMode = useEditorStore((state) => state.interactionMode)

  const setGridEnabledPref = usePreferencesStore((state) => state.setGridEnabled)
  const setSnapToGridPref = usePreferencesStore((state) => state.setSnapToGrid)
  const setGridSizePref = usePreferencesStore((state) => state.setGridSize)
  const setPropertiesPanelOpenPref = usePreferencesStore((state) => state.setPropertiesPanelOpen)
  const setShapePanelCollapsedPref = usePreferencesStore((state) => state.setShapePanelCollapsed)
  const setLayersPanelOpenPref = usePreferencesStore((state) => state.setLayersPanelOpen)
  const setInteractionModePref = usePreferencesStore((state) => state.setInteractionMode)

  // Persist grid settings when they change
  useEffect(() => {
    setGridEnabledPref(gridEnabled)
  }, [gridEnabled, setGridEnabledPref])

  useEffect(() => {
    setSnapToGridPref(snapToGrid)
  }, [snapToGrid, setSnapToGridPref])

  useEffect(() => {
    setGridSizePref(gridSize)
  }, [gridSize, setGridSizePref])

  // Persist panel states when they change
  useEffect(() => {
    setPropertiesPanelOpenPref(propertiesPanelOpen)
  }, [propertiesPanelOpen, setPropertiesPanelOpenPref])

  useEffect(() => {
    setShapePanelCollapsedPref(shapePanelCollapsed)
  }, [shapePanelCollapsed, setShapePanelCollapsedPref])

  useEffect(() => {
    setLayersPanelOpenPref(layersPanelOpen)
  }, [layersPanelOpen, setLayersPanelOpenPref])

  useEffect(() => {
    setInteractionModePref(interactionMode)
  }, [interactionMode, setInteractionModePref])
}
