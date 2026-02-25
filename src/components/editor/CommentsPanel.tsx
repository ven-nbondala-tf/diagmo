import { useState, useEffect } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { commentService } from '@/services/commentService'
import { cn } from '@/utils'
import {
  Button,
  ScrollArea,
  Input,
} from '@/components/ui'
import {
  MessageSquare,
  Trash2,
  Check,
  X,
  RotateCcw,
  PanelRightClose,
  Send,
  Reply,
  AlertCircle,
  User,
} from 'lucide-react'
import type { DiagramComment } from '@/types'

interface CommentsPanelProps {
  diagramId: string
}

export function CommentsPanel({ diagramId }: CommentsPanelProps) {
  const [comments, setComments] = useState<DiagramComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [showResolved, setShowResolved] = useState(false)

  const selectedNodes = useEditorStore((state) => state.selectedNodes)
  const nodes = useEditorStore((state) => state.nodes)
  const toggleCommentsPanel = useEditorStore((state) => state.toggleCommentsPanel)

  const fetchComments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await commentService.getComments(diagramId)
      setComments(data)
    } catch (err) {
      setError('Failed to load comments')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [diagramId])

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      setSubmitting(true)
      const comment = await commentService.createComment({
        diagramId,
        nodeId: selectedNodes.length === 1 ? selectedNodes[0] : undefined,
        content: newComment.trim(),
      })
      setComments((prev) => [comment, ...prev])
      setNewComment('')
    } catch (err) {
      setError('Failed to add comment')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleResolve = async (id: string, resolved: boolean) => {
    try {
      await commentService.resolveComment(id, resolved)
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, resolved } : c))
      )
    } catch (err) {
      setError('Failed to update comment')
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await commentService.deleteComment(id)
      setComments((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError('Failed to delete comment')
      console.error(err)
    }
  }

  const handleAddReply = async (commentId: string) => {
    if (!replyContent.trim()) return

    try {
      setSubmitting(true)
      const reply = await commentService.createReply({
        commentId,
        content: replyContent.trim(),
      })
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, replies: [...(c.replies || []), reply] }
            : c
        )
      )
      setReplyingTo(null)
      setReplyContent('')
    } catch (err) {
      setError('Failed to add reply')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    try {
      await commentService.deleteReply(replyId)
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, replies: c.replies?.filter((r) => r.id !== replyId) }
            : c
        )
      )
    } catch (err) {
      setError('Failed to delete reply')
      console.error(err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getNodeLabel = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    return node?.data.label || node?.data.type || 'Shape'
  }

  const filteredComments = showResolved
    ? comments
    : comments.filter((c) => !c.resolved)

  const unresolvedCount = comments.filter((c) => !c.resolved).length

  return (
    <div className="w-72 flex-shrink-0 border-l border-supabase-border bg-supabase-bg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-supabase-border bg-supabase-bg-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-supabase-text-muted" />
            <h2 className="font-semibold text-sm text-supabase-text-primary">Comments</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-supabase-text-muted hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
            onClick={toggleCommentsPanel}
            title="Close Panel"
          >
            <PanelRightClose className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-supabase-text-muted">
            {unresolvedCount} open, {comments.length - unresolvedCount} resolved
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2 text-supabase-text-secondary hover:text-supabase-text-primary hover:bg-supabase-bg-tertiary"
            onClick={() => setShowResolved(!showResolved)}
          >
            {showResolved ? 'Hide Resolved' : 'Show All'}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-destructive/10 border-b flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Add comment */}
      <div className="p-3 border-b border-supabase-border">
        <div className="flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="h-8 text-xs bg-supabase-bg-secondary border-supabase-border text-supabase-text-primary placeholder:text-supabase-text-muted focus:border-supabase-green/50"
            placeholder={
              selectedNodes.length === 1 && selectedNodes[0]
                ? `Comment on "${getNodeLabel(selectedNodes[0])}"...`
                : 'Add a comment...'
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleAddComment()
              }
            }}
          />
          <Button
            variant="default"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleAddComment}
            disabled={submitting || !newComment.trim()}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
        {selectedNodes.length === 1 && selectedNodes[0] && (
          <p className="text-xs text-muted-foreground mt-1">
            Attaching to: {getNodeLabel(selectedNodes[0])}
          </p>
        )}
      </div>

      {/* Comments list */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Loading comments...
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="p-4 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No comments yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Select a shape and add a comment
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  'p-3 rounded-md border bg-background',
                  comment.resolved && 'opacity-60'
                )}
              >
                {/* Comment header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      {comment.userAvatar ? (
                        <img
                          src={comment.userAvatar}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <User className="w-3 h-3 text-primary" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-medium">
                        {comment.userName || 'You'}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => handleResolve(comment.id, !comment.resolved)}
                      title={comment.resolved ? 'Reopen' : 'Resolve'}
                    >
                      {comment.resolved ? (
                        <RotateCcw className="w-3 h-3" />
                      ) : (
                        <Check className="w-3 h-3 text-green-600" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(comment.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Attached to node */}
                {comment.nodeId && (
                  <div className="text-xs text-muted-foreground mb-1">
                    On: {getNodeLabel(comment.nodeId)}
                  </div>
                )}

                {/* Comment content */}
                <p className="text-sm">{comment.content}</p>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 pl-4 border-l space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {reply.userName || 'You'}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">
                              {formatDate(reply.createdAt)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 text-destructive hover:text-destructive"
                              onClick={() =>
                                handleDeleteReply(comment.id, reply.id)
                              }
                            >
                              <X className="w-2.5 h-2.5" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-0.5">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                {replyingTo === comment.id ? (
                  <div className="mt-2 flex gap-1">
                    <Input
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Reply..."
                      className="h-7 text-xs"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddReply(comment.id)
                        }
                        if (e.key === 'Escape') {
                          setReplyingTo(null)
                          setReplyContent('')
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleAddReply(comment.id)}
                      disabled={!replyContent.trim()}
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyContent('')
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-6 text-xs px-2"
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
