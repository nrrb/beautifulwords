import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/(
export default defineConfig(({mode}) => ({
  plugins: [vue()],
  server: {
    port: 5180,
    open: true,
  },
  build: {
    outDir: 'docs',
  },
  base: mode === 'production' ? '/beautifulwords/' : '/'
}))
