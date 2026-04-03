---
name: performance
description: Use this skill when creating or modifying core data-handling logic, the interceptor, web workers, or virtual list algorithms to keep the extension highly performant.
---

# Performance Guidelines

1. **Strict Latency Budgets**:
   - **API Interception (`interceptor.js`)**: Must complete in `< 2ms` per request overhead. Avoid heavy synchronous processing.
   - **Search (`search.js`)**: Must return results for 10K+ entries in `< 50ms`. Rely on pre-computed indices (`_searchTokens`) handled by the worker.
   - **Panel Rendering**: Target `< 16ms` (60 FPS frames) using virtualized lists.

2. **Virtual Scrolling Rules (`virtual-list.js` / `entry-list.js`)**:
   - The UI handles up to 100K+ log entries. You MUST use virtual scrolling for any list or grid.
   - Never render all DOM items at once. Read DOM elements by their visible `startIndex` and `endIndex`, utilizing absolute positioning.
   - Recycle DOM nodes whenever possible using Maps (`_renderedNodes`).

3. **Console Serialization (`console-capture.js`)**:
   - **Zero-copy for primitives**: Pass numbers/strings deeply without serialization where possible.
   - **Lazy Serialization**: Wrap complex objects via `WeakRef` and only serialize them if the user expands them in the panel UI.
   - **Cross-World Safety**: Extension operates between isolated and main worlds. Send data via batched `postMessage`.

4. **Web Worker Offloading (`xray-worker.js`)**:
   - Heavy parsing (e.g., HAR export, Diff comparison, token splitting) MUST happen in the Web Worker to prevent UI blocking.
