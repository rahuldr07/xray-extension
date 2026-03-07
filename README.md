# XRAY — Encrypted API Visualizer

> A production-grade browser extension that auto-intercepts API calls, auto-decrypts encrypted responses, and displays clean JSON in a world-class visualizer panel. Built for **Chrome & Edge** (Manifest V3).

[![Phase](https://img.shields.io/badge/Phase-1%20of%206-cba6f7?style=flat-square&labelColor=1e1e2e)](https://github.com/rahuldr07/xray-extension)
[![MV3](https://img.shields.io/badge/Manifest-V3-89b4fa?style=flat-square&labelColor=1e1e2e)](https://developer.chrome.com/docs/extensions/mv3/)
[![License](https://img.shields.io/badge/License-MIT-a6e3a1?style=flat-square&labelColor=1e1e2e)](LICENSE)

---

## Why XRAY?

| Feature | JSON Web Grid Inspector | **XRAY** |
|---|---|---|
| Auto-decrypt API responses | ❌ | ✅ |
| Fetch + XHR interceptor | Partial | ✅ Full |
| `console.log` capture | ❌ | ✅ |
| Tree view | ✅ | ✅ Better |
| Raw JSON view | ✅ | ✅ |
| Diff view | ❌ | ✅ *(Phase 2)* |
| Fuzzy search `Ctrl+K` | ❌ | ✅ *(Phase 3)* |
| Keyboard shortcuts | ❌ | ✅ Full |
| Themes (Catppuccin/Dracula/Nord) | ❌ | ✅ 4 themes |
| Floating sidebar | ❌ | ✅ |
| DevTools panel | ✅ | ✅ *(Phase 4)* |
| Bundle size | 81 MB+ | **< 50 KB** |

---

## Installation

```bash
git clone https://github.com/rahuldr07/xray-extension.git
```

1. Open `edge://extensions` or `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the cloned `xray-extension/` folder
4. Done ✅

### Updating

```bash
git pull
```
Then click the **🔄 refresh** icon on the XRAY card in extensions.

---

## Usage

```javascript
// Auto-captured — no setup needed
fetch('/api/users/profile')   // ✅ auto-intercepted
console.log(myObject)         // ✅ auto-captured in LOGS tab

// Manual inspect
jv(anyData)                   // ✅ opens panel with data
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+X` | Toggle panel open/close |
| `Ctrl+F` | Focus search bar |
| `↑ ↓` | Navigate entry list |
| `T` | Tree view |
| `R` | Raw JSON view |
| `G` | Grid view *(Phase 2)* |
| `D` | Diff view *(Phase 2)* |
| `S` | Star / pin response |
| `C` | Copy JSON |
| `E` | Expand all nodes |
| `W` | Collapse all nodes |
| `Esc` | Close panel |

---

## Themes

Switch themes using the coloured dots in the panel header.

| Theme | Style |
|---|---|
| **Catppuccin Mocha** | Dark purple/lavender (default) |
| **Catppuccin Latte** | Light cream/mauve |
| **Dracula** | Dark pink/cyan |
| **Nord** | Dark arctic blue |

---

## Architecture

```
xray-extension/
├── manifest.json               # MV3 config, permissions
├── background.js               # Service worker, message bridge
├── content/
│   ├── content.js              # ISOLATED world — panel init, event relay
│   ├── interceptor.js          # MAIN world — fetch() + XHR hooks
│   └── console-capture.js      # MAIN world — console.log/warn/error hijack
├── panel/
│   ├── floating.js             # Floating sidebar — Shadow DOM UI
│   ├── renderer.js             # Tree / Raw view builders
│   ├── search.js               # Entry filter engine
│   ├── shortcuts.js            # Keyboard shortcut handlers
│   └── themes.js               # Theme palettes + CSS vars
├── devtools/
│   ├── devtools.html           # Registers DevTools tab
│   ├── devtools.js             # DevTools panel registration
│   ├── devtools-panel.html     # DevTools panel HTML
│   └── devtools-panel.js       # DevTools panel logic (Phase 4)
├── settings/
│   ├── settings.html           # Settings popup
│   └── settings.js             # Preferences manager
├── shared/
│   ├── store.js                # chrome.storage wrapper
│   ├── decrypt.js              # Pluggable decrypt function
│   └── utils.js                # Helpers, formatters
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Decrypt Integration

XRAY reads `X-Parse-Token` from request headers and passes it to your `decrypt()` function automatically:

```javascript
// shared/decrypt.js — plug your function in here
function decrypt(token, encryptedData) {
  // your decrypt logic here
  return decryptedJSON;
}
```

The interceptor handles the rest:
```javascript
// Automatic flow — no manual work needed
const token = requestHeaders['X-Parse-Token'];
const decrypted = decrypt(token, response.data);
// → appears in panel instantly
```

---

## Data Model

```typescript
interface CapturedEntry {
  id: string;
  type: 'api' | 'log';
  timestamp: number;
  // API fields
  method?: string;
  url?: string;
  urlPath?: string;
  status?: number;
  duration?: number;
  size?: number;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseHeaders?: Record<string, string>;
  responseRaw?: string;
  responseDecrypted?: any;
  decryptStatus?: 'ok' | 'failed' | 'none';
  parseToken?: string;
  // Log fields
  logData?: any;
  logLevel?: 'log' | 'warn' | 'error';
  // Common
  pinned: boolean;
}
```

---

## Build Phases

- [x] **Phase 1** — Interceptor + floating panel + tree/raw view + console capture
- [ ] **Phase 2** — Grid view + Diff view
- [ ] **Phase 3** — Fuzzy search + full keyboard shortcuts + themes polish + pin/star
- [ ] **Phase 4** — DevTools panel + settings page + export
- [ ] **Phase 5** — Decrypt integration
- [ ] **Phase 6** — GitHub polish + Edge store submission

---

## Performance Targets

| Metric | Target |
|---|---|
| Panel render (1000-key JSON) | < 100ms |
| Interceptor overhead per call | < 2ms |
| Total bundle size | < 50 KB |
| Memory (500 stored entries) | < 20 MB |
| Page crash risk | Zero |

---

## Security

- Only reads HTTP response bodies — no cookies, passwords, or form data
- Decrypt key (`X-Parse-Token`) never persisted — in-memory only per request
- All errors silently caught — extension never crashes the host page
- Original `fetch` / `XHR` / `console.log` behaviour 100% preserved

---

## License

MIT — do whatever you want with it.
