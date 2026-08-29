import { usePanelStore } from '../store';

let installed = false;

export interface PanelKeyboardOptions {
  /**
   * Whether Escape, with no modal or drawer layered on top, dismisses the panel itself.
   *
   * True for the injected side panel, which the user can always reopen from the toolbar.
   * False for the pop-out window and DevTools, where the panel IS the surface — hiding it
   * there leaves an empty page with no way back.
   */
  dismissible: boolean;
}

/**
 * Panel-level keyboard shortcuts: the command palette, global search, and the Escape
 * dismissal ladder.
 *
 * This lives here rather than in main.tsx because the pop-out window mounts through
 * window-main.tsx, which never called main.tsx's copy — so Ctrl+K and Ctrl+Shift+F were
 * simply dead in the pop-out. Escape appeared to work there only because ModalShell
 * installs its own handler, which covers modals but none of the layers below.
 */
/**
 * The element that actually has focus, resolved through any shadow roots.
 *
 * `document.activeElement` stops at the shadow host, so inside the panel's shadow
 * tree it always reports the host `<div>` and never the field the user is typing in.
 */
function deepActiveElement(): Element | null {
  let active: Element | null = document.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
}

/** True while the user is typing into a field that has something in it to clear. */
function isEditingText(): boolean {
  const active = deepActiveElement() as HTMLElement | null;
  if (!active) return false;
  if (active.isContentEditable) return true;
  const tag = active.tagName;
  if (tag !== 'INPUT' && tag !== 'TEXTAREA') return false;
  return !!(active as HTMLInputElement | HTMLTextAreaElement).value;
}

export function installPanelKeyboard({ dismissible }: PanelKeyboardOptions): void {
  // init() is re-entrant, and the pop-out re-renders on theme changes; a second
  // listener would double-handle every keystroke.
  if (installed) return;
  installed = true;

  document.addEventListener(
    'keydown',
    (event) => {
      // The injected panel mounts on the page's first captured request, long before
      // the user asks to see anything, and this listener is capture-phase and calls
      // preventDefault(). Without this guard XRAY swallowed Ctrl+K and Ctrl+Shift+F
      // on every site the user visited, whether or not they ever opened the panel —
      // both are common site shortcuts, and it breaks PRODUCT.md principle 4.
      //
      // DevTools and the pop-out both set `open` at mount, so they are unaffected.
      const store = usePanelStore.getState();
      if (!store.open && !store.devtoolsMode) return;

      const key = event.key?.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault();
        usePanelStore.getState().setCommandOpen(true);
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && key === 'f') {
        event.preventDefault();
        usePanelStore.getState().setGlobalSearchOpen(true);
      }
      if (key === 'escape') {
        if (store.pendingConfirmation) store.closeConfirmation();
        else if (store.exportOpen) store.setExportOpen(false);
        else if (store.commandOpen) store.setCommandOpen(false);
        else if (store.globalSearchOpen) store.setGlobalSearchOpen(false);
        else if (store.settingsOpen) store.setSettingsOpen(false);
        else if (store.replayEditorEntry) store.closeReplayEditor();
        // The detail drawer closes before the panel itself does (and this is the
        // only Escape layer that also works in devtools/window mode).
        else if (store.apiDetailOpen && store.activeTab === 'api') store.setApiDetailOpen(false);
        // Nothing layered on top: Escape dismisses the docked side panel itself.
        // Devtools and pop-out views persist — they aren't dismissible this way.
        //
        // Not while the user is typing, though. Escape-to-clear-the-field is the
        // reflex every one of these inputs trains, and destroying the whole panel
        // instead costs the filter text, the scroll position and the selection.
        else if (dismissible && store.open && !store.devtoolsMode && !isEditingText()) store.setOpen(false);
      }
    },
    true,
  );
}
