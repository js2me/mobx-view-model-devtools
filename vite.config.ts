import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  appType: 'spa',
  build: {
    cssMinify: true,
    cssCodeSplit: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.ts'),
      },
      output: {
        entryFileNames: 'index.js',  // Имя файла без хеша
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    terserOptions: {
      format: {
        comments: false,
      },
    },
  },
  mode: 'production',
  resolve: {
    alias: [
      {
        find: '@',
        replacement: '/src',
      },
    ],
  },
  plugins: [tailwindcss(), cssInjectedByJsPlugin()],
});
