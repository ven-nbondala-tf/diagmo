import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WorkspaceState {
  // Current workspace ID - null means personal space
  currentWorkspaceId: string | null

  // UI state
  workspaceSwitcherOpen: boolean
  workspaceSettingsOpen: boolean
  selectedWorkspaceId: string | null // For settings dialog
}

interface WorkspaceActions {
  setCurrentWorkspace: (id: string | null) => void
  setWorkspaceSwitcherOpen: (open: boolean) => void
  setWorkspaceSettingsOpen: (open: boolean, workspaceId?: string | null) => void
  reset: () => void
}

type WorkspaceStore = WorkspaceState & WorkspaceActions

const defaultState: WorkspaceState = {
  currentWorkspaceId: null,
  workspaceSwitcherOpen: false,
  workspaceSettingsOpen: false,
  selectedWorkspaceId: null,
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      ...defaultState,

      setCurrentWorkspace: (id) => set({ currentWorkspaceId: id }),

      setWorkspaceSwitcherOpen: (open) => set({ workspaceSwitcherOpen: open }),

      setWorkspaceSettingsOpen: (open, workspaceId) =>
        set({
          workspaceSettingsOpen: open,
          selectedWorkspaceId: workspaceId ?? null,
        }),

      reset: () => set(defaultState),
    }),
    {
      name: 'diagmo-workspace',
      version: 1,
      partialize: (state) => ({
        // Only persist the current workspace selection
        currentWorkspaceId: state.currentWorkspaceId,
      }),
    }
  )
)
