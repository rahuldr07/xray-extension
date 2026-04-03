---
description: 'Aesthetic and UI rules for modifying the XRAY panel.'
applyTo: 'panel/**/*.js'
---

# XRAY Panel UI Rules

*   **Aesthetics**: Shadcn/Linear-inspired. Use dense but highly readable info grids.
*   **Fonts**: Base `Inter`, Monospace `JetBrains Mono` or `Fira Code`.
*   **Colors**: Use predefined `--xr-*` CSS custom properties exclusively. Never hardcode colors except for rare opacities (using `rgba()`).
*   **No Tailwind**: Write vanilla CSS in the `_buildCSS` template strings. Use BEM-like or simple structured classes prefixed entirely with `xr-` (e.g. `xr-row`, `xr-icon`).
*   **Isolation**: Remember all UI is inside a Shadow DOM. Keep styles strictly scoped.
*   **Animations**: Incorporate 150ms hover state transitions `transition: all .15s` for interactive elements.
