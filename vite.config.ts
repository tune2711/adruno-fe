// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // BE dev proxy
  const apiBase = env.VITE_API_BASE || 'http://127.0.0.1:5122'

  // Host public qua Nginx/Cloudflare
  const publicHost = (env.VITE_PUBLIC_HOST || 'nightfood.studio').replace(/^https?:\/\//, '')
  const baseHost = publicHost.replace(/^www\./, '')
  const allowedHosts = Array.from(new Set([
    publicHost, baseHost, `www.${baseHost}`, 'localhost', '127.0.0.1'
  ]))

  const useHttps = String(env.VITE_USE_HTTPS ?? 'true').toLowerCase() === 'true'
  const clientPort = Number(env.VITE_HMR_CLIENT_PORT || (useHttps ? 443 : 5173))

  return {
    plugins: [react()],

    // DEV (npm run dev)
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      allowedHosts,
      hmr: {
        host: publicHost,
        protocol: useHttps ? 'wss' : 'ws',
        clientPort
      },
      proxy: {
        '/api': {
          target: apiBase,
          changeOrigin: true,
          secure: false,
          headers: { 'ngrok-skip-browser-warning': 'true' },
          // rewrite: (p) => p.replace(/^\/api/, ''), // nếu BE không dùng prefix /api
        },
      },
    },

    // PREVIEW (npm run preview) -> Nginx proxy :80 -> 127.0.0.1:4173
    preview: {
      host: true,
      port: 4173,
      allowedHosts,     // FIX lỗi “host is not allowed”
    },
  }
})
