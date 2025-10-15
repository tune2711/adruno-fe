import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // BE cho dev proxy (đổi bằng .env nếu cần)
  const apiBase = env.VITE_API_BASE || 'http://localhost:5122'

  // Host public chạy qua Cloudflare/Nginx
  const publicHost = (env.VITE_PUBLIC_HOST || 'pcsieure.click').replace(/^https?:\/\//, '')
  const baseHost = publicHost.replace(/^www\./, '')
  const allowedHosts = Array.from(new Set([
    publicHost, baseHost, `www.${baseHost}`, 'localhost', '127.0.0.1'
  ]))

  const useHttps = String(env.VITE_USE_HTTPS ?? 'true').toLowerCase() === 'true'
  const clientPort = Number(env.VITE_HMR_CLIENT_PORT || (useHttps ? 443 : 5173))

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      allowedHosts,
      hmr: {
        host: publicHost,          // ví dụ: pcsieure.click
        protocol: useHttps ? 'wss' : 'ws',
        clientPort                 // 443 khi đi qua Cloudflare
      },
      proxy: {
        // FE gọi fetch('/api/...') -> dev proxy tới BE
        '/api': {
          target: apiBase,         // mặc định http://localhost:5122
          changeOrigin: true,
          secure: false,
          headers: { 'ngrok-skip-browser-warning': 'true' },
          // nếu BE KHÔNG có prefix /api thì mở dòng dưới:
          // rewrite: (p) => p.replace(/^\/api/, ''),
        },
      },
    },
  }
})
