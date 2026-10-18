import { readFileSync } from 'node:fs';

// The panel stylesheet as every entry point injects it (src/panel/main.tsx, hud-main.tsx,
// window-main.tsx): tokens.css first, then styles.css. E2E fixtures load it through this one
// helper so --xray-font-ui, the mono stack and the token fallbacks resolve as in the real panel
// (width and font checks measure real fonts). Bundled fixtures embed it with
// `const styles = ${JSON.stringify(PANEL_CSS)};`.
const read = path => readFileSync(new URL('../../src/panel/' + path, import.meta.url), 'utf8');

export const PANEL_CSS = ['styles/tokens.css', 'styles.css'].map(read).join('\n');
