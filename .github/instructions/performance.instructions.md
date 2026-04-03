---
description: 'Performance and architecture guidelines for data handlers, interceptors, and workers'
applyTo: 'content/**/*.js,workers/**/*.js'
---

# XRAY Performance Rules

*   **Interception (< 2ms)**: `content/interceptor.js` and `content/console-capture.js` run on every page event. Keep logic here incredibly fast. Do not serialize heavy JSON bodies defensively; push raw data if possible or evaluate lazily.
*   **Memory Management**: Bound caches. Prevent array leaks. For large logs, use `WeakRef` mapping for object instances.
*   **Workers**: Direct complex data structures or full-text search token building into `workers/xray-worker.js`.
*   **World Communication**: Communication between the MAIN and ISOLATED world must pass through `postMessage`. Batch messages via `requestAnimationFrame` or `setTimeout(16)` when the volume spikes.
