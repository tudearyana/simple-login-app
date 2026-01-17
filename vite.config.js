import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
// import path from 'path' // <-- Dihapus karena tidak terpakai

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = process.env;
  
  return {
    // Perbaikan: 'tailwindcss()' menjadi 'tailwindcss'
    plugins: [vue(), vueDevTools(), tailwindcss()],
    server: {
      port: 3000,
      proxy: {
        // Proxy semua request yang dimulai dengan /api ke backend
        '/api': {
          // target: 'http://10.15.115.17:8081', // IP sebelumnya
          target: 'http://192.168.254.223:8081',
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('[PROXY] Request:', req.method, req.url);
              console.log('[PROXY] Authorization header:', req.headers.authorization || 'NO AUTH HEADER');
              
              // Tambahkan API key dari environment variable
              if (env.VITE_BACKEND_API_KEY) {
                proxyReq.setHeader('X-API-Key', env.VITE_BACKEND_API_KEY);
              }
              if (env.VITE_BACKEND_SECRET_KEY) {
                proxyReq.setHeader('X-Secret-Key', env.VITE_BACKEND_SECRET_KEY);
              }
            });
            
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('[PROXY] Response:', proxyRes.statusCode, 'from', req.url);
            });
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
