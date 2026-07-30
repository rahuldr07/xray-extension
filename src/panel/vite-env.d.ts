/// <reference types="vite/client" />

declare module '*.css?inline' {
  const css: string;
  export default css;
}

// Build stamp injected by vite/esbuild (see vite.config.ts).
declare const __XRAY_BUILD__: string;

declare const chrome: {
  runtime?: {
    sendMessage?(message: unknown, callback?: (response?: unknown) => void): void;
    getURL?(path: string): string;
    lastError?: { message?: string };
  };
  tabs?: {
    create?(options: { url: string }): void;
  };
} | undefined;
