/**
 * Lazy-loaded dialog components for better code-splitting
 *
 * These dialogs are loaded on-demand when first opened,
 * reducing the initial bundle size.
 */

import { lazy, Suspense, type ComponentType } from 'react'
import { Loader2 } from 'lucide-react'

// Loading fallback for dialogs
function DialogLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-6 w-6 animate-spin text-supabase-text-muted" />
    </div>
  )
}

// Helper to wrap lazy components with Suspense
function withSuspense<P extends object>(
  LazyComponent: ComponentType<P>,
  fallback: React.ReactNode = <DialogLoader />
) {
  return function SuspenseWrapper(props: P) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Lazy load all editor dialogs
export const LazyShareDialog = lazy(() =>
  import('../ShareDialog').then(m => ({ default: m.ShareDialog }))
)

export const LazyExportCodeDialog = lazy(() =>
  import('../ExportCodeDialog').then(m => ({ default: m.ExportCodeDialog }))
)

export const LazyEmbedDialog = lazy(() =>
  import('../EmbedDialog').then(m => ({ default: m.EmbedDialog }))
)

export const LazyAutoLayoutDialog = lazy(() =>
  import('../AutoLayoutDialog').then(m => ({ default: m.AutoLayoutDialog }))
)

export const LazyVersionDiffDialog = lazy(() =>
  import('../VersionDiffDialog').then(m => ({ default: m.VersionDiffDialog }))
)

export const LazyVersionPreviewDialog = lazy(() =>
  import('../VersionPreviewDialog').then(m => ({ default: m.VersionPreviewDialog }))
)

export const LazySaveAsTemplateDialog = lazy(() =>
  import('../SaveAsTemplateDialog').then(m => ({ default: m.SaveAsTemplateDialog }))
)

export const LazyHotkeyCustomizationDialog = lazy(() =>
  import('../HotkeyCustomizationDialog').then(m => ({ default: m.HotkeyCustomizationDialog }))
)

export const LazyGridSettingsDialog = lazy(() =>
  import('../GridSettingsDialog').then(m => ({ default: m.GridSettingsDialog }))
)

export const LazyImportMermaidDialog = lazy(() =>
  import('../ImportMermaidDialog').then(m => ({ default: m.ImportMermaidDialog }))
)

export const LazyImportDrawioDialog = lazy(() =>
  import('../ImportDrawioDialog').then(m => ({ default: m.ImportDrawioDialog }))
)

export const LazyImportTerraformDialog = lazy(() =>
  import('../ImportTerraformDialog').then(m => ({ default: m.ImportTerraformDialog }))
)

export const LazyShapeLibraryDialog = lazy(() =>
  import('../ShapeLibraryDialog').then(m => ({ default: m.ShapeLibraryDialog }))
)

export const LazyTemplateGalleryDialog = lazy(() =>
  import('../TemplateGalleryDialog').then(m => ({ default: m.TemplateGalleryDialog }))
)

// Export wrapped versions with Suspense
export { withSuspense, DialogLoader }
