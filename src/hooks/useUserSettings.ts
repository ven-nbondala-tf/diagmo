import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userSettingsService, type UpdateUserSettingsParams } from '@/services/userSettingsService'
import { useThemeStore } from '@/stores/themeStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useEffect } from 'react'

export function useUserSettings() {
  const { setMode } = useThemeStore()
  const { setAutoSave, setShowMinimap, setShowGrid, setSnapToGrid, setGridSize, setDefaultZoom } = usePreferencesStore()

  const query = useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const result = await userSettingsService.get()
      if (result.error) throw result.error
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Sync settings to local stores when loaded
  useEffect(() => {
    if (query.data) {
      setMode(query.data.theme)
      setAutoSave(query.data.autoSave)
      setShowMinimap(query.data.showMinimap)
      setShowGrid(query.data.showGrid)
      setSnapToGrid(query.data.snapToGrid)
      setGridSize(query.data.gridSize)
      setDefaultZoom(query.data.defaultZoom)
    }
  }, [query.data, setMode, setAutoSave, setShowMinimap, setShowGrid, setSnapToGrid, setGridSize, setDefaultZoom])

  return query
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient()
  const { setMode } = useThemeStore()
  const { setAutoSave, setShowMinimap, setShowGrid, setSnapToGrid, setGridSize, setDefaultZoom } = usePreferencesStore()

  return useMutation({
    mutationFn: (params: UpdateUserSettingsParams) =>
      userSettingsService.update(params),
    onSuccess: (result) => {
      if (result.error) {
        console.error('Failed to update settings:', result.error)
      } else if (result.data) {
        // Update local stores
        setMode(result.data.theme)
        setAutoSave(result.data.autoSave)
        setShowMinimap(result.data.showMinimap)
        setShowGrid(result.data.showGrid)
        setSnapToGrid(result.data.snapToGrid)
        setGridSize(result.data.gridSize)
        setDefaultZoom(result.data.defaultZoom)

        queryClient.invalidateQueries({ queryKey: ['user-settings'] })
      }
    },
  })
}
