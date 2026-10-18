import React, { useMemo, useState } from 'react';
import { IconRepeat, IconSend } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { ModalShell } from '../common/ModalShell';
import { Notice } from '../common/Notice';
import { ToggleField } from '../common/ToggleField';
import { entryPath } from '../../models/entries';
import { parseBody, safeStringify } from '../../utils';
import type { XrayEntry } from '../../types';

const iconProps = { size: 16, stroke: 1.8 } as const;
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];

function headersToText(headers: unknown): string {
  if (!headers || typeof headers !== 'object') return '';
  return Object.entries(headers as Record<string, unknown>)
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

function originOf(value: string): string | null {
  try { return new URL(value).origin; } catch { return null; }
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
  const [retargetAcknowledged, setRetargetAcknowledged] = useState(false);

  React.useEffect(() => {
    if (!initial) return;
    setMethod(initial.method);
    setUrl(initial.url);
    setHeaders(initial.headers);
    setBody(initial.body);
    setRetargetAcknowledged(false);
  }, [initial]);

  if (!entry || !initial) return null;

  // The acknowledgement exists for retargeting: it is only asked for (and only
  // sent) while the edited URL leaves the captured request's origin.
  const editedOrigin = originOf(url.trim());
  const capturedOrigin = originOf(initial.url);
  const crossOrigin = editedOrigin !== null && capturedOrigin !== null && editedOrigin !== capturedOrigin;

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
          <span className="xray-modal-foot-meta">Replays run from the inspected page and are recaptured as new entries.</span>
          <span className="xray-spacer" />
          <button className="xray-btn" onClick={close}>Cancel</button>
          <button className="xray-btn" onClick={() => {
            const id = usePanelStore.getState().draftExperiment(entry, { method, url, headers: textToHeaders(headers), body: parseBody(body), retargetAcknowledged: crossOrigin && retargetAcknowledged });
            if (id) close();
          }}>Prepare experiment</button>
          <button className="xray-btn primary" onClick={send}><IconSend {...iconProps} />Send replay</button>
        </>
      )}
    >
      <div className="xray-replay-body xray-modal-body">
        <div className="xray-replay-line">
          <select className="xray-select" aria-label="Replay method" value={method} onChange={(event) => setMethod(event.currentTarget.value)}>
            {METHODS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input className="xray-input" aria-label="Replay URL" value={url} onChange={(event) => {
            const next = event.currentTarget.value;
            // An acknowledgement belongs to one target origin; a new origin needs a fresh one.
            if (originOf(next.trim()) !== originOf(url.trim())) setRetargetAcknowledged(false);
            setUrl(next);
          }} placeholder="https://api.example.com/endpoint…" />
        </div>
        <label className="xray-field">
          <span>Headers (one per line)</span>
          <textarea className="xray-input xray-replay-headers" spellCheck={false} value={headers} onChange={(event) => setHeaders(event.currentTarget.value)} placeholder="content-type: application/json" />
        </label>
        <label className="xray-field">
          <span>Body</span>
          <textarea className="xray-input xray-replay-bodyfield" spellCheck={false} value={body} onChange={(event) => setBody(event.currentTarget.value)} placeholder='{ "key": "value" }' />
        </label>
        {crossOrigin && (
          <>
            <Notice tone="warning">This URL is on a different origin ({editedOrigin}) than the captured request ({capturedOrigin}).</Notice>
            <ToggleField label="Acknowledge cross-origin experiment retargeting (original secrets will not be restored)" checked={retargetAcknowledged} onChange={setRetargetAcknowledged} />
          </>
        )}
      </div>
    </ModalShell>
  );
}
