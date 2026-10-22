import React from 'react';
import { IconDatabase, IconExternalLink } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { openSqlWindowSurface } from '../../runtime/surfaces';
import type { XrayAppMode } from '../../types';
import { EmptyState } from '../common/EmptyState';

function sqlPageUrl(): string {
  // Fixture pages render the App without an extension runtime.
  return typeof chrome !== 'undefined' && chrome.runtime?.getURL ? chrome.runtime.getURL('sql.html') : 'sql.html';
}

// The DevTools panel and the pop-out are extension pages, so the client is framed in place. The HUD
// runs inside the inspected page: database rows must never render there, so it opens a window.
// `active` is false while another tab is showing: App keeps the frame mounted then (Ruling R16), and
// it is hidden rather than removed so the client's open database survives the tab switch.
export function SqlFrame({ mode, active = true }: { mode: XrayAppMode; active?: boolean }): React.ReactElement {
  const showToast = usePanelStore((state) => state.showToast);

  if (mode === 'hud') {
    return (
      <EmptyState
        icon={<IconDatabase size={26} stroke={1.5} />}
        label="SQL client"
        hint="The SQL client opens in its own window so database rows never render inside this page."
        action={
          <button className="xray-btn primary" onClick={() => openSqlWindowSurface({ showToast })}>
            <IconExternalLink size={16} stroke={1.8} />
            Open SQL client
          </button>
        }
      />
    );
  }

  return <iframe className="xray-sql-frame" title="SQL client" src={sqlPageUrl()} hidden={!active} />;
}
