import React from 'react';
import { IconDatabaseImport, IconTerminal2, IconX } from '@tabler/icons-react';
import { JsonView } from './JsonView';
import { EmptyState } from '../common/EmptyState';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { formatTime, preview } from '../../utils';
import { canFetchLogObjects, fetchLogObject } from '../../runtime/logObjects';
import { isTypedLog, logCopyText, logPayload, logPayloadDisplay, logPayloadWithFull, type LogPayload } from '../../models/logValue';
import type { XrayEntry } from '../../types';

const iconProps = { size: 16, stroke: 1.8 } as const;

/**
 * The log's value tree (spec J7): typed values read as `10n`, `NaN`, `undefined`,
 * `ƒ name()`, `Map(3)`…; one argument is the value itself, several sit under
 * "arguments". Built inside the error boundary, so a value that cannot be read (only a
 * hand-built one can) shows the fallback instead of unmounting the panel.
 */
function LogPayloadView({ entry, full }: { entry: XrayEntry; full: LogPayload | undefined }): React.ReactElement {
  // Memoized: the viewer resets its open/closed state when its value's identity changes.
  const view = React.useMemo(() => {
    const payload = full ?? logPayload(entry);
    return { payload, display: logPayloadDisplay(payload) };
  }, [entry, full]);
  if (view.payload.kind === 'empty') return <EmptyState label={view.payload.label} />;
  return <JsonView value={view.display} />;
}

export function LogDetail({ entry, onClose }: { entry: XrayEntry; onClose?: () => void }): React.ReactElement {
  const refs = Array.isArray(entry.objectRefs) ? entry.objectRefs.filter((ref): ref is string => typeof ref === 'string') : [];
  const canExpand = refs.length > 0 && canFetchLogObjects();
  const [full, setFull] = React.useState<LogPayload | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  // The page answered nothing for every handle: it reloaded or released the objects.
  const [gone, setGone] = React.useState(false);

  const currentIdRef = React.useRef(entry.id);

  React.useEffect(() => {
    currentIdRef.current = entry.id;
    setFull(undefined);
    setLoading(false);
    setGone(false);
  }, [entry.id]);

  async function loadFull(): Promise<void> {
    const requestedId = entry.id;
    setLoading(true);
    try {
      const resolved = await Promise.all(refs.map((ref) => fetchLogObject(ref)));
      // A slow load must not paint its object into a different log's detail.
      if (currentIdRef.current !== requestedId) return;
      const missing = resolved.every((value) => value == null);
      setGone(missing);
      // Each full object takes its argument's place; with nothing back the preview stays.
      setFull(missing ? undefined : logPayloadWithFull(entry, resolved));
    } catch {
      // The preview stays; the button can be pressed again.
    } finally {
      if (currentIdRef.current === requestedId) setLoading(false);
    }
  }

  // Copy raw: a typed log as its text (never the model's envelopes); a pre-model one as
  // it was captured.
  const rawValue = (): unknown => {
    if (isTypedLog(entry)) return logCopyText(full ?? logPayload(entry));
    if (full?.kind === 'value') return full.value;
    return entry.logData !== undefined ? entry.logData : entry.args ?? entry.message ?? null;
  };

  const level = entry.logLevel || 'log';

  return (
    <div className="xray-log-detail">
      <div className="xray-log-detail-head">
        <span className={`xray-log-level ${level}`}><IconTerminal2 {...iconProps} />{level}</span>
        {/* The clock time is data (spec S2), mono like the row timestamps. */}
        <span className="xray-muted xray-num">{formatTime(entry.timestamp)}</span>
        {canExpand && (
          <button className="xray-btn xray-log-load" disabled={loading} onClick={(event) => { event.stopPropagation(); void loadFull(); }}>
            <IconDatabaseImport {...iconProps} />{loading ? 'Loading…' : full === undefined ? 'Load full object' : 'Reload'}
          </button>
        )}
        {onClose && <button className={`xray-icon-btn xray-detail-close xray-log-close ${canExpand ? '' : 'solo'}`} aria-label="Close selected log detail" onClick={onClose}><IconX {...iconProps} /></button>}
      </div>
      {entry.message && typeof entry.message === 'string' && (
        <div className="xray-log-message">{preview(entry.message, 400)}</div>
      )}
      <div className="xray-log-detail-body">
        {/* J12: a value that fails to render keeps the header (Load full object, close) usable. */}
        <ErrorBoundary resetKeys={[entry.id, full]} raw={rawValue}>
          <LogPayloadView entry={entry} full={full} />
        </ErrorBoundary>
      </div>
      {canExpand && full === undefined && (
        <p className="xray-muted xray-log-hint">
          {gone
            ? 'The full object is no longer available (the page reloaded or released it). Showing the preview.'
            : 'This is a lightweight preview. Load the full object to inspect deep or truncated values.'}
        </p>
      )}
    </div>
  );
}
