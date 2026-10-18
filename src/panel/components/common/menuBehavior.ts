import React from 'react';
import { usePanelStore } from '../../store';
import { hasOpenDialog } from './ModalShell';

// The one implementation of the "disclosure of buttons" behaviour shared by
// DisclosureMenu (Rules), the request-detail More actions menu and the Console
// Snippets menu. These are plain groups of buttons, not ARIA menus.

/**
 * Dismissal while `open`: Escape (window capture, so it runs ahead of panelKeyboard
 * and never closes the panel too) and a press outside the wrapper, including a press
 * outside a closed shadow host. Escape is left alone when a panel dialog is open, since
 * the modal stack owns it. `onEscape` may claim the key first (return true), e.g. to
 * cancel an inline edit; otherwise the menu closes and the trigger regains focus.
 */
export function useMenuDismiss(
  open: boolean,
  wrapRef: React.RefObject<HTMLElement | null>,
  triggerRef: React.RefObject<HTMLElement | null>,
  onClose: () => void,
  onEscape?: () => boolean,
  requireOpenPanel = false,
): void {
  const closeRef = React.useRef(onClose);
  const escapeRef = React.useRef(onEscape);
  React.useEffect(() => { closeRef.current = onClose; escapeRef.current = onEscape; });
  React.useEffect(() => {
    const wrap = wrapRef.current;
    if (!open || !wrap) return;
    const root = wrap.getRootNode() as Document | ShadowRoot;
    const owner = wrap.ownerDocument;
    const win = owner.defaultView;
    function escape(event: KeyboardEvent): void {
      if (event.key !== 'Escape') return;
      // A menu left open on a panel that has since been closed must not swallow the page's Escape.
      if (!wrap?.getClientRects().length) return;
      // The request-detail menu also stands down once the panel itself is closed.
      if (requireOpenPanel) { const state = usePanelStore.getState(); if (!state.open && !state.devtoolsMode) return; }
      if (hasOpenDialog(root instanceof ShadowRoot ? root : document)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (escapeRef.current?.()) return;
      closeRef.current();
      triggerRef.current?.focus();
    }
    function outside(event: Event): void {
      if (!event.composedPath().includes(wrap as EventTarget)) closeRef.current();
    }
    function outsideShadow(event: Event): void {
      if (root instanceof ShadowRoot && !event.composedPath().includes(root.host)) closeRef.current();
    }
    win?.addEventListener('keydown', escape, true);
    root.addEventListener('pointerdown', outside, true);
    if (root instanceof ShadowRoot) owner.addEventListener('pointerdown', outsideShadow, true);
    return () => {
      win?.removeEventListener('keydown', escape, true);
      root.removeEventListener('pointerdown', outside, true);
      owner.removeEventListener('pointerdown', outsideShadow, true);
    };
  }, [open, wrapRef, triggerRef, requireOpenPanel]);
}

/**
 * Keyboard handling for the menu group: Tab/Shift+Tab leave the whole group (closing
 * it; focus continues after the disclosure, Shift+Tab lands on the trigger), and
 * Arrow/Home/End rove between enabled buttons. `skipInputs` leaves arrows to a text
 * field inside the menu.
 */
export function handleMenuKeyDown(
  event: React.KeyboardEvent<HTMLElement>,
  menu: HTMLElement | null,
  wrap: HTMLElement | null,
  trigger: HTMLElement | null,
  close: () => void,
  skipInputs = false,
): void {
  if (event.key === 'Tab') {
    event.preventDefault();
    close();
    const next = event.shiftKey ? null : focusableAfter(wrap);
    (next ?? trigger)?.focus();
    return;
  }
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || !menu) return;
  if (skipInputs && (event.target as HTMLElement).tagName === 'INPUT') return;
  const items = [...menu.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
  if (!items.length) return;
  const root = menu.getRootNode() as Document | ShadowRoot;
  const index = items.indexOf(root.activeElement as HTMLButtonElement);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
    : event.key === 'ArrowDown' ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
  event.preventDefault();
  items[next].focus();
}

/** Move focus to the first enabled button (or text field) when a menu opens. */
export function focusFirstItem(menu: HTMLElement | null, includeInputs = false): void {
  menu?.querySelector<HTMLElement>(includeInputs ? 'button:not(:disabled), input' : 'button:not(:disabled)')?.focus();
}

// First rendered, enabled focusable that follows `after` in DOM order.
function focusableAfter(after: HTMLElement | null): HTMLElement | null {
  if (!after) return null;
  const root = after.getRootNode() as Document | ShadowRoot;
  const scope: ParentNode = root instanceof ShadowRoot ? root : after.ownerDocument.body;
  const candidates = scope.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
  for (const candidate of candidates) {
    if (after.contains(candidate) || !candidate.getClientRects().length) continue;
    if (after.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING) return candidate;
  }
  return null;
}
