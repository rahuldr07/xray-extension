import React, { useState } from 'react';
import { IconAlertCircle, IconAlertTriangle, IconChevronDown, IconInfoCircle, IconRestore, IconX } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { isFindingDismissed } from '../../models/findings';
import type { FindingEvidence, FindingRecord, FindingSeverity } from '../../models/findings';
import { formatBytes } from '../../utils';
import { iconProps } from '../shell/panelTabs';

type FindingFilter = 'active' | 'history' | 'dismissed';

interface FindingGroup { key: string; lead: FindingEvidence | null; records: FindingRecord[] }

// S34: findings for the same request sit under one request line. The lead
// evidence (the "current" one when present) names the request.
function groupByRequest(records: FindingRecord[]): FindingGroup[] {
  const groups = new Map<string, FindingGroup>();
  for (const record of records) {
    const lead = record.evidence.find(ref => ref.role === 'current') || record.evidence[0] || null;
    const key = lead ? `${lead.method} ${lead.origin}${lead.path}` : 'no-request';
    const group = groups.get(key) || { key, lead, records: [] };
    group.records.push(record);
    groups.set(key, group);
  }
  return [...groups.values()];
}

function SeverityIcon({ severity }: { severity: FindingSeverity }): React.ReactElement {
  const Icon = severity === 'error' ? IconAlertCircle : severity === 'warning' ? IconAlertTriangle : IconInfoCircle;
  return <span className={`xray-finding-severity ${severity}`} title={severity}><Icon {...iconProps} aria-hidden="true" /><span className="xray-visually-hidden">{severity}</span></span>;
}

