import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { IconX } from '@tabler/icons-react';

const iconProps = { size: 16, stroke: 1.8 } as const;
type FocusRoot = Document | ShadowRoot;
const dialogCloseHandlers = new WeakMap<HTMLElement, () => void>();

function focusRoot(node: Node): FocusRoot {
  const root = node.getRootNode();
  return root instanceof ShadowRoot ? root : document;
}

function activeElementIn(root: FocusRoot): Element | null {
  let active: Element | null = root.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
}

interface ModalShellProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  onClose(): void;
}

function focusableElements(root: HTMLElement, activeRoot: FocusRoot): HTMLElement[] {
  const active = activeElementIn(activeRoot);
  return Array.from(root.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((element) => element.offsetParent !== null || element === active);
}

function topmostDialog(root: FocusRoot): HTMLElement | undefined {
  // Equal-z-index modal siblings paint in DOM order, not opening order. Only
  // include our registered shells, so page dialogs cannot enter the panel stack.
  const dialogs = Array.from(root.querySelectorAll<HTMLElement>('[role="dialog"]')).filter((dialog) => dialogCloseHandlers.has(dialog));
  return dialogs[dialogs.length - 1];
}

function isTopmostDialog(root: FocusRoot, dialog: HTMLElement): boolean {
  return topmostDialog(root) === dialog;
}

/** Whether any registered panel dialog is open in this root (it then owns Escape). */
export function hasOpenDialog(root: FocusRoot): boolean {
  return !!topmostDialog(root);
}

export function closeTopmostDialog(root: FocusRoot): boolean {
  const dialog = topmostDialog(root);
  if (!dialog) return false;
  dialogCloseHandlers.get(dialog)?.();
  return true;
}

function focusInitialElement(dialog: HTMLElement, root: FocusRoot, initialFocusRef?: React.RefObject<HTMLElement | null>): void {
  const explicit = initialFocusRef?.current;
  if (explicit && dialog.contains(explicit)) {
    explicit.focus();
    return;
  }
  const focusables = focusableElements(dialog, root);
  const first = focusables.find((element) => element.matches('input, select, textarea, [contenteditable="true"]')) || focusables[0] || null;
  first?.focus();
}

export function ModalShell({ title, subtitle, icon, className = '', children, footer, initialFocusRef, onClose }: ModalShellProps): React.ReactElement {
  const dialogRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    dialogCloseHandlers.set(dialog, onClose);
    return () => { dialogCloseHandlers.delete(dialog); };
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const root = focusRoot(dialog);
    const previous = activeElementIn(root);
    const topmost = topmostDialog(root);
    // A lower sibling's child autoFocus may already have run during the commit.
    if (topmost && (topmost === dialog || !topmost.contains(previous))) focusInitialElement(topmost, root, topmost === dialog ? initialFocusRef : undefined);

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Tab' || !dialog || !isTopmostDialog(root, dialog)) return;
      const focusables = focusableElements(dialog, root);
      if (!focusables.length) {
        event.preventDefault();
        return;
      }
      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];
      const active = activeElementIn(root);
      if (event.shiftKey && active === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && active === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      const topmost = topmostDialog(root);
      const active = activeElementIn(root);
      if (topmost && active && topmost.contains(active)) return;
      if (previous instanceof HTMLElement && previous.isConnected && (!topmost || topmost.contains(previous))) previous.focus();
      else if (topmost) focusInitialElement(topmost, root);
    };
  }, []);

  return (
    <div className="xray-modal-backdrop" onMouseDown={onClose}>
      <section
        ref={dialogRef}
        className={`xray-modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="xray-modal-head">
          {icon && <span className="xray-modal-title-icon">{icon}</span>}
          <div>
            <h3>{title}</h3>
            {subtitle && <div className="xray-modal-subtitle">{subtitle}</div>}
          </div>
          <span className="xray-spacer" />
          <button className="xray-icon-btn" onClick={onClose} aria-label={`Close ${title}`}><IconX {...iconProps} /></button>
        </header>
        {children}
        {footer && <footer className="xray-modal-foot">{footer}</footer>}
      </section>
    </div>
  );
}
