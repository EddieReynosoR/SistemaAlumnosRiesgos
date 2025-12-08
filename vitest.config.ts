/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',       // para apps React
    setupFiles: './src/setupTests.ts', // opcional, si tienes este archivo
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage'
    }
  }
})
