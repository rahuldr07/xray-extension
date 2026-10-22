import React from 'react';
import { IconDatabase, IconExternalLink } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { openSqlWindowSurface } from '../../runtime/surfaces';
import {
  nextSqlFrameReadiness,
  SQL_FRAME_READY_TIMEOUT_MS,
  type SqlFrameReadiness,
} from '../../models/sqlFrameReady';
import type { XrayAppMode } from '../../types';
import { EmptyState } from '../common/EmptyState';

const WINDOW_HINT = 'The SQL client opens in its own window so database rows never render inside this page.';
const BLOCKED_LINE = 'This site blocked the embedded client.';

function sqlPageUrl(): string {
  // Fixture pages render the App without an extension runtime.
  return typeof chrome !== 'undefined' && chrome.runtime?.getURL
    ? chrome.runtime.getURL('sql.html')
    : 'sql.html';
}

// The DevTools panel and the pop-out are extension pages, so the client is framed in place. The HUD
// runs inside the inspected page: by default it opens a window, so database rows never render there.
// With settings.sqlInlineInHud on, the HUD frames the client too (sql.html is web-accessible through
// its dynamic URL for this); the page cannot read the cross-origin frame.
// `active` is false while another tab is showing: App keeps the frame mounted then (Ruling R16), and
// it is hidden rather than removed so the client's open database survives the tab switch.
export function SqlFrame({
  mode,
  active = true,
}: {
  mode: XrayAppMode;
  active?: boolean;
}): React.ReactElement {
  const inlineInHud = usePanelStore((state) => state.settings.sqlInlineInHud);

  if (mode === 'hud') {
    return inlineInHud ? <HudInlineSqlFrame active={active} /> : <SqlWindowCard hint={WINDOW_HINT} />;
  }

  return <iframe className="xray-sql-frame" title="SQL client" src={sqlPageUrl()} hidden={!active} />;
}

function SqlWindowCard({ hint }: { hint: string }): React.ReactElement {
  const showToast = usePanelStore((state) => state.showToast);
  return (
    <EmptyState
      icon={<IconDatabase size={26} stroke={1.5} />}
      label="SQL client"
      hint={hint}
      action={
        <button className="xray-btn primary" onClick={() => openSqlWindowSurface({ showToast })}>
          <IconExternalLink size={16} stroke={1.8} />
          Open SQL client
        </button>
      }
    />
  );
}

// A page can keep an extension frame from loading. sql.html posts a ready message to its parent once
// it has rendered; without one in SQL_FRAME_READY_TIMEOUT_MS the frame gives way to the window card.
function HudInlineSqlFrame({ active }: { active: boolean }): React.ReactElement | null {
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const [readiness, setReadiness] = React.useState<SqlFrameReadiness>('waiting');

  React.useEffect(() => {
    if (readiness !== 'waiting') return undefined;
    const onMessage = (event: MessageEvent): void => {
      const frameWindow = frameRef.current?.contentWindow ?? null;
      setReadiness((state) =>
        nextSqlFrameReadiness(state, {
          kind: 'message',
          source: event.source,
          data: event.data,
          frameWindow,
        }),
      );
    };
    window.addEventListener('message', onMessage);
    const timer = window.setTimeout(
      () => setReadiness((state) => nextSqlFrameReadiness(state, { kind: 'timeout' })),
      SQL_FRAME_READY_TIMEOUT_MS,
    );
    return () => {
      window.removeEventListener('message', onMessage);
      window.clearTimeout(timer);
    };
  }, [readiness]);

  // Kept mounted behind another tab (Ruling R16), the card must not show there.
  if (readiness === 'timed-out')
    return active ? <SqlWindowCard hint={`${BLOCKED_LINE} ${WINDOW_HINT}`} /> : null;
  return (
    <iframe
      ref={frameRef}
      className="xray-sql-frame"
      title="SQL client"
      src={sqlPageUrl()}
      hidden={!active}
    />
  );
}
