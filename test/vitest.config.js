import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// a projekt gyokere, hogy a /src importok ugyanugy mukodjenek, mint a Vite alatt
const root = path.resolve(import.meta.dirname, '..')

export default defineConfig({
  root,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/js/**/*.test.jsx'],
    setupFiles: [path.join(root, 'test/js/setup.js')],
    restoreMocks: true,
    css: false
  }
})
