import React from 'react';
import { IconAlertCircle, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';

export type NoticeTone = 'info' | 'warning' | 'error';

const icons = {
  info: IconInfoCircle,
  warning: IconAlertTriangle,
  error: IconAlertCircle,
} as const;

/**
 * Shared callout: icon, tinted background, one line of text and an optional action.
 * Static notices are plain elements. Pass `live` only for a message that changes at
 * runtime (storage or bridge availability): info and warning then announce politely
 * as role="status", error as role="alert".
 */
export function Notice({ tone, children, action, live = false, className = '' }: {
  tone: NoticeTone;
  children: React.ReactNode;
  action?: React.ReactNode;
  live?: boolean;
  className?: string;
}): React.ReactElement {
  const Icon = icons[tone];
  const role = live ? (tone === 'error' ? 'alert' : 'status') : undefined;
  return (
    <div className={`xray-notice ${tone} ${className}`.trim()} role={role}>
      <Icon className="xray-notice-icon" size={16} stroke={1.8} aria-hidden="true" />
      <span className="xray-notice-text">{children}</span>
      {action && <span className="xray-notice-action">{action}</span>}
    </div>
  );
}
