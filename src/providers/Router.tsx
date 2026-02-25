import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth'
import { GlobalSearch, useGlobalSearch } from '@/components/shared/GlobalSearch'
import { Loader2 } from 'lucide-react'

// Lazy load all page components for code splitting
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('@/pages/SignupPage').then(m => ({ default: m.SignupPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const EditorPage = lazy(() => import('@/pages/EditorPage').then(m => ({ default: m.EditorPage })))
const EmbedPage = lazy(() => import('@/pages/EmbedPage').then(m => ({ default: m.EmbedPage })))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  )
}

// Global search wrapper
function GlobalSearchWrapper({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useGlobalSearch()
  return (
    <>
      {children}
      <GlobalSearch open={open} onOpenChange={setOpen} />
    </>
  )
}

export function Router() {
  return (
    <BrowserRouter>
      <GlobalSearchWrapper>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/:id"
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            }
          />
          <Route path="/embed/:id" element={<EmbedPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
      </GlobalSearchWrapper>
    </BrowserRouter>
  )
}
