import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['dagre'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - rarely changes
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // React Flow - heavy library, separate chunk for caching
          'vendor-xyflow': ['@xyflow/react'],
          // Supabase - auth and database
          'vendor-supabase': ['@supabase/supabase-js'],
          // TanStack Query - data fetching
          'vendor-query': ['@tanstack/react-query'],
          // Export libraries - loaded on demand
          'vendor-export': ['html-to-image', 'html2canvas'],
          // Utility libraries
          'vendor-utils': ['zustand', 'nanoid', 'dagre'],
        },
      },
    },
  },
})
