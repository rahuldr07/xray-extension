# XRAY Extension — Copilot Instructions

## Build Commands

### Bundle CodeMirror
```bash
node cm-bundler.js
```
Bundles CodeMirror dependencies into `panel/codemirror.bundle.js`. Run this after updating CodeMirror packages or modifying `cm-entry.js`.

### Install Dependencies
```bash
npm install
```

### Development Workflow
1. Load extension in Chrome/Edge via `chrome://extensions` → **Load unpacked**
2. Make code changes
3. If modifying CodeMirror integration: run `node cm-bundler.js`
4. Click **🔄 refresh** icon on extension card
5. Reload target page to test changes

## Architecture

### High-Performance Design (v0.2.0+)

XRAY uses a multi-layered architecture optimized for handling 100K+ entries:

```
┌─────────────────────────────────────────────────────────────────┐
│                         PAGE (MAIN WORLD)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ interceptor │  │   console   │  │    decrypt-bridge.js    │ │
│  │     .js     │  │ capture.js  │  │  console-executor.js    │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────────────────┬─┘ │
│         │ postMessage     │ postMessage (batched)          │    │
└─────────┼─────────────────┼────────────────────────────────┼────┘
          ▼                 ▼                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT SCRIPTS (ISOLATED WORLD)             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                      content.js                            │ │
│  │  • Receives entries from MAIN world                       │ │
│  │  • Initializes worker and panel                           │ │
│  │  • Forwards entries to worker for indexing                │ │
│  └────────────────────────────┬──────────────────────────────┘ │
│                               │                                 │
│  ┌────────────────────────────▼──────────────────────────────┐ │
│  │                 shared/worker-client.js                    │ │
│  │  • Promise-based API for worker communication              │ │
│  │  • Automatic fallback if worker unavailable               │ │
│  └────────────────────────────┬──────────────────────────────┘ │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WEB WORKER (OFF MAIN THREAD)                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                   workers/xray-worker.js                   │ │
│  │  • IndexedDB storage (unlimited, persistent)               │ │
│  │  • Pre-computed search tokens (instant search)             │ │
│  │  • JSON stats, diff computation, export (CSV, HAR)         │ │
│  │  • Analytics and pattern detection                         │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Extension Worlds (Manifest V3)

**MAIN world scripts** (`world: "MAIN"` in manifest.json):
- `content/interceptor.js` — Wraps `window.fetch` and `XMLHttpRequest` to capture API calls
- `content/console-capture.js` — Hijacks `console.log/warn/error` to capture logs
- `content/decrypt-bridge.js` — Exposes `window.__XRAY_decrypt__()` for decryption (CSP-safe)
- `content/console-executor.js` — Executes user console code (CSP-safe)
- Must run in MAIN world to access the page's real fetch/XHR/console objects
- Communicate with ISOLATED world via `window.postMessage` → `window.addEventListener('message')`

**ISOLATED world scripts** (`world: "ISOLATED"` in manifest.json):
- `content/content.js` — Receives postMessage events from MAIN world, stores data, manages panel
- `shared/worker-client.js` — Promise-based API for Web Worker communication
- `panel/floating.js` — Renders the Shadow DOM panel UI
- `panel/virtual-list.js` — Virtual scrolling for large lists (100K+ items)
- `panel/insights.js` — Analytics dashboard with worker-powered analysis
- All other `panel/*` and `shared/*` files
- Cannot directly access page's window objects, but has access to chrome APIs

**Web Worker** (`workers/xray-worker.js`):
- Runs on separate thread — never blocks UI
- IndexedDB storage for unlimited, persistent entries
- Pre-computed search tokens for instant filtering
- JSON stats computation, diff calculation
- Export to CSV, HAR formats
- Analytics and pattern detection

### Data Flow

**API/Log Capture:**
```
1. Page fetch() → interceptor.js (MAIN) captures request/response
2. interceptor.js calls window.__XRAY_decrypt__() if available
3. interceptor.js emits via window.postMessage({ __xray_capture__: true, entry })
4. content.js (ISOLATED) listens to 'message' event
5. content.js stores entry and forwards to panel
6. floating.js renders in Shadow DOM panel
```

**Console Execution (CSP-safe):**
```
1. User types code in console UI
2. console.js (ISOLATED) serializes context and code
3. console.js sends window.postMessage({ type: 'XRAY_EXEC_REQUEST', id, code, context })
4. console-executor.js (MAIN) receives message
5. console-executor.js executes code with new Function() in MAIN world
6. console-executor.js sends window.postMessage({ type: 'XRAY_EVAL_RESULT', id, result })
7. console.js (ISOLATED) receives result and displays in UI
```

**Why this architecture?** Inline script injection from ISOLATED world violates Content Security Policy (CSP). By running code in MAIN world scripts that are part of the extension, we bypass CSP restrictions.

### Panel UI System

**Shadow DOM isolation:**
- Panel is rendered inside a Shadow DOM (`#__xray_root__` host element)
- All styles are scoped via `:host` selector
- Uses CSS custom properties (e.g., `var(--xr-bg)`, `var(--xr-text)`) for theming

**View modes:**
- `tree` — Collapsible JSON tree view (default)
- `raw` — CodeMirror-powered raw JSON editor
- `waterfall` — Timeline visualization of API calls
- `grid` and `diff` planned for Phase 2/3

**State management:**
- Global `_state` object in `floating.js` holds all UI state
- Persisted to `chrome.storage.local` (via `shared/store.js`)
- State keys: `open`, `activeTab`, `activeView`, `selectedId`, `theme`, `filter`, `entries`, etc.

### Decrypt Integration

The `content/decrypt-bridge.js` file (MAIN world) contains the decrypt function:
- Exposes `window.__XRAY_decrypt__(token, data)` directly in MAIN world
- `token` is read from the `X-Parse-Token` request header
- `data` is the parsed response JSON
- Return decrypted value or `null` if no decryption needed
- **Must be synchronous** — no async/await, use pure-JS crypto libraries

**CSP-safe design:** The decrypt function runs in MAIN world as part of the extension, avoiding inline script injection that would violate CSP.

## Key Conventions

### File Organization
- `content/*` — Content scripts (MAIN and ISOLATED world)
- `panel/*` — UI rendering, themes, shortcuts, search
- `shared/*` — Utilities shared across content and panel (store, decrypt, utils)
- `devtools/*` — DevTools panel integration (Phase 4)
- `settings/*` — Settings page (Phase 4)

### Naming Patterns
- Private functions/variables prefixed with `_` (e.g., `_uid()`, `_emit()`, `_state`)
- Global modules exposed on `window` (e.g., `window.XRAY_Panel`, `window.XRAY_Decrypt`)
- Event property names use double underscores (e.g., `{ __xray_capture__: true }`)
- IDs use snake_case with prefixes (e.g., `xr_<timestamp>_<random>`)

### Data Model
```javascript
{
  id: 'xr_...',              // Unique entry ID
  type: 'api' | 'log',       // Entry type
  timestamp: number,         // Unix timestamp (ms)
  
  // API entries
  method: 'GET' | 'POST' | ...,
  url: string,
  urlPath: string,           // Path only (no origin)
  status: number,
  duration: number,          // ms
  size: number,              // bytes
  requestHeaders: {},
  requestBody: any,
  responseHeaders: {},
  responseRaw: string,
  responseDecrypted: any,    // Decrypted JSON if available
  decryptStatus: 'ok' | 'failed' | 'none',
  parseToken: string,        // X-Parse-Token header value
  
  // Log entries
  logData: any,              // Preview or full data
  logLevel: 'log' | 'warn' | 'error' | 'info' | 'debug',
  objectRefs: string[],      // IDs for lazy-loading full objects
  
  // Internal (added by worker)
  _searchTokens: string[],   // Pre-computed search tokens
  
  // Common
  pinned: boolean,
}
```

**Lazy Object Loading:**
Log entries may contain `__xray_ref__` markers in `logData`:
```javascript
// Preview stored in logData
{ username: "john", __xray_ref__: "xrl_abc123" }

// Full object retrieved via:
const full = await window.__XRAY_fetchLogObject__('xrl_abc123');
```

### Error Handling
- All interceptor code wrapped in try/catch to prevent page crashes
- Errors logged to `console.error` with `[XRAY]` prefix
- Original `fetch`/`XHR`/`console` behavior always preserved — extension never interferes

### Performance Constraints (v0.2.0+)
- Console capture overhead target: **< 0.1ms per log** (lazy serialization)
- API intercept overhead target: **< 2ms per call**
- Search latency target: **< 50ms for 10K entries** (pre-indexed tokens)
- Panel render target: **< 16ms** (virtual scrolling)
- Memory limit: **< 50 MB for 10K stored entries**
- Max stored entries: configurable, default 500 (unlimited with IndexedDB)

### Performance Optimizations

**Console Capture (`content/console-capture.js`):**
- Zero-copy for primitives — passes values directly
- Lazy serialization — stores WeakRef, serializes on-demand
- Batched emission — groups rapid logs into single postMessage (16ms batching)
- Circular reference safe — handles self-referential objects
- Captures: `log`, `warn`, `error`, `info`, `debug`, `table`, `dir`

**Search (`panel/search.js`):**
- Pre-computed tokens per entry (URL parts, methods, status, keys)
- Token-based matching (no full JSON serialization)
- 150ms debounce for typing
- WeakMap cache for tokens (auto-GC on entry removal)
- Supports structured queries: `status:404 method:POST /api/users`

**Virtual Scrolling (`panel/virtual-list.js`):**
- Renders only visible items + 5 overscan
- Handles 100K+ items smoothly
- 32px default item height
- Keyboard navigation: ↑↓, Home, End

**Web Worker (`workers/xray-worker.js`):**
- IndexedDB with indexes on timestamp, type, url, status
- Async cloning that yields to prevent blocking
- Pre-computed search tokens stored with entries
- Export to CSV, HAR without blocking UI

### Keyboard Shortcuts
Defined in `panel/shortcuts.js` and `manifest.json`:
- `Ctrl+Shift+X` — Toggle panel
- `Ctrl+F` — Focus search
- `T` — Tree view
- `R` — Raw view
- `G` — Grid view (Phase 2)
- `D` — Diff view (Phase 2)
- `S` — Star/pin entry
- `C` — Copy JSON
- `E` — Expand all
- `W` — Collapse all
- `Esc` — Close panel
- `↑↓` — Navigate entries

### Themes
Five themes available (switched via Settings → Theme):
1. `zinc` (default) — Obsidian Pro
2. `mocha` — Graphite Pro
3. `latte` — Frost Light
4. `dracula` — Violet Night
5. `nord` — Ocean Glass

Theme colors defined in `panel/themes.js` as CSS custom properties.

## Testing

No automated tests currently exist. Manual testing workflow:
1. Load extension in browser
2. Navigate to a page with API calls or console logs
3. Open XRAY panel with `Ctrl+Shift+X`
4. Verify API calls appear in **API** tab
5. Verify console logs appear in **LOGS** tab
6. Test keyboard shortcuts, search, view modes, themes

## Development Phases

Currently in **Phase 1** (complete):
- ✅ Fetch + XHR interceptor
- ✅ Console capture
- ✅ Floating Shadow DOM panel
- ✅ Tree/Raw/Waterfall views
- ✅ Basic search + keyboard shortcuts
- ✅ Four themes

**Phase 2** (planned):
- Grid view for tabular data
- Diff view for comparing responses

**Phase 3** (planned):
- Fuzzy search (`Ctrl+K`)
- Pin/star entries
- Enhanced keyboard navigation

**Phase 4** (planned):
- DevTools panel tab
- Settings page
- Export functionality

**Phase 5** (planned):
- Full decrypt integration

**Phase 6** (planned):
- GitHub polish + Edge store submission

## Security Notes

- Extension only reads HTTP response bodies
- Never accesses cookies, passwords, or form data
- Decrypt key (`X-Parse-Token`) is in-memory only, never persisted
- All errors caught silently — extension never crashes host page
- Original browser APIs fully preserved

## Common Tasks

### Adding a new keyboard shortcut
1. Add handler in `panel/shortcuts.js` → `_handleKey()` function
2. Update `_buildCSS()` in `floating.js` if visual feedback needed
3. Document in README.md keyboard table

### Adding a new theme
1. Add theme colors in `panel/themes.js` → `_loadTheme()` function
2. Add theme selector dot in `floating.js` → `_buildHTML()` header section
3. Update README.md themes table

### Modifying interceptor logic
1. Edit `content/interceptor.js` (fetch) or XHR hooks
2. Reload extension in `chrome://extensions`
3. Reload target page to apply changes
4. Check browser console for `[XRAY]` error logs

### Debugging Shadow DOM panel
1. Open DevTools → Elements tab
2. Find `#__xray_root__` element
3. Expand Shadow Root to inspect panel DOM
4. Console logs from panel scripts appear in page console
