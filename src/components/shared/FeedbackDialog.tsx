import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Label,
  Textarea,
} from '@/components/ui'
import { MessageSquare, Bug, Lightbulb, HelpCircle, Loader2, Check } from 'lucide-react'
import { cn } from '@/utils'
import { toast } from 'sonner'
import { useSubmitFeedback } from '@/hooks/useFeedback'

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FeedbackType = 'bug' | 'feature' | 'question' | 'other'

const feedbackTypes = [
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-400' },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-400' },
  { value: 'question', label: 'Question', icon: HelpCircle, color: 'text-blue-400' },
  { value: 'other', label: 'Other', icon: MessageSquare, color: 'text-purple-400' },
] as const

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [type, setType] = useState<FeedbackType>('feature')
  const [message, setMessage] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const submitFeedback = useSubmitFeedback()

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Please enter your feedback')
      return
    }

    try {
      await submitFeedback.mutateAsync({ type, message: message.trim() })

      setIsSubmitted(true)

      // Reset and close after showing success
      setTimeout(() => {
        setIsSubmitted(false)
        setMessage('')
        setType('feature')
        onOpenChange(false)
      }, 2000)
    } catch {
      // Error is handled in the hook
    }
  }

  const handleClose = () => {
    if (!submitFeedback.isPending) {
      setMessage('')
      setType('feature')
      setIsSubmitted(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-supabase-green/10 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-supabase-green" />
            </div>
            <h3 className="text-lg font-semibold text-supabase-text-primary mb-2">
              Thank you for your feedback!
            </h3>
            <p className="text-sm text-supabase-text-muted text-center">
              We appreciate you taking the time to help us improve Diagmo.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Send Feedback</DialogTitle>
              <DialogDescription>
                Help us improve Diagmo by sharing your thoughts, reporting bugs, or suggesting features.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Feedback Type */}
              <div>
                <Label className="mb-2 block">What type of feedback?</Label>
                <div className="grid grid-cols-4 gap-2">
                  {feedbackTypes.map(({ value, label, icon: Icon, color }) => (
                    <button
                      key={value}
                      onClick={() => setType(value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all cursor-pointer',
                        type === value
                          ? 'border-supabase-green bg-supabase-green/5'
                          : 'border-supabase-border hover:border-supabase-border-strong'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', type === value ? 'text-supabase-green' : color)} />
                      <span className={cn(
                        'text-xs font-medium',
                        type === value ? 'text-supabase-green' : 'text-supabase-text-secondary'
                      )}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message" className="mb-2 block">Your feedback</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    type === 'bug'
                      ? 'Please describe the bug and steps to reproduce it...'
                      : type === 'feature'
                      ? 'Describe the feature you would like to see...'
                      : type === 'question'
                      ? 'What would you like to know?'
                      : 'Share your thoughts...'
                  }
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Info */}
              <p className="text-xs text-supabase-text-muted">
                Your feedback will be reviewed by our team. For urgent issues, please contact support directly.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={submitFeedback.isPending}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitFeedback.isPending || !message.trim()}>
                {submitFeedback.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Feedback
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
