import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { rollup } from 'rollup';
import dts from 'rollup-plugin-dts';
import { ConfigsManager, prepareDistDir } from 'sborshik/utils';
import { build, defineConfig, type LibraryFormats } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { camelCase, upperFirst } from "lodash-es"

const createBundle = async ({
  configs,
  buildEnvs,
}: {
  configs: ConfigsManager;
  buildEnvs: BuildEnvVariables;
}) => {
  let fileName: string;
  let libraryFormats: LibraryFormats[];
  let emptyOutDir: boolean;

  if (buildEnvs.version === 'default') {
    fileName = 'index';
    emptyOutDir = true;
    libraryFormats = ['cjs', 'es'];
  } else {
    fileName = 'index.global';
    emptyOutDir = false;
    libraryFormats = ['iife'];
  }

  const viteConfig = defineConfig({
    appType: 'spa',
    define: {
      buildEnvs: JSON.stringify(buildEnvs),
    },
    build: {
      cssMinify: true,
      cssCodeSplit: false,
      minify: 'terser',
      emptyOutDir,
      lib: {
        entry: {
          [fileName]: resolve(configs.rootPath, 'src/index.ts'),
        },
        formats: libraryFormats,
        name:
          libraryFormats.includes('iife') || libraryFormats.includes('umd')
            ? upperFirst(camelCase(configs.package.name))
            : undefined,
        fileName: (format, entryName) => {
          return format === 'cjs' ? `${entryName}.cjs` : `${entryName}.js`;
        },
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
      },
      terserOptions: {
        format: {
          comments: false,
        },
      } as any,
    },
    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: '[local]_[hash:base64:5]', // Опционально
      },
      postcss: './postcss.config.js',
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

          const name = 'index';

          try {
            const bundle = await rollup({
              input: resolve(configs.rootPath, './src/index.ts'),
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
                    },
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

  await build(viteConfig);
};

const main = async () => {
  const configs = ConfigsManager.create();

  await createBundle({
    configs,
    buildEnvs: {
      version: 'default',
    },
  });
  await createBundle({
    configs,
    buildEnvs: {
      version: 'global',
    },
  });

  await prepareDistDir({
    configs,
    ignoredModuleNamesForExport: ['index.global'],
  });
};

// biome-ignore lint/nursery/noFloatingPromises: <explanation>
main();
