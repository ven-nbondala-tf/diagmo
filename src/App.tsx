import { Providers, Router } from '@/providers'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <Router />
      </Providers>
    </ErrorBoundary>
  )
}

export default App
