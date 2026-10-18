import React from 'react';
import { focusFirstItem, handleMenuKeyDown, useMenuDismiss } from './menuBehavior';

// Disclosure of ordinary buttons (not an ARIA menu): the trigger carries
// aria-expanded/aria-controls, the popup is a role="group" with an accessible name.
// Behaviour lives in menuBehavior.ts, shared with the other two menus.
// Activating any button inside closes the group and returns focus to the trigger.
export function DisclosureMenu({ triggerClassName, triggerLabel, triggerTitle, trigger, menuLabel, children }: {
  triggerClassName: string;
  triggerLabel?: string;
  triggerTitle?: string;
  trigger: React.ReactNode;
  menuLabel: string;
  children: React.ReactNode;
}): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const menuId = React.useId();
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (open) focusFirstItem(menuRef.current);
  }, [open]);
  useMenuDismiss(open, wrapRef, triggerRef, () => setOpen(false));

  function close(): void {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div ref={wrapRef} className="xray-toolbar-menu">
      <button ref={triggerRef} className={triggerClassName} aria-label={triggerLabel} title={triggerTitle} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((value) => !value)}>{trigger}</button>
      {open && (
        <div
          id={menuId}
          ref={menuRef}
          className="xray-toolbar-menu-list"
          role="group"
          aria-label={menuLabel}
          onKeyDown={(event) => handleMenuKeyDown(event, menuRef.current, wrapRef.current, triggerRef.current, () => setOpen(false))}
          // Runs after the item's own handler (bubbling).
          onClick={(event) => { if ((event.target as HTMLElement).closest('button')) close(); }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
