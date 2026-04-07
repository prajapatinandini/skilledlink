import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // 👈 Yeh line Vercel par 404 aur MIME type errors ko fix karegi
})