import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import sassGlobImports from 'vite-plugin-sass-glob-import';

const path = require('path')
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    sassGlobImports () 
  ],
  server: {
    proxy: {
      '/gateway/': {
        target: 'https://linkr-test1.36kr.com/',
        // target: 'https://36linkr.com/', // 线上
        changeOrigin: true,
        secure: false,
      },
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
