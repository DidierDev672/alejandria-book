import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Proxy para redirigir peticiones al backend
      '/equipment/exercises': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/equipment': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/exercises': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
