import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { startApi } from './server/index.js'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'little-learners-api',
      configureServer() {
        startApi(3001)
      },
      configurePreviewServer() {
        startApi(3001)
      },
    },
  ],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3001',
    },
  },
  preview: {
    proxy: {
      '/api': 'http://127.0.0.1:3001',
    },
  },
})
