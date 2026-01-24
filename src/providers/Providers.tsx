import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { TooltipProvider } from '@/components/ui'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

interface ProvidersProps {
  children: React.ReactNode
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return <>{children}</>
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthInitializer>{children}</AuthInitializer>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
