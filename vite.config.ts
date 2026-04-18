import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Local dev: proxy /api → Render backend (same target as Vercel rewrite)
      '/api': {
        target: 'https://cnpmnc-axon-be.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})