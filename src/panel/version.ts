// Keep XRAY_VERSION in sync with manifest.json / package.json.
export const XRAY_VERSION = '0.3.0';

// Injected at build time by vite/esbuild; falls back to 'dev' outside a build.
export const XRAY_BUILD = typeof __XRAY_BUILD__ === 'string' ? __XRAY_BUILD__ : 'dev';
