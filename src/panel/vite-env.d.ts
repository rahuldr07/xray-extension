/// <reference types="vite/client" />

declare module '*.css?inline' {
  const css: string;
  export default css;
}

declare const chrome: {
  runtime?: {
    sendMessage?(message: unknown, callback?: (response?: unknown) => void): void;
    getURL?(path: string): string;
  };
  tabs?: {
    create?(options: { url: string }): void;
  };
} | undefined;
