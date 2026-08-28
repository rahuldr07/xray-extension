import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { build as buildWithEsbuild, type Plugin as EsbuildPlugin } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';

// A build stamp injected into every bundle so the UI can show when it was built —
// the quickest way to tell whether a loaded extension is the current build.
// Honours SOURCE_DATE_EPOCH (seconds since the epoch) so release and CI builds are
// byte-for-byte reproducible; falls back to wall-clock time for local dev builds.
function resolveBuildStamp(): string {
  const epoch = Number(process.env.SOURCE_DATE_EPOCH);
  const stampedAt = Number.isFinite(epoch) && epoch > 0 ? new Date(epoch * 1000) : new Date();
  return stampedAt.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
}

const BUILD_STAMP = resolveBuildStamp();

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

// The panel bundle is emitted by Vite's lib mode; the HUD and pop-out window bundles are
// separate IIFE entrypoints that Vite's single-entry lib build cannot express, so esbuild
// emits them here. Both share one config shape — only entry, outfile, and global differ.
const IIFE_ENTRYPOINTS = [
  { entry: 'src/panel/hud-main.tsx', outfile: 'dist/hud-ui.js', globalName: 'XRAYHudUI' },
  { entry: 'src/panel/window-main.tsx', outfile: 'dist/window-ui.js', globalName: 'XRAYWindowUI' },
] as const;

function extraIifeEntrypoints() {
  return {
    name: 'xray-extra-iife-entrypoints',
    async closeBundle() {
      const rootDir = process.cwd();
      await Promise.all(
        IIFE_ENTRYPOINTS.map(({ entry, outfile, globalName }) =>
          buildWithEsbuild({
            absWorkingDir: rootDir,
            entryPoints: [path.join(rootDir, entry)],
            outfile,
            bundle: true,
            format: 'iife',
            globalName,
            platform: 'browser',
            target: 'es2020',
            jsx: 'automatic',
            // Matches Vite's production minification for panel-ui.js; without it these two
            // content-script bundles ship ~1.2 MB each of unminified source.
            minify: true,
            define: {
              'process.env.NODE_ENV': JSON.stringify('production'),
              __XRAY_BUILD__: JSON.stringify(BUILD_STAMP),
            },
            plugins: [inlineCssPlugin()],
          }),
        ),
      );
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
