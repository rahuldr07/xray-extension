import React from 'react';

export function EmptyState({ label }: { label: string }): React.ReactElement {
  return <div className="xray-card xray-muted" style={{ margin: 12, textAlign: 'center' }}>{label}</div>;
}
