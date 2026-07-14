import React from 'react';
import { IconDatabaseImport, IconTerminal2 } from '@tabler/icons-react';
import { JsonView } from './JsonView';
import { EmptyState } from '../common/EmptyState';
import { formatTime, preview } from '../../utils';
import { canFetchLogObjects, fetchLogObject, hasLazyRef } from '../../runtime/logObjects';
import type { XrayEntry } from '../../types';

const iconProps = { size: 16, stroke: 1.8 } as const;

export function LogDetail({ entry }: { entry: XrayEntry }): React.ReactElement {
  const previewData = entry.logData !== undefined ? entry.logData : entry.args ?? entry.message ?? null;
  const refs = Array.isArray(entry.objectRefs) ? entry.objectRefs.filter((ref): ref is string => typeof ref === 'string') : [];
  const canExpand = (refs.length > 0 || hasLazyRef(previewData)) && canFetchLogObjects();
  const [full, setFull] = React.useState<unknown>(undefined);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setFull(undefined);
    setLoading(false);
  }, [entry.id]);

  async function loadFull(): Promise<void> {
    setLoading(true);
    const resolved = await Promise.all(refs.map((ref) => fetchLogObject(ref)));
    setLoading(false);
    setFull(resolved.length === 1 ? resolved[0] : resolved);
  }

  const level = entry.logLevel || 'log';

  return (
    <div className="xray-log-detail">
      <div className="xray-log-detail-head">
        <span className={`xray-log-level ${level}`}><IconTerminal2 {...iconProps} />{level}</span>
        <span className="xray-muted">{formatTime(entry.timestamp)}</span>
        {canExpand && (
          <button className="xray-btn xray-log-load" disabled={loading} onClick={() => void loadFull()}>
            <IconDatabaseImport {...iconProps} />{loading ? 'Loading…' : full === undefined ? 'Load full object' : 'Reload'}
          </button>
        )}
      </div>
      {entry.message && typeof entry.message === 'string' && (
        <div className="xray-log-message">{preview(entry.message, 400)}</div>
      )}
      <div className="xray-log-detail-body">
        {full !== undefined
          ? <JsonView value={full} />
          : previewData == null
            ? <EmptyState label="No log payload" />
            : <JsonView value={previewData} />}
      </div>
      {canExpand && full === undefined && (
        <p className="xray-muted xray-log-hint">This is a lightweight preview. Load the full object to inspect deep or truncated values.</p>
      )}
    </div>
  );
}
