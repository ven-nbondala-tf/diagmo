import { create } from 'zustand'
import type { CollaboratorPresence } from '@/types'
import type { NodeLock } from '@/services/collaborationService'

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting'

interface CollaborationState {
  isConnected: boolean
  connectionStatus: ConnectionStatus
  collaborators: CollaboratorPresence[]
  myPresenceId: string | null
  // Node locks - map of nodeId to lock info
  nodeLocks: Map<string, NodeLock>
  // Flag to track when applying remote changes (prevents broadcast loops)
  isApplyingRemoteChanges: boolean
  // Follow user mode - userId of the user being followed
  followingUserId: string | null
  // Spotlight - currently spotlighted element
  spotlightedNodeId: string | null
  spotlightedByUserId: string | null
  spotlightedByUserName: string | null
}

interface CollaborationActions {
  setConnected: (connected: boolean) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  setCollaborators: (collaborators: CollaboratorPresence[]) => void
  setMyPresenceId: (id: string | null) => void
  setNodeLock: (lock: NodeLock) => void
  removeNodeLock: (nodeId: string) => void
  setApplyingRemoteChanges: (applying: boolean) => void
  // Follow user actions
  followUser: (userId: string) => void
  unfollowUser: () => void
  // Spotlight actions
  setSpotlight: (nodeId: string | null, userId: string | null, userName: string | null) => void
  clearSpotlight: () => void
  reset: () => void
}

type CollaborationStore = CollaborationState & CollaborationActions

const initialState: CollaborationState = {
  isConnected: false,
  connectionStatus: 'connecting',
  collaborators: [],
  myPresenceId: null,
  nodeLocks: new Map(),
  isApplyingRemoteChanges: false,
  followingUserId: null,
  spotlightedNodeId: null,
  spotlightedByUserId: null,
  spotlightedByUserName: null,
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

  setNodeLock: (lock) => set((state) => {
    const newLocks = new Map(state.nodeLocks)
    newLocks.set(lock.nodeId, lock)
    return { nodeLocks: newLocks }
  }),

  removeNodeLock: (nodeId) => set((state) => {
    const newLocks = new Map(state.nodeLocks)
    newLocks.delete(nodeId)
    return { nodeLocks: newLocks }
  }),

  setApplyingRemoteChanges: (isApplyingRemoteChanges) => set({ isApplyingRemoteChanges }),

  // Follow user mode
  followUser: (userId) => set({ followingUserId: userId }),
  unfollowUser: () => set({ followingUserId: null }),

  // Spotlight
  setSpotlight: (nodeId, userId, userName) => set({
    spotlightedNodeId: nodeId,
    spotlightedByUserId: userId,
    spotlightedByUserName: userName,
  }),
  clearSpotlight: () => set({
    spotlightedNodeId: null,
    spotlightedByUserId: null,
    spotlightedByUserName: null,
  }),

  reset: () => set({
    ...initialState,
    nodeLocks: new Map(),
    isApplyingRemoteChanges: false,
    followingUserId: null,
    spotlightedNodeId: null,
    spotlightedByUserId: null,
    spotlightedByUserName: null,
  }),
}))
