import { create } from 'zustand'
import type { CollaboratorPresence } from '@/types'

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting'

interface CollaborationState {
  isConnected: boolean
  connectionStatus: ConnectionStatus
  collaborators: CollaboratorPresence[]
  myPresenceId: string | null
}

interface CollaborationActions {
  setConnected: (connected: boolean) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  setCollaborators: (collaborators: CollaboratorPresence[]) => void
  setMyPresenceId: (id: string | null) => void
  reset: () => void
}

type CollaborationStore = CollaborationState & CollaborationActions

const initialState: CollaborationState = {
  isConnected: false,
  connectionStatus: 'disconnected',
  collaborators: [],
  myPresenceId: null,
}

/**
 * Store for real-time collaboration state
 * Shared between EditorHeader (presence indicators) and DiagramEditor (cursors)
 */
export const useCollaborationStore = create<CollaborationStore>((set) => ({
  ...initialState,

  setConnected: (isConnected) => set({ isConnected }),

  setConnectionStatus: (connectionStatus) => set({
    connectionStatus,
    isConnected: connectionStatus === 'connected',
  }),

  setCollaborators: (collaborators) => set({ collaborators }),

  setMyPresenceId: (myPresenceId) => set({ myPresenceId }),

  reset: () => set(initialState),
}))
