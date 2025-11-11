import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3016,
    host: true,
    strictPort: true, // 强制使用指定端口，不自动切换
    // 添加SPA路由支持
    fs: {
      allow: ['..']
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})