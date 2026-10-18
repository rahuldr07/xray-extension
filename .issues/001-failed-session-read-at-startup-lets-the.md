---
id: 1
title: Failed session read at startup lets the next capture overwrite the stored session
status: open
priority: med
labels: [bug, persistence]
by: claude
files: [src/panel/store.ts]
created: 2026-10-12 04:47
updated: 2026-10-16 01:37
---
In `restorePreferences` (src/panel/store.ts ~1131-1164), if the batched storage read throws, the code falls through with empty preferences/envelope. `authoritativeReadOK` only drives the health flag. The next capture's `persistSession` then writes an envelope containing only live entries, replacing the stored session. Suggest gating session writes on a successful authoritative read, or making the first post-failure write merge rather than replace. Behaviour trade-off: Task 2 spec expects live entries to persist after storage recovers, so design carefully.

## Log
- 2026-10-12 04:47 claude: filed

- 2026-10-15: JSON-fidelity Task 8 review: the HUD store schedules session persists without ever restoring the session (hud-main.tsx ~79 restores preferences only), which may overwrite the stored session — verify in Task 10.
- 2026-10-16 01:37 claude: 2026-10-16 JSON-fidelity Task 10, verified in the real extension (script output/json-fidelity/task-10/hud-overwrite.mjs.txt, results hud-overwrite-outcomes.json). Correction to the Task 8 note: the HUD does restore the session (restorePreferences reads xray_session_envelope on every surface). The loss comes from two stores in one tab (docked panel + HUD bundle) each saving its own view to the one key; the last save wins. Repro, fresh profile: (B, the asked repro) docked panel open, 3 fetches, wait until the save holds them, open the HUD the way the mode switcher does (chrome.runtime.sendMessage XRAY_HUD_TOGGLE_ACTIVE → background → XRAY_HUD_TOGGLE), 2 more fetches, wait 9 s, reload → all 5 restored, NO loss. (C) same, but 2 fetches right before opening the HUD (inside the docked panel's 4 s save window) → after the reload those 2 are gone; storage holds the 3 saved + 2 later ones. (A, 3 of 3 runs) a burst of 12 fetches while the HUD opens → after the reload all 12 are gone; storage holds only the first 3. Mechanism: the HUD bundle is imported on demand, so captures posted before its listener exists reach only the docked store; the HUD restores the last-saved envelope, and its restore schedules a save ~4 s after mounting that lands after the docked panel's save and replaces it. Per hud-main.tsx the HUD store keeps its capture listener (and keeps saving) after the HUD is toggled off (not exercised). Not fixed in Task 10: needs one writer per tab or a merge-on-save design.
