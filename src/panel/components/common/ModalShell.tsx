import React, { useEffect, useRef } from 'react';
import { IconX } from '@tabler/icons-react';

const iconProps = { size: 16, stroke: 1.8 } as const;

interface ModalShellProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose(): void;
}

function focusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((element) => element.offsetParent !== null || element === document.activeElement);
}

export function ModalShell({ title, subtitle, icon, className = '', children, footer, onClose }: ModalShellProps): React.ReactElement {
  const dialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const first = dialog ? focusableElements(dialog)[0] : null;
    first?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusables = focusableElements(dialog);
      if (!focusables.length) {
        event.preventDefault();
        return;
      }
      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      previous?.focus();
    };
  }, [onClose]);

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