export function FindingsPanel(): React.ReactElement {
  const ledger = usePanelStore(state => state.findings);
  const entries = usePanelStore(state => state.entries);
  const sessionId = usePanelStore(state => state.session.sessionId);
  const dismiss = usePanelStore(state => state.dismissFinding);
  const restore = usePanelStore(state => state.restoreFinding);
  const openEvidence = usePanelStore(state => state.openFindingEvidence);
  const openSynthesis = usePanelStore(state => state.openFindingSynthesis);
  const [filter, setFilter] = useState<FindingFilter>('active');
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const [selection, setSelection] = useState<{ sessionId: string; ids: string[] }>({ sessionId, ids: [] });
  const records: FindingRecord[] = ledger.findings;
  const selected = selection.sessionId === sessionId && ledger.sessionId === sessionId
    ? selection.ids.filter(id => records.some(record => record.id === id)) : [];
  const visible = records.filter(record => {
    const dismissed = isFindingDismissed(record, ledger.dismissals);
    return filter === 'dismissed' ? dismissed : !dismissed && (filter === 'active' ? record.active : !record.active);
  });
  const groups = groupByRequest(visible);
  const atLimit = selected.length >= 5;

  function toggle(id: string): void {
    const ids = selected.includes(id) ? selected.filter(item => item !== id) : selected.length < 5 ? [...selected, id] : selected;
    setSelection({ sessionId, ids });
  }
  // Dismiss/Restore always moves the row to another view, so it unmounts under focus.
  // Hand focus to the next row's same action, else the previous row's, else the
  // active view filter, before the row goes.
  function toggleDismissed(record: FindingRecord, dismissed: boolean, button: HTMLElement): void {
    const section = button.closest('.xray-findings');
    const rows = section ? [...section.querySelectorAll<HTMLElement>('.xray-finding-row')] : [];
    const index = rows.findIndex(row => row.contains(button));
    const neighbour = rows[index + 1] ?? rows[index - 1];
    const target = neighbour?.querySelector<HTMLElement>('.xray-finding-dismiss')
      ?? section?.querySelector<HTMLElement>('.xray-findings-filters [aria-pressed="true"]');
    target?.focus();
    if (dismissed) restore(record.id); else dismiss(record.id);
  }
  function toggleExpanded(id: string): void {
    setExpanded(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  return <section className="xray-card xray-findings" aria-label="Findings">
    <div className="xray-findings-toolbar">
      <h4>Findings</h4>
      <div className="xray-findings-filters" role="group" aria-label="Finding filters">
        {(['active', 'history', 'dismissed'] as const).map(value => <button key={value} type="button" className={`xray-chip ${filter === value ? 'active' : ''}`}
          aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === 'active' ? 'Active' : value === 'history' ? 'History' : 'Dismissed'}</button>)}
      </div>
      <span className="xray-spacer" />
      <button type="button" className="xray-chip xray-findings-synthesize" disabled={!selected.length}
        title="Opens an exact compact-facts preview; nothing is sent until Analyze. Up to 5 findings."
        onClick={() => openSynthesis(selected)}>{selected.length ? `Synthesize (${selected.length})` : 'Synthesize'}</button>
    </div>
    <span className="xray-visually-hidden" role="status">{selected.length} of 5 findings selected</span>
    {!visible.length && <p className="xray-muted">No {filter} findings.</p>}
    {groups.map(group => <div className="xray-finding-group" key={group.key} role="group"
      aria-label={group.lead ? `Request ${group.lead.method} ${group.lead.path}` : 'Findings without a request'}>
      <div className="xray-finding-request" title={group.lead ? `${group.lead.method} ${group.lead.origin}${group.lead.path}` : undefined}>
        {group.lead ? <>
          <span className="xray-method">{group.lead.method}</span>
          <span className="xray-finding-path">{group.lead.path}</span>
          <span className="xray-muted xray-finding-request-meta">{group.lead.status || 'No status'} · {Math.round(group.lead.durationMs)}ms · {formatBytes(group.lead.size)}</span>
        </> : <span className="xray-muted">No request reference retained</span>}
      </div>
      {group.records.map(record => {
        const dismissed = isFindingDismissed(record, ledger.dismissals);
        const isOpen = expanded.has(record.id);
        const detailsId = `xray-finding-${record.id}`;
        const retainedFor = (ref: FindingEvidence): boolean => ref.sessionId === sessionId && record.sessionId === sessionId
          && entries.some(entry => entry.id === ref.entryId && entry.type === 'api');
        const unavailable = record.evidence.some(ref => !retainedFor(ref));
        return <article className={`xray-finding-row ${record.severity} ${dismissed ? 'dismissed' : ''}`} key={record.id} aria-label={record.title}>
          <div className="xray-finding-line">
            <input type="checkbox" aria-label={`Select finding ${record.title} ${record.id}`}
              checked={selected.includes(record.id)} disabled={atLimit && !selected.includes(record.id)}
              title={atLimit && !selected.includes(record.id) ? 'Up to 5 findings' : undefined}
              onChange={() => toggle(record.id)} />
            <SeverityIcon severity={record.severity} />
            <span className="xray-finding-title">{record.title}</span>
            {(!record.active || dismissed) && <span className="xray-muted xray-finding-tags">{!record.active ? 'History' : ''}{!record.active && dismissed ? ' · ' : ''}{dismissed ? 'Dismissed' : ''}</span>}
            {unavailable && <span className="xray-muted xray-finding-tags">Evidence unavailable</span>}
            <span className="xray-spacer" />
            <button type="button" className="xray-icon-btn xray-finding-action" aria-expanded={isOpen} aria-controls={detailsId}
              aria-label={`Details for ${record.title}`} title={isOpen ? 'Hide details' : 'Show details'} onClick={() => toggleExpanded(record.id)}>
              <IconChevronDown {...iconProps} className={`xray-finding-chevron ${isOpen ? 'open' : ''}`} />
            </button>
            <button type="button" className="xray-icon-btn xray-finding-action xray-finding-dismiss" aria-label={`${dismissed ? 'Restore' : 'Dismiss'} ${record.title}`}
              title={dismissed ? 'Restore' : 'Dismiss'} onClick={(event) => toggleDismissed(record, dismissed, event.currentTarget)}>
              {dismissed ? <IconRestore {...iconProps} /> : <IconX {...iconProps} />}
            </button>
          </div>
          <div className="xray-finding-details" id={detailsId} hidden={!isOpen}>
            <p>{record.summary}</p>
            <ul className="xray-finding-evidence" aria-label={`${record.title} evidence`}>
              {record.evidence.map((ref, index) => {
                const retained = retainedFor(ref);
                return <li key={`${ref.entryId}:${index}`}>
                  <button type="button" className="xray-chip" disabled={!retained}
                    aria-label={`Open evidence ${ref.role} ${ref.entryId} for ${record.title}`}
                    onClick={() => openEvidence(record.id, ref.entryId)}>{ref.role}: {ref.method} {ref.path}</button>
                  <span className="xray-muted"> · {ref.status || 'Status unavailable'} · {Math.round(ref.durationMs)}ms · {formatBytes(ref.size)}{!retained ? ' · Evidence unavailable — no longer retained in this session' : ''}</span>
                </li>;
              })}
            </ul>
            {!record.evidence.length && <p className="xray-muted">Evidence unavailable — no compact references retained.</p>}
          </div>
        </article>;
      })}
    </div>)}
  </section>;
}
