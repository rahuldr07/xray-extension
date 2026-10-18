# Runtime and UI Correctness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merge the reviewed Claude fixes branch, then close the remaining capture, persistence, export, settings, focus-trap, and responsive-layout regressions with regression tests.

**Architecture:** Preserve the existing MAIN/ISOLATED/service-worker split and React/Zustand model boundaries. Reuse the Claude branch's fixes where they already address a requested issue, then add the smallest missing guards and UI behavior in their owning runtime/model/component.

**Tech Stack:** Manifest V3, vanilla JavaScript runtime, React + TypeScript, Zustand, Node test runner, Vite, ESLint.

**Spec:** User request in chat: merge the Claude fixes branch and fix the listed runtime/UI issues.

## Global Constraints

- Do not merge Dependabot branches in this task.
- Keep capture runtime dependency-free and preserve the MAIN/ISOLATED boundary.
- Write a failing regression test before each production fix.
- Keep `dist/` synchronized when source changes require a build.
- Preserve security validation and bounded payload behavior.

## Review Focus

- Partial capture updates must preserve the original entry identity and apply timing/frame patches.
- A reused XHR must emit exactly once per send, with the current request's body and id.
- Entry-cap eviction and import must preserve user-protected entries while remaining bounded.
- Session exports must remain valid JSON/HAR for large and malformed inputs.
- Escape/focus behavior must work through the closed shadow root without swallowing page shortcuts.

---

### Task 1: Merge and establish baseline

**Files:** Git history only; no source changes.

- [ ] Verify the worktree and recent history.
- [ ] Fast-forward `main` to `origin/claude/repo-enhancements-multi-agent-sqewfd`.
- [ ] Run the available regression suite and record the new baseline.

### Task 2: Capture runtime correctness

**Files:**
- Modify: `content/content.js`
- Modify: `content/interceptor.js`
- Test: `test/security-world-isolation.test.js`
- Test: `test/capture-interceptor.test.js`

- [ ] Add failing tests for partial WebSocket/SSE/timing updates and reused-XHR single emission.
- [ ] Run the focused tests and confirm they fail for the current root causes.
- [ ] Implement update validation that accepts partial patches only for ids created in the isolated world.
- [ ] Bind one XHR `loadend` listener per object and read the current send state exactly once.
- [ ] Run focused capture/security tests, then the full test suite.

### Task 3: State retention and imports

**Files:**
- Modify: `src/panel/store.ts`
- Modify: `src/panel/models/entries.ts`
- Test: `test/unit/storeEviction.test.mjs`
- Test: `test/accessibility.test.js`

- [ ] Add failing tests for pinned/selected retention, bounded eviction, and imports into a full session.
- [ ] Implement protected-entry eviction and capacity-aware import merging.
- [ ] Keep pinned ids and restored console events consistent with surviving entries.
- [ ] Run the store/model tests and the full suite.

### Task 4: Export and settings safety

**Files:**
- Modify: `src/panel/models/export.ts`
- Modify: `src/panel/components/settings/SettingsModal.tsx`
- Test: `test/unit/exportImport.test.mjs`
- Test: `test/shell-navigation-modals.test.js`

- [ ] Add failing tests for large session JSON/HAR, invalid timestamps, and body-less responses.
- [ ] Add failing tests proving numeric settings do not commit partial keystrokes.
- [ ] Implement bounded-valid export serialization and blur/commit numeric controls.
- [ ] Run focused export/settings tests and the full suite.

### Task 5: Focus trap and responsive surfaces

**Files:**
- Modify: `src/panel/runtime/panelKeyboard.ts`
- Modify: `src/panel/main.tsx`
- Modify: `content/content.js`
- Modify: `src/panel/components/common/ModalShell.tsx` if required by reproduced behavior
- Modify: `src/panel/styles.css`
- Modify: `src/panel/styles/hud.css` if required by reproduced behavior
- Test: `test/panel-host-isolation.test.js`
- Test: `test/accessibility.test.js`
- Test: `test/responsive-motion-css.test.js`

- [ ] Reproduce focus escaping, page shortcut swallowing, HUD input blocking, and narrow-width layout failures.
- [ ] Add failing regression assertions for the reproduced behavior.
- [ ] Implement root-aware focus handling, correct HUD host recognition, and minimal responsive layout fixes.
- [ ] Run focused UI/source tests; run browser QA if dependencies and Chromium are available.

### Task 6: Build synchronization and final verification

**Files:**
- Modify: `dist/` generated bundles only when the real build succeeds.
- Modify: `docs/superpowers/plans/2026-10-07-runtime-ui-correctness-plan.md` only for completion notes if needed.

- [ ] Install dependencies only if needed and authorized by the workspace workflow.
- [ ] Run `npm run typecheck`, `npm run lint`, `npm run build`, and `npm test`.
- [ ] Run `git diff --check` and inspect `git status`.
- [ ] Report any remaining environment or browser-verification gaps without calling them fixed.
