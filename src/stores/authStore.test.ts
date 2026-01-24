import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      loading: false,
      error: null,
      initialized: false,
    })
  })

  it('should have initial state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.session).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.initialized).toBe(false)
  })

  it('should set loading state', () => {
    useAuthStore.getState().setLoading(true)
    expect(useAuthStore.getState().loading).toBe(true)
  })

  it('should set error state', () => {
    useAuthStore.getState().setError('Test error')
    expect(useAuthStore.getState().error).toBe('Test error')
  })

  it('should clear error', () => {
    useAuthStore.getState().setError('Test error')
    useAuthStore.getState().clearError()
    expect(useAuthStore.getState().error).toBeNull()
  })
})
