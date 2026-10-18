import React from 'react';
import { IconFileDiff } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { compareEntries, type ComparisonSection, type ComparisonValue } from '../../models/comparison';
import { entryPath } from '../../models/entries';
import { formatBytes, formatTime, safeStringify } from '../../utils';
import { ModalShell } from '../common/ModalShell';
import { JsonView } from '../detail/JsonView';

export function CompareModal(): React.ReactElement | null {
  const open = usePanelStore((state) => state.compareOpen);
  const leftId = usePanelStore((state) => state.compareLeftId);
  const rightId = usePanelStore((state) => state.compareRightId);
  const entries = usePanelStore((state) => state.entries);
  const setEntry = usePanelStore((state) => state.setComparisonEntry);
  const close = usePanelStore((state) => state.closeComparison);
  const swap = usePanelStore((state) => state.swapComparison);
  const clear = usePanelStore((state) => state.clearComparison);
  const left = entries.find((entry) => entry.id === leftId && entry.type === 'api');
  const right = entries.find((entry) => entry.id === rightId && entry.type === 'api');
  const result = React.useMemo(() => open && left && right ? compareEntries(left, right) : null, [open, left, right]);
  const apiEntries = React.useMemo(() => entries.filter((entry) => entry.type === 'api'), [entries]);

  if (!open) return null;

  return (
    <ModalShell title="Compare requests" subtitle="Captured evidence only · read-only" icon={<IconFileDiff size={16} stroke={1.8} />} className="xray-compare-modal" onClose={close}
      footer={<><button className="xray-action-btn" aria-label="Swap comparison sides" disabled={!leftId && !rightId} onClick={swap}>Swap sides</button><span className="xray-spacer" /><button className="xray-action-btn" onClick={clear}>Clear comparison</button></>}>
      <div className="xray-modal-body xray-compare-body">
        <div className="xray-compare-selectors">
          {(['left', 'right'] as const).map((side) => {
            const id = side === 'left' ? leftId : rightId;
            const entry = side === 'left' ? left : right;
            const label = side === 'left' ? 'Left' : 'Right';
            return <label key={side}>{label} request
              <select className="xray-input" aria-label={`${label} comparison request`} value={id || ''} onChange={(event) => setEntry(side, event.currentTarget.value || null)}>
                <option value="">Select a request…</option>
                {id && !entry && <option value={id}>No longer retained</option>}
                {apiEntries.map((item) => <option key={item.id} value={item.id}>{item.method || 'GET'} {entryPath(item)}{item.status ? ` · ${item.status}` : ''}{item.timestamp ? ` · ${formatTime(item.timestamp)}` : ''}</option>)}
              </select>
            </label>;
          })}
        </div>
        {!result && <p className="xray-compare-notice" role="status">{(leftId && !left) || (rightId && !right) ? 'A comparison request is no longer retained. Select another request or clear comparison.' : 'Select a left and right request to compare any two captured API entries.'}</p>}
        {result && <>
          <section className="xray-compare-section" aria-label="Identity evidence">
            <h4>Identity</h4>
            <EvidenceTable label="Identity differences" rows={Object.entries(result.identity.fields).map(([label, value]) => ({ label, value }))} />
          </section>
          <section className="xray-compare-section" aria-label="Status, timing and size evidence">
            <h4>Status, Timing &amp; Size</h4>
            <EvidenceTable label="Status, timing and size differences" rows={[
              { label: 'Status', value: result.status },
              { label: 'Timing', value: result.timing, format: (value) => `${value}ms` },
              { label: 'Size', value: result.size, format: (value) => formatBytes(Number(value)) },
            ]} />
          </section>
          {([
            ['Request headers', result.requestHeaders], ['Request body', result.requestBody],
            ['Response headers', result.responseHeaders], ['Response body', result.responseBody],
          ] as const).map(([label, section]) => <StructuralEvidence key={label} label={label} section={section} />)}
        </>}
      </div>
    </ModalShell>
  );
}

