import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/bus': {
        target: 'https://businfo.daegu.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bus/, ''),
      },
    },
  },
});

