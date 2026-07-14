import React, { useMemo, useState } from 'react';
import { IconRepeat, IconSend } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { ModalShell } from '../common/ModalShell';
import { entryPath } from '../../models/entries';
import { parseBody, safeStringify } from '../../utils';
import type { XrayEntry } from '../../types';

const iconProps = { size: 16, stroke: 1.8 } as const;
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];

function headersToText(headers: unknown): string {
  if (!headers || typeof headers !== 'object') return '';
  return Object.entries(headers as Record<string, unknown>)
    .filter(([, value]) => String(value) !== '[redacted]')
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

function textToHeaders(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  text.split('\n').forEach((line) => {
    const idx = line.indexOf(':');
    if (idx <= 0) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) out[key] = value;
  });
  return out;
}

function bodyToText(entry: XrayEntry): string {
  if (entry.requestBody == null) return '';
  return typeof entry.requestBody === 'string' ? entry.requestBody : safeStringify(entry.requestBody, 2, 100_000);
}

export function ReplayModal(): React.ReactElement | null {
  const entry = usePanelStore((state) => state.replayEditorEntry);
  const close = usePanelStore((state) => state.closeReplayEditor);
  const replayEntry = usePanelStore((state) => state.replayEntry);

  const initial = useMemo(() => entry ? {
    method: String(entry.method || 'GET').toUpperCase(),
    url: String(entry.url || entry.urlPath || ''),
    headers: headersToText(entry.requestHeaders),
    body: bodyToText(entry),
  } : null, [entry]);

  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');

  React.useEffect(() => {
    if (!initial) return;
    setMethod(initial.method);
    setUrl(initial.url);
    setHeaders(initial.headers);
    setBody(initial.body);
  }, [initial]);

  if (!entry || !initial) return null;

  function send(): void {
    if (!entry) return;
    // parseBody keeps non-JSON text as a literal string (same rule the rest of
    // the panel applies to bodies) and maps '' to null.
    const parsedBody = parseBody(body);
    replayEntry(entry, {
      method,
      url,
      requestHeaders: textToHeaders(headers),
      requestBody: parsedBody,
    });
    close();
  }

  return (
    <ModalShell
      title="Edit & Replay"
      subtitle={`${entry.method || 'GET'} ${entryPath(entry)}`}
      icon={<IconRepeat {...iconProps} />}
      className="xray-replay-modal"
      onClose={close}
      footer={(
        <>
          <span className="xray-muted">Replays run from the inspected page and are recaptured as new entries.</span>
          <span className="xray-spacer" />
          <button className="xray-btn" onClick={close}>Cancel</button>
          <button className="xray-btn primary" onClick={send}><IconSend {...iconProps} />Send replay</button>
        </>
      )}
    >
      <div className="xray-replay-body">
        <div className="xray-replay-line">
          <select className="xray-select" value={method} onChange={(event) => setMethod(event.currentTarget.value)}>
            {METHODS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input className="xray-input" value={url} onChange={(event) => setUrl(event.currentTarget.value)} placeholder="https://api.example.com/endpoint" />
        </div>
        <label className="xray-field">
          <span>Headers (one per line)</span>
          <textarea className="xray-input xray-replay-headers" spellCheck={false} value={headers} onChange={(event) => setHeaders(event.currentTarget.value)} placeholder="content-type: application/json" />
        </label>
        <label className="xray-field">
          <span>Body</span>
          <textarea className="xray-input xray-replay-bodyfield" spellCheck={false} value={body} onChange={(event) => setBody(event.currentTarget.value)} placeholder='{ "key": "value" }' />
        </label>
      </div>
    </ModalShell>
  );
}
