import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // URL del backend Django
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),  // Reescribe la URL para eliminar el prefijo /api
      },
    },
  },
})
