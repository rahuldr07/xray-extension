import { usePanelStore } from '../store';
import { closeTopmostDialog } from '../components/common/ModalShell';

let installed = false;

// Non-modal layers that own Escape below the modal stack and above the panel itself
// (the Console inspector). Each handler closes its layer and returns true, or returns
// false to pass. Menus need no entry: they claim Escape earlier, in window capture.
const escapeLayers: Array<() => boolean> = [];

/** Register an Escape layer; returns the unregister function. Last registered closes first. */
export function pushEscapeLayer(handler: () => boolean): () => void {
  escapeLayers.push(handler);
  return () => {
    const index = escapeLayers.lastIndexOf(handler);
    if (index >= 0) escapeLayers.splice(index, 1);
  };
}

function closeEscapeLayer(): boolean {
  for (let i = escapeLayers.length - 1; i >= 0; i--) {
    if (escapeLayers[i]()) return true;
  }
  return false;
}

export interface PanelKeyboardOptions {
  /**
   * Whether Escape, with no modal or drawer layered on top, dismisses the panel itself.
   *
   * True for the injected side panel, which the user can always reopen from the toolbar.
   * False for the pop-out window and DevTools, where the panel IS the surface — hiding it
   * there leaves an empty page with no way back.
   */
  dismissible: boolean;
  /**
   * The root to resolve the focused element against.
   *
   * The docked panel mounts in a CLOSED shadow root, and `host.shadowRoot` is null for
   * a closed root from every script including the one that created it — so walking down
   * from `document.activeElement` stops at the host `<div>` and can never see the field
   * the user is typing in. The caller that owns the root has to hand it over.
   */
  getRoot?: () => Document | ShadowRoot;
}

/**
 * The element that actually has focus, resolved from `root` down through any nested
 * OPEN shadow roots.
 *
 * `root` matters: `document.activeElement` retargets to the shadow host, and a CLOSED
 * root cannot be reached from outside at all, so the panel's own root has to be passed
 * in by the code that created it.
 */
function deepActiveElement(root: Document | ShadowRoot): Element | null {
  let active: Element | null = root.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
}

/** Fields whose value the user can clear, so Escape has something local to do. */
const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA']);
// Escape means nothing to these input types, so they should not block the panel's own
// Escape handling the way a half-typed filter query does.
const NON_TEXT_INPUT_TYPES = new Set(['checkbox', 'radio', 'range', 'color', 'button', 'submit', 'reset', 'file', 'image']);

/** True while the user is typing into a field that has something in it to clear. */
function isEditingText(root: Document | ShadowRoot): boolean {
  const active = deepActiveElement(root) as HTMLElement | null;
  if (!active) return false;
  if (active.isContentEditable) return true;
  if (!EDITABLE_TAGS.has(active.tagName)) return false;
  const field = active as HTMLInputElement | HTMLTextAreaElement;
  if (field.readOnly || field.disabled) return false;
  if (active.tagName === 'INPUT' && NON_TEXT_INPUT_TYPES.has((field as HTMLInputElement).type)) return false;
  return !!field.value;
}

/**
 * Panel-level keyboard shortcuts: the command palette, global search, and the Escape
 * dismissal ladder.
 *
 * This lives here rather than in main.tsx because the pop-out window mounts through
 * window-main.tsx, which never called main.tsx's copy — so Ctrl+K and Ctrl+Shift+F were
 * simply dead in the pop-out. ModalShell registers its close callback, but this
 * handler owns Escape for both the rendered modal stack and the layers below.
 */
export function installPanelKeyboard({ dismissible, getRoot }: PanelKeyboardOptions): void {
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
        if (closeTopmostDialog(getRoot?.() ?? document)) return;
        // State fallback for a requested modal whose React commit has not run yet.
        if (store.pendingConfirmation) store.closeConfirmation();
        else if (store.exportOpen) store.setExportOpen(false);
        else if (store.commandOpen) store.setCommandOpen(false);
        else if (store.globalSearchOpen) store.setGlobalSearchOpen(false);
        else if (store.settingsOpen) store.setSettingsOpen(false);
        else if (store.replayEditorEntry) store.closeReplayEditor();
        else if (store.explainEntry) store.closeExplain();
        else if (store.findingSynthesisIds) store.closeFindingSynthesis();
        else if (store.compareOpen) store.closeComparison();
        // A registered layer (the Console inspector) closes before drawers and the panel.
        else if (closeEscapeLayer()) return;
        // The detail drawer closes before the panel itself does (and this is the
        // only Escape layer that also works in devtools/window mode).
        else if (store.apiDetailOpen && store.activeTab === 'api') store.setApiDetailOpen(false);
        else if (store.logDetailOpen && store.activeTab === 'logs' && store.entries.some((entry) => entry.id === store.selectedId && entry.type === 'log')) store.setLogDetailOpen(false);
        // Nothing layered on top: Escape dismisses the docked side panel itself.
        // Devtools and pop-out views persist — they aren't dismissible this way.
        //
        // Not while the user is typing, though. Escape-to-clear-the-field is the
        // reflex every one of these inputs trains, and destroying the whole panel
        // instead costs the filter text, the scroll position and the selection.
        else if (dismissible && store.open && !store.devtoolsMode && !isEditingText(getRoot?.() ?? document)) store.setOpen(false);
      }
    },
    true,
  );
}
