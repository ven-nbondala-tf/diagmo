import { supabase } from './supabase'
import type { DiagramComment, CommentReply } from '@/types'

interface CreateCommentInput {
  diagramId: string
  nodeId?: string
  position?: { x: number; y: number }
  content: string
}

interface CreateReplyInput {
  commentId: string
  content: string
}

export const commentService = {
  async getComments(diagramId: string): Promise<DiagramComment[]> {
    const { data, error } = await supabase
      .from('diagram_comments')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('diagram_id', diagramId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      (data || []).map(async (comment) => {
        const replies = await this.getReplies(comment.id)
        return {
          id: comment.id as string,
          diagramId: comment.diagram_id as string,
          userId: comment.user_id as string,
          userName: comment.profiles?.full_name as string | undefined,
          userAvatar: comment.profiles?.avatar_url as string | undefined,
          nodeId: comment.node_id as string | undefined,
          position: comment.position_x != null && comment.position_y != null
            ? { x: comment.position_x as number, y: comment.position_y as number }
            : undefined,
          content: comment.content as string,
          resolved: comment.resolved as boolean,
          createdAt: comment.created_at as string,
          updatedAt: comment.updated_at as string,
          replies,
        }
      })
    )

    return commentsWithReplies
  },

  async getReplies(commentId: string): Promise<CommentReply[]> {
    const { data, error } = await supabase
      .from('comment_replies')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('comment_id', commentId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data || []).map((reply) => ({
      id: reply.id as string,
      commentId: reply.comment_id as string,
      userId: reply.user_id as string,
      userName: reply.profiles?.full_name as string | undefined,
      userAvatar: reply.profiles?.avatar_url as string | undefined,
      content: reply.content as string,
      createdAt: reply.created_at as string,
    }))
  },

  async createComment(input: CreateCommentInput): Promise<DiagramComment> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('diagram_comments')
      .insert({
        diagram_id: input.diagramId,
        user_id: user.id,
        node_id: input.nodeId,
        position_x: input.position?.x,
        position_y: input.position?.y,
        content: input.content,
        resolved: false,
      })
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    return {
      id: data.id as string,
      diagramId: data.diagram_id as string,
      userId: data.user_id as string,
      userName: data.profiles?.full_name as string | undefined,
      userAvatar: data.profiles?.avatar_url as string | undefined,
      nodeId: data.node_id as string | undefined,
      position: data.position_x != null && data.position_y != null
        ? { x: data.position_x as number, y: data.position_y as number }
        : undefined,
      content: data.content as string,
      resolved: data.resolved as boolean,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
      replies: [],
    }
  },

  async updateComment(id: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('diagram_comments')
      .update({ content })
      .eq('id', id)

    if (error) throw error
  },

  async resolveComment(id: string, resolved: boolean): Promise<void> {
    const { error } = await supabase
      .from('diagram_comments')
      .update({ resolved })
      .eq('id', id)

    if (error) throw error
  },

  async deleteComment(id: string): Promise<void> {
    const { error } = await supabase
      .from('diagram_comments')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async createReply(input: CreateReplyInput): Promise<CommentReply> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('comment_replies')
      .insert({
        comment_id: input.commentId,
        user_id: user.id,
        content: input.content,
      })
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    return {
      id: data.id as string,
      commentId: data.comment_id as string,
      userId: data.user_id as string,
      userName: data.profiles?.full_name as string | undefined,
      userAvatar: data.profiles?.avatar_url as string | undefined,
      content: data.content as string,
      createdAt: data.created_at as string,
    }
  },

  async deleteReply(id: string): Promise<void> {
    const { error } = await supabase
      .from('comment_replies')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
