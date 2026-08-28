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
export function installPanelKeyboard({ dismissible }: PanelKeyboardOptions): void {
  // init() is re-entrant, and the pop-out re-renders on theme changes; a second
  // listener would double-handle every keystroke.
  if (installed) return;
  installed = true;

  document.addEventListener(
    'keydown',
    (event) => {
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
        const store = usePanelStore.getState();
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
        else if (dismissible && store.open && !store.devtoolsMode) store.setOpen(false);
      }
    },
    true,
  );
}
