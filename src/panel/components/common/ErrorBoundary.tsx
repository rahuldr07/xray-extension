import React from 'react';
import { IconAlertTriangle, IconCopy, IconRefresh } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { copyText, safeStringify } from '../../utils';

const RENDER_FALLBACK_TEXT = "This value couldn't be displayed.";
const COPY_LIMIT = 500_000;
const iconProps = { size: 15, stroke: 1.8 } as const;

/** Copy raw's text: strings as captured, other scalars as written, anything else as JSON. */
function rawCopyText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === undefined) return 'undefined';
  if (value === null || typeof value !== 'object') return String(value);
  return safeStringify(value, 2, COPY_LIMIT);
}

function sameKeys(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && a.every((key, index) => Object.is(key, b[index]));
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** The value behind the view, read only when Copy raw is pressed. */
  raw: () => unknown;
  /** Any change (Object.is) clears a caught error: another entry, facet or view. */
  resetKeys?: readonly unknown[];
}

interface ErrorBoundaryState {
  failed: boolean;
  resetKeys: readonly unknown[];
}

/**
 * Keeps a render failure inside the view that hit it (spec J12). Without a boundary
 * React unmounts the whole panel; with it the view shows "This value couldn't be
 * displayed." with Copy raw (the underlying value as text) and Try again. A change in
 * `resetKeys` clears the failure without remounting children that rendered fine.
 * The error itself is reported once, by React's own onCaughtError (console.error).
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false, resetKeys: this.props.resetKeys ?? [] };
  private retryButton = React.createRef<HTMLButtonElement>();
  private retrying = false;

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { failed: true };
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState): Partial<ErrorBoundaryState> | null {
    const keys = props.resetKeys ?? [];
    return sameKeys(keys, state.resetKeys) ? null : { failed: false, resetKeys: keys };
  }

  componentDidCatch(): void {
    // React re-creates the fallback after a failed retry: keep focus on Try again.
    if (this.retrying) this.retryButton.current?.focus();
    this.retrying = false;
  }

  componentDidUpdate(): void {
    if (!this.state.failed) this.retrying = false;
  }

  private copyRaw = (event: React.MouseEvent): void => {
    event.stopPropagation();
    const showToast = usePanelStore.getState().showToast;
    let text: string;
    try {
      text = rawCopyText(this.props.raw());
    } catch {
      showToast('Could not copy: the value could not be read.');
      return;
    }
    const truncated = /\n\.\.\. truncated \d+ chars$/.test(text);
    copyText(text).then(
      () => showToast(`Raw value copied${truncated ? ' as a truncated preview' : ''}.`),
      () => showToast('Could not copy. Check clipboard permissions.'),
    );
  };

  private retry = (event: React.MouseEvent): void => {
    event.stopPropagation();
    this.retrying = true;
    this.setState({ failed: false });
  };

  render(): React.ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="xray-render-fallback" role="alert">
        <IconAlertTriangle className="xray-render-fallback-icon" size={16} stroke={1.8} aria-hidden="true" />
        <span className="xray-render-fallback-text">{RENDER_FALLBACK_TEXT}</span>
        <span className="xray-render-fallback-actions">
          <button type="button" className="xray-btn" onClick={this.copyRaw}><IconCopy {...iconProps} />Copy raw</button>
          <button type="button" className="xray-btn" ref={this.retryButton} onClick={this.retry}><IconRefresh {...iconProps} />Try again</button>
        </span>
      </div>
    );
  }
}
