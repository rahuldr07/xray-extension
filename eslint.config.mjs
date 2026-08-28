import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

// This repo is three runtimes in one tree, and each needs its own globals and parser:
//   src/            React 19 + TypeScript, bundled into dist/ by Vite/esbuild
//   content|shared|workers|background.js  dependency-free vanilla JS injected into pages
//   test|scripts    Node
export default tseslint.config(
  {
    // dist/ is build output; release/ is packaging output; .claude/ is vendored
    // Claude skill tooling committed so it travels with the repo. None is source.
    ignores: ['dist/**', 'node_modules/**', 'release/**', 'docs/assets/**', '.claude/**'],
  },

  js.configs.recommended,

  // Repo-wide severity policy. `npm run lint` fails on errors only, so anything
  // here that is pre-existing debt stays visible as a warning without wedging CI.
  {
    rules: {
      // ~42 deliberately-silent catch blocks exist across the capture runtime and
      // the panel. They hide real failures (a consumed response body, an exhausted
      // storage quota) and are tracked as debt rather than fixed en masse here.
      'no-empty': ['warn', { allowEmptyCatch: false }],
    },
  },

  // ---------------------------------------------------------------- React + TS
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, __XRAY_BUILD__: 'readonly' },
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs['recommended-latest'].rules,
      // The JSX transform is automatic; React need not be in scope.
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // React Compiler-era rule. The existing hits are mostly legitimate
      // prop-to-state syncs; flagged for review rather than treated as breakage.
      'react-hooks/set-state-in-effect': 'warn',
      // Captured API payloads are genuinely `any` at the boundary; flag them as a
      // nudge rather than a build break.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Rendering captured response bodies is this extension's whole job, so any
      // raw-HTML sink is a security decision that must be argued in review.
      'react/no-danger': 'error',
    },
  },

  // ------------------------------------------------- Vanilla capture runtime
  // Injected into every page. Must stay dependency-free and must not assume
  // bundler or Node semantics.
  {
    files: ['content/**/*.js', 'shared/**/*.js', 'panel/**/*.js', 'devtools/**/*.js', 'settings/**/*.js', 'background.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        chrome: 'readonly',
        // Cross-world handoffs and the legacy panel API are published as globals.
        XRAY_Store: 'readonly',
        XRAY_Utils: 'readonly',
        XRAY_Panel: 'readonly',
        XRAY_Decrypt: 'readonly',
        XRAY_ConsoleHelpers: 'readonly',
        XRAY_WorkerClient: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // ~50 deliberately-silent catches exist today. They hide real failures
      // (see docs/architecture.md), so surface them without breaking the build.
      'no-empty': ['warn', { allowEmptyCatch: false }],
      eqeqeq: ['error', 'smart'],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },

  // Web Worker: no DOM, different global surface.
  {
    files: ['workers/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.worker, indexedDB: 'readonly' },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-empty': ['warn', { allowEmptyCatch: false }],
    },
  },

  // ------------------------------------------------------------------- Node
  {
    files: ['test/**/*.{js,mjs}', 'scripts/**/*.{js,mjs}', '*.config.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      // Unit tests exercise browser-shaped code under Node, so they need both sets:
      // `URL`, `atob` and friends are Node globals too, but the browser set keeps
      // DOM shims and fixtures lint-clean.
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // The Vite config is TypeScript and needs the TS parser, but it runs in Node.
  {
    files: ['*.config.ts'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: { sourceType: 'commonjs' },
  },
  {
    files: ['scripts/**/*.mjs', 'test/**/*.mjs', '*.config.mjs'],
    languageOptions: { sourceType: 'module' },
  },

  // Must stay last: switches off every rule Prettier owns.
  prettier,
);
