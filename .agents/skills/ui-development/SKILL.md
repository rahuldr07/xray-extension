---
name: ui-development
description: Use this skill when modifying or building UI elements for the extension's panel. Dictates aesthetic guidelines and strict CSS architectures.
---

# UI Development Constraints

1. **Aesthetics & Appearance**: The project follows a premium, shadcn/Linear/Vercel-inspired design. 
   - **Colors**: Use the predefined `--xr-*` CSS variables based on a zinc/slate dark mode palette (e.g., `--xr-bg`, `--xr-surface`, `--xr-accent`, `--xr-text`). Do not use harsh black or plain RGB primaries.
   - **Typography**: The primary font is `Inter`. Code/data representation should use `JetBrains Mono`. Keep sizes small but readable (e.g., 10px-13px).
   - **Spacing**: Follow a 4px grid system (`4px`, `8px`, `12px`, `16px`).
   - **Borders & Shadows**: Use subtle, low-opacity borders (e.g., `rgba(63, 63, 70, 0.5)`) and smooth glow-like shadows for interactive elements.
   - **Corners**: Subtle rounding components, typically `--xr-radius-sm` (4px) or `--xr-radius-md` (6px).

2. **Frameworks & Tooling**:
   - **Zero Tailwind CSS**: Do NOT use Tailwind CSS or any utility-class framework.
   - **Vanilla CSS in Shadow DOM**: The entire extension panel exists inside a Shadow DOM to protect it from host-page styles. Write raw CSS strings prefixed with `#xr-panel` or directly via `:host` rules inside JS template literals (e.g., `_buildCSS()` in `floating.js`).
   - **Class Naming**: ALL classes must be prefixed with `xr-` (e.g., `xr-btn`, `xr-pane`, `xr-method-badge`) to ensure variables and styles don't conflict structurally if ever pulled out of the Shadow Root.

3. **Interactivity**: Add micro-animations (150ms transitions on hover states, subtle transforms like `scale(1.02)` or `translateY(-1px)`) to keep the UI feeling snappy.
