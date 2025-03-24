import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
    })
  ],
  css: {
    // Make sure CSS modules are properly handled
    modules: {
      localsConvention: 'camelCase',
    },
    // Ensure all CSS dependencies are processed
    preprocessorOptions: {
      postcss: {
        plugins: ['tailwindcss', 'autoprefixer'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'components': path.resolve(__dirname, 'components'),
    }
  },
  server: {
    port: 5173,
    strictPort: false, // Allow Vite to use a different port if 5173 is in use
    hmr: {
      protocol: 'ws',
    },
    // Ensure proper headers for loading assets
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  build: {
    outDir: 'app/assets/builds/vite',
    manifest: true,
    assetsInlineLimit: 0, // Don't inline any assets
    cssCodeSplit: true, // Split CSS into chunks
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'main.tsx')
      }
    }
  }
})