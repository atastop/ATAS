import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ATAS/', // 必須和 GitHub repo 名稱大小寫完全一致
})
