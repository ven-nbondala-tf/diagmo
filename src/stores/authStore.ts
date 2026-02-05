import { create } from 'zustand'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'

interface AuthState {
  user: SupabaseUser | null
  session: Session | null
  loading: boolean
  error: string | null
  initialized: boolean
}

interface AuthActions {
  setUser: (user: SupabaseUser | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setInitialized: (initialized: boolean) => void
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  clearError: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  (set, get) => ({
      user: null,
      session: null,
      loading: false,
      error: null,
      initialized: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setInitialized: (initialized) => set({ initialized }),
      clearError: () => set({ error: null }),

      signUp: async (email, password, fullName) => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          })

          if (error) throw error

          set({
            user: data.user,
            session: data.session,
            loading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Sign up failed',
            loading: false,
          })
          throw error
        }
      },

      signIn: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) throw error

          set({
            user: data.user,
            session: data.session,
            loading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Sign in failed',
            loading: false,
          })
          throw error
        }
      },

      signOut: async () => {
        set({ loading: true, error: null })
        try {
          const { error } = await supabase.auth.signOut()
          if (error) throw error

          set({
            user: null,
            session: null,
            loading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Sign out failed',
            loading: false,
          })
          throw error
        }
      },

      initialize: async () => {
        if (get().initialized) return

        set({ loading: true })
        try {
          const { data: { session }, error } = await supabase.auth.getSession()

          if (error) throw error

          set({
            user: session?.user ?? null,
            session,
            loading: false,
            initialized: true,
          })

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            set({
              user: session?.user ?? null,
              session,
            })
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Initialization failed',
            loading: false,
            initialized: true,
          })
        }
      },
    })
)
