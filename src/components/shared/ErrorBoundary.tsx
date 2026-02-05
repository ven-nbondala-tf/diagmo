import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 gap-4 text-center min-h-[200px]">
          <AlertTriangle className="w-10 h-10 text-destructive" />
          <div>
            <h3 className="text-sm font-semibold">Something went wrong</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border bg-background hover:bg-accent transition-colors"
          >
            <RefreshCcw className="w-3 h-3" />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
