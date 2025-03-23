import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Disable fast refresh for now to resolve the preamble error
      fastRefresh: false
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  },
  server: {
    host: 'localhost',
    port: 5173,
    cors: true,
    origin: 'http://localhost:5173'
  },
  build: {
    outDir: 'app/assets/builds/vite',
    manifest: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'main.tsx')
      }
    }
  }
})