function Value({ value, format }: { value: unknown; format?: (value: unknown) => string }): React.ReactElement {
  if (value === undefined || value === null) return <span className="xray-muted">Unavailable</span>;
  if (format) return <span>{format(value)}</span>;
  const text = typeof value === 'string' ? value : safeStringify(value, 2, 20_000);
  if (text.length > 20_000) return <pre className="xray-compare-text">{text.slice(0, 20_000)}{'\n… Truncated evidence preview (20,000-character limit).'}</pre>;
  if (typeof value === 'string') return <pre className="xray-compare-text">{value}</pre>;
  return <JsonView value={value} />;
}

type ResultKind = 'changed' | 'equal' | 'unavailable';

function resultKind(value: ComparisonValue): ResultKind {
  if (value.left === undefined || value.right === undefined) return 'unavailable';
  return value.changed ? 'changed' : 'equal';
}

function EvidenceTable({ label, rows }: { label: string; rows: Array<{ label: string; value: ComparisonValue; format?: (value: unknown) => string }> }): React.ReactElement {
  const [showEqual, setShowEqual] = React.useState(false);
  const equalCount = rows.filter((row) => resultKind(row.value) === 'equal').length;
  const visible = showEqual ? rows : rows.filter((row) => resultKind(row.value) !== 'equal');
  const toggleLabel = showEqual ? 'Hide equal fields' : `Show ${equalCount} equal ${equalCount === 1 ? 'field' : 'fields'}`;
  return <>
    {visible.length > 0 && <table className="xray-table xray-compare-table" aria-label={label}>
      <thead><tr><th scope="col">Evidence</th><th scope="col">Left</th><th scope="col">Right</th><th scope="col">Result</th></tr></thead>
      <tbody>{visible.map((row) => {
        const kind = resultKind(row.value);
        return <tr key={row.label}>
          <th scope="row">{row.label}</th><td><Value value={row.value.left} format={row.format} /></td><td><Value value={row.value.right} format={row.format} /></td>
          <td className={`xray-compare-result ${kind}`}>{kind === 'unavailable' ? 'Unavailable' : kind === 'changed' ? 'Changed' : 'Equal'}</td>
        </tr>;
      })}</tbody>
    </table>}
    {equalCount > 0 && <button type="button" className="xray-compare-equal-toggle" aria-expanded={showEqual} onClick={() => setShowEqual((open) => !open)}>{toggleLabel}</button>}
  </>;
}

function StructuralEvidence({ label, section }: { label: string; section: ComparisonSection }): React.ReactElement {
  return <section className="xray-compare-section" aria-label={`${label} evidence`}>
    <h4>{label}</h4>
    {section.notices.length > 0 && <ul className="xray-compare-notice" aria-label={`${label} unavailable notices`}>{section.notices.map((notice) => <li key={notice}>{notice}</li>)}</ul>}
    {!section.differences.length && <p className="xray-muted">{section.notices.length ? 'No differences in available evidence; unavailable values cannot establish equality.' : 'No structural differences in captured evidence.'}</p>}
    {section.differences.length > 0 && <table className="xray-table xray-compare-table" aria-label={`${label} differences`}>
      <thead><tr><th scope="col">Path / change</th><th scope="col">Left</th><th scope="col">Right</th></tr></thead>
      <tbody>{section.differences.map((change, index) => <tr key={`${change.path}:${index}`}>
        <th scope="row"><code>{change.path || '(root)'}</code><small>{change.kind}</small></th>
        <td><Value value={change.before} /></td><td><Value value={change.after} /></td>
      </tr>)}</tbody>
    </table>}
    <details className="xray-compare-captured"><summary>Captured {label.toLowerCase()} values</summary>
      <div className="xray-compare-values"><div><h5>Left</h5><Value value={section.left} /></div><div><h5>Right</h5><Value value={section.right} /></div></div>
    </details>
  </section>;
}
