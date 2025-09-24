import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://backend.pcsieure.click',
        changeOrigin: true,
        secure: false,
        // Thêm header này để tự động bỏ qua trang cảnh báo của ngrok
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      },
    },
  },
});
