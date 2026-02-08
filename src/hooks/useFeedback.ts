import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { feedbackService, type FeedbackType } from '@/services/feedbackService'
import { toast } from 'sonner'

export function useSubmitFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { type: FeedbackType; message: string }) =>
      feedbackService.create(params),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error.message)
      } else {
        toast.success('Thank you for your feedback!')
        queryClient.invalidateQueries({ queryKey: ['feedback'] })
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit feedback')
    },
  })
}

export function useMyFeedback() {
  return useQuery({
    queryKey: ['feedback'],
    queryFn: async () => {
      const result = await feedbackService.getMyFeedback()
      if (result.error) throw result.error
      return result.data
    },
  })
}
