import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import tailwindcss from '@tailwindcss/vite';
import { rollup } from 'rollup';

import dts from 'rollup-plugin-dts';

export default defineConfig({
  appType: 'spa',
  build: {
    cssMinify: true,
    cssCodeSplit: false,
    minify: 'terser',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['cjs', 'es'],
      fileName: (format, entryName) => {
        return format === 'es' ? `${entryName}.js` : `${entryName}.cjs`;
      },
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'mobx-view-model', 'react/jsx-runtime'],
    },
    // rollupOptions: {
    //   input: {
    //     index: resolve(__dirname, 'src/index.ts'),
    //   },
    //   output: {
    //     entryFileNames: 'index.js', // Имя файла без хеша
    //     chunkFileNames: '[name].js',
    //     assetFileNames: '[name].[ext]',
    //   },
    // },
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
  plugins: [
    tailwindcss(),
    cssInjectedByJsPlugin(),
    {
      name: 'dts-bundle',
      apply: 'build',
      async closeBundle() {
        console.log('\n📦 Generating bundled .d.ts files...\n');

        let name = 'index';

        try {
          const bundle = await rollup({
            input: resolve(__dirname, './src/index.ts'),
            external: (id) => {
              return id.includes('node_modules');
            },
            plugins: [
              dts({
                respectExternal: false,
                compilerOptions: {
                  baseUrl: '.',
                  paths: {
                    '@/*': ['./src/*'],
                  }
                },
              }),
            ],
          });

          await bundle.write({
            file: `dist/${name}.d.ts`,
            format: 'es',
          });

          await bundle.close();
          console.log(`✅ ${name}.d.ts`);
        } catch (error) {
          console.error(`❌ Failed to generate ${name}.d.ts:`, error);
        }
      },
    },
  ],
});
