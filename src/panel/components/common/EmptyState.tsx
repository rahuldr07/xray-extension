import React from 'react';
import { IconRadar2 } from '@tabler/icons-react';

// A calm, centered empty state: a soft glyph, a headline, an optional hint, and
// an optional action. Used everywhere a list or view has nothing to show yet.
export function EmptyState({ label, hint, icon, action }: { label: string; hint?: string; icon?: React.ReactNode; action?: React.ReactNode }): React.ReactElement {
  return (
    <div className="xray-empty" role="status">
      <span className="xray-empty-glyph">{icon || <IconRadar2 size={26} stroke={1.5} />}</span>
      <p className="xray-empty-title">{label}</p>
      {hint && <p className="xray-empty-hint">{hint}</p>}
      {action && <div className="xray-empty-action">{action}</div>}
    </div>
  );
}
