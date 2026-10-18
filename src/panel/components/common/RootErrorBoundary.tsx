import React from 'react';
import { IconAlertTriangle, IconEraser, IconRefresh } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import type { XrayAppMode } from '../../types';

const iconProps = { size: 15, stroke: 1.8 } as const;

interface RootErrorBoundaryProps {
  mode: XrayAppMode;
  children: React.ReactNode;
}

interface RootErrorBoundaryState {
  failed: boolean;
  /** Bumped by Reload panel: the panel remounts from the store, with fresh component state. */
  attempt: number;
}

/**
 * The last line of crash safety (spec J12): a render failure outside every view's own boundary —
 * in the shell, a workspace or a modal — used to unmount the whole panel, which left no Clear
 * button while the entry that caused it stayed in the saved session. The fallback keeps the panel's
 * frame and offers Reload panel (remount, nothing else changes; the host page is never reloaded) and
 * Clear session (confirmed like every destructive action, unless Settings turned confirmations off).
 * The error itself is reported once, by React's own onCaughtError (console.error).
 */
export class RootErrorBoundary extends React.Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  state: RootErrorBoundaryState = { failed: false, attempt: 0 };

  static getDerivedStateFromError(): Partial<RootErrorBoundaryState> {
    return { failed: true };
  }

  private reload = (): void => {
    this.setState((state) => ({ failed: false, attempt: state.attempt + 1 }));
  };

  render(): React.ReactNode {
    if (this.state.failed) return <RootFallback mode={this.props.mode} onReload={this.reload} />;
    return <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>;
  }
}

function RootFallback({ mode, onReload }: { mode: XrayAppMode; onReload(): void }): React.ReactElement {
  const open = usePanelStore((state) => state.open);
  const devtoolsMode = usePanelStore((state) => state.devtoolsMode);
  const settings = usePanelStore((state) => state.settings);
  const clearSession = usePanelStore((state) => state.clearSession);
  const [confirming, setConfirming] = React.useState(false);

  const clear = (): void => {
    clearSession();
    onReload();
  };
  // The rule requestConfirmation applies everywhere else; its modal is part of what failed.
  const askToClear = (): void => {
    if (settings.confirmDestructiveActions === false) clear();
    else setConfirming(true);
  };
  const dockable = mode === 'hud';

  return (
    <div
      className={`xray-panel xray-mode-${mode} ${dockable ? `xray-dock-${settings.dockSide}` : ''} ${open ? 'xray-open' : ''} ${devtoolsMode ? 'xray-devtools' : ''}`}
      style={{ '--xray-panel-width': `${settings.panelWidth}px` } as React.CSSProperties}
    >
      <div className="xray-root-fallback" role="alert">
        <IconAlertTriangle className="xray-root-fallback-icon" size={20} stroke={1.8} aria-hidden="true" />
        <h2 className="xray-root-fallback-title">XRAY couldn&apos;t show the panel.</h2>
        {confirming ? (
          <>
            <p className="xray-root-fallback-text">Clear the captured session? This removes requests, logs, console events, and pins.</p>
            <div className="xray-root-fallback-actions">
              <button type="button" className="xray-btn" onClick={() => setConfirming(false)}>Cancel</button>
              <button type="button" className="xray-btn danger" onClick={clear}><IconEraser {...iconProps} />Clear session</button>
            </div>
          </>
        ) : (
          <>
            <p className="xray-root-fallback-text">Something in the captured session could not be displayed. Reload the panel to try again, or clear the session to start over.</p>
            <div className="xray-root-fallback-actions">
              <button type="button" className="xray-btn primary" onClick={onReload}><IconRefresh {...iconProps} />Reload panel</button>
              <button type="button" className="xray-btn danger" onClick={askToClear}><IconEraser {...iconProps} />Clear session</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
