import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxyConfig = {
  '/api': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
  },
  '/health': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
  },
  '/ready': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
  },
  '/metrics': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: proxyConfig
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    proxy: proxyConfig
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-leaflet': ['leaflet'],
          'vendor-icons': ['lucide-react']
        }
      }
    }
  }
})
