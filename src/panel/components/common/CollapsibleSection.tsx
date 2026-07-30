import React from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { usePanelStore } from '../../store';

// The single collapsible-section primitive used across every workspace. A
// header button toggles a persisted collapsed state (keyed by `id`, default
// expanded); the body is removed from the flow when collapsed. Enter/Space come
// free from the native <button>; the CSS animates the chevron and body and
// honors prefers-reduced-motion. `right` renders controls (counts, actions)
// that stay clickable without toggling the section.
export function CollapsibleSection({ id, title, icon, right, bodyClassName, className, children }: {
  id: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  bodyClassName?: string;
  className?: string;
  children: React.ReactNode;
}): React.ReactElement {
  const collapsed = usePanelStore((state) => state.collapsedSections.has(id));
  const toggleSection = usePanelStore((state) => state.toggleSection);
  const bodyId = `xray-sec-${id}`;

  return (
    <section className={`xray-collapsible ${collapsed ? 'collapsed' : ''} ${className || ''}`}>
      <button
        type="button"
        className="xray-collapsible-header"
        aria-expanded={!collapsed}
        aria-controls={bodyId}
        onClick={() => toggleSection(id)}
      >
        <IconChevronDown size={15} stroke={2} className="xray-collapsible-chevron" />
        {icon && <span className="xray-collapsible-icon">{icon}</span>}
        <span className="xray-collapsible-title">{title}</span>
        {right && <span className="xray-collapsible-right" onClick={(event) => event.stopPropagation()}>{right}</span>}
      </button>
      {/* inert (not hidden) keeps the body in layout so the height can animate,
          while still removing it from the tab order and a11y tree when collapsed.
          The single inner wrapper is required by the grid-rows height animation
          (0fr↔1fr collapses cleanly only with exactly one grid child). */}
      <div id={bodyId} className="xray-collapsible-body" inert={collapsed} aria-hidden={collapsed}>
        <div className={`xray-collapsible-inner ${bodyClassName || ''}`}>{children}</div>
      </div>
    </section>
  );
}
