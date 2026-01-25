import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Keep relative paths for Sandbox compatibility
  plugins: [react()],
})
