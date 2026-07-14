import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { build as buildWithEsbuild, type Plugin as EsbuildPlugin } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';

// A build stamp injected into every bundle so the UI can show when it was built —
// the quickest way to tell whether a loaded extension is the current build.
const BUILD_STAMP = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

function inlineCssPlugin(): EsbuildPlugin {
  return {
    name: 'inline-css',
    setup(build) {
      build.onResolve({ filter: /\.css\?inline$/ }, (args) => ({
        path: path.resolve(args.resolveDir, args.path.replace(/\?inline$/, '')),
        namespace: 'inline-css',
      }));
      build.onLoad({ filter: /.*/, namespace: 'inline-css' }, async (args) => ({
        contents: `export default ${JSON.stringify(await fs.readFile(args.path, 'utf8'))};`,
        loader: 'js',
      }));
    },
  };
}

function extraIifeEntrypoints() {
  return {
    name: 'xray-extra-iife-entrypoints',
    async closeBundle() {
      const rootDir = process.cwd();
      await Promise.all([
        buildWithEsbuild({
          absWorkingDir: rootDir,
          entryPoints: [path.join(rootDir, 'src/panel/hud-main.tsx')],
          outfile: 'dist/hud-ui.js',
          bundle: true,
          format: 'iife',
          globalName: 'XRAYHudUI',
          platform: 'browser',
          target: 'es2020',
          jsx: 'automatic',
          define: { 'process.env.NODE_ENV': JSON.stringify('production'), __XRAY_BUILD__: JSON.stringify(BUILD_STAMP) },
          plugins: [inlineCssPlugin()],
        }),
        buildWithEsbuild({
          absWorkingDir: rootDir,
          entryPoints: [path.join(rootDir, 'src/panel/window-main.tsx')],
          outfile: 'dist/window-ui.js',
          bundle: true,
          format: 'iife',
          globalName: 'XRAYWindowUI',
          platform: 'browser',
          target: 'es2020',
          jsx: 'automatic',
          define: { 'process.env.NODE_ENV': JSON.stringify('production'), __XRAY_BUILD__: JSON.stringify(BUILD_STAMP) },
          plugins: [inlineCssPlugin()],
        }),
      ]);
    },
  };
}

export default defineConfig({
  plugins: [react(), extraIifeEntrypoints()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __XRAY_BUILD__: JSON.stringify(BUILD_STAMP),
  },
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: false,
    lib: {
      entry: 'src/panel/main.tsx',
      name: 'XRAYReactPanel',
      formats: ['iife'],
      fileName: () => 'panel-ui.js',
    },
  },
});
