import React, { useEffect, useId, useRef, useState } from 'react';
import { IconCheck, IconCopy, IconExternalLink, IconRefresh, IconTerminal2 } from '@tabler/icons-react';
import { usePanelSqlStore } from '../../sqlStore';
import { helperInstallCommand, helperOs } from '../../models/sqlProfiles';

const README = 'https://github.com/rahuldr07/xray-extension/tree/main/helper#readme';

function platform(): string {
  if (typeof navigator === 'undefined') return '';
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  return nav.userAgentData?.platform ?? nav.platform ?? '';
}

/** Install (or update) the database helper: the one-line command for this OS, Copy and Retry. */
export function HelperInstallCard({ state, compact = false }: { state: 'missing' | 'outdated'; compact?: boolean }): React.ReactElement {
  const refreshRemote = usePanelSqlStore((s) => s.refreshRemote);
  const titleId = useId();
  const command = helperInstallCommand(helperOs(platform()));
  const [copied, setCopied] = useState<'ok' | 'failed' | null>(null);
  const [retrying, setRetrying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(command);
      setCopied('ok');
    } catch {
      setCopied('failed');
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 2000);
  }

  async function retry(): Promise<void> {
    setRetrying(true);
    try {
      await refreshRemote();
    } finally {
      setRetrying(false);
    }
  }

  const title = state === 'outdated' ? 'Update the XRAY database helper' : 'Install the XRAY database helper';
  return (
    <section className={`xray-sql-helper-card${compact ? ' compact' : ''}`} aria-labelledby={titleId}>
      <div className="xray-sql-helper-card-head">
        <span className="xray-sql-helper-card-icon" aria-hidden="true">
          <IconTerminal2 size={16} stroke={1.8} />
        </span>
        <h2 id={titleId}>{title}</h2>
      </div>
      <p>Postgres and MySQL need a small helper app on this computer. Run this once in a terminal, then click Retry.</p>
      <div className="xray-sql-helper-command">
        {/* <wbr> after each slash: a narrow card wraps the URL at path boundaries, never mid-word. */}
        <code>
          {command.split('/').map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <>
                  /<wbr />
                </>
              )}
              {part}
            </React.Fragment>
          ))}
        </code>
        <button type="button" className="xray-btn xray-btn-sm" onClick={() => void copy()}>
          {copied === 'ok' ? <IconCheck size={13} stroke={2} aria-hidden="true" /> : <IconCopy size={13} stroke={1.8} aria-hidden="true" />}
          Copy
        </button>
      </div>
      {copied && (
        <span className="xray-visually-hidden" role="status">
          {copied === 'ok' ? 'Copied the command.' : 'Could not copy to the clipboard.'}
        </span>
      )}
      <div className="xray-sql-helper-card-foot">
        <a href={README} target="_blank" rel="noreferrer">
          What does it install?
          <IconExternalLink size={12} stroke={1.8} aria-hidden="true" />
        </a>
        <span className="xray-spacer" />
        <button type="button" className="xray-btn xray-btn-sm" disabled={retrying} onClick={() => void retry()}>
          <IconRefresh size={13} stroke={1.8} aria-hidden="true" />
          Retry
        </button>
      </div>
    </section>
  );
}
