import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Bất kỳ yêu cầu nào bắt đầu bằng '/api'
      '/api': {
        // sẽ được chuyển tiếp đến server backend này
        target: 'https://343a5356c607.ngrok-free.app',
        
        // Cần thiết để server backend chấp nhận yêu cầu
        changeOrigin: true,
        
        // Hữu ích cho các kết nối https
        secure: false
        
        // Bỏ hoàn toàn dòng "rewrite" phức tạp đi
      }
    }
  }
})
