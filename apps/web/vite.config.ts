import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // 不限制來源 host，任何 domain 都可存取 dev server（僅開發/demo 用）
    allowedHosts: true,
  },
})
