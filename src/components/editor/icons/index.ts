// Direct exports for static usage (shapes that need icons at render time)
export * from './CloudIcons'

// Lazy-loaded exports for UI components (ShapePanel) - reduces initial bundle
export { LazyCloudIcon } from './LazyCloudIcons'
