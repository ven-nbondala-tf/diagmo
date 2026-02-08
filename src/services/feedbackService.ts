import { supabase } from './supabase'

export type FeedbackType = 'bug' | 'feature' | 'question' | 'other'
export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved' | 'closed'

export interface Feedback {
  id: string
  userId: string
  type: FeedbackType
  message: string
  status: FeedbackStatus
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

interface CreateFeedbackParams {
  type: FeedbackType
  message: string
  metadata?: Record<string, unknown>
}

export const feedbackService = {
  /**
   * Submit new feedback
   */
  async create(params: CreateFeedbackParams): Promise<{ data: Feedback | null; error: Error | null }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: new Error('User must be authenticated') }
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: user.id,
        type: params.type,
        message: params.message,
        metadata: params.metadata || {},
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: new Error(error.message) }
    }

    return {
      data: {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        message: data.message,
        status: data.status,
        metadata: data.metadata,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      error: null,
    }
  },

  /**
   * Get user's feedback history
   */
  async getMyFeedback(): Promise<{ data: Feedback[]; error: Error | null }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: [], error: new Error('User must be authenticated') }
    }

    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: new Error(error.message) }
    }

    return {
      data: data.map((item) => ({
        id: item.id,
        userId: item.user_id,
        type: item.type,
        message: item.message,
        status: item.status,
        metadata: item.metadata,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })),
      error: null,
    }
  },
}
