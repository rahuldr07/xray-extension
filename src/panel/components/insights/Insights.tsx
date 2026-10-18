import React from 'react';
import { IconRoute } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { buildInsightsSummary } from '../../models/insights';
import { formatBytes } from '../../utils';
import { CollapsibleSection } from '../common/CollapsibleSection';
import { iconProps } from '../shell/panelTabs';
import { FindingsPanel } from './FindingsPanel';

export function Insights(): React.ReactElement {
  const entries = usePanelStore((state) => state.entries);
  const setApiSearchQuery = usePanelStore((state) => state.setApiSearchQuery);
  const setActiveTab = usePanelStore((state) => state.setActiveTab);
  const slowThresholdMs = usePanelStore((state) => state.settings.slowThresholdMs);
  const summary = buildInsightsSummary(entries, slowThresholdMs);

  function openEndpoint(path: string): void {
    setApiSearchQuery(path);
    setActiveTab('api');
  }

  return (
    <section className="xray-page">
      <header className="xray-page-head">
        <div>
          <h3>Insights</h3>
          <p>Local signals from captured requests. AI synthesis only runs after a reviewed preview and explicit Analyze.</p>
        </div>
      </header>
      <div className="xray-insight-strip" role="group" aria-label="Capture overview">
        <InsightMetric label="Requests" value={String(summary.requests)} />
        <InsightMetric label="Errors" value={String(summary.errors)} tone={summary.errors ? 'error' : 'ok'} />
        <InsightMetric label="Slow" value={String(summary.slow)} tone={summary.slow ? 'warn' : 'ok'} />
        <InsightMetric label="Average" value={`${Math.round(summary.avgDuration)}ms`} />
        <InsightMetric label="Payload" value={formatBytes(summary.totalBytes)} />
      </div>
      <FindingsPanel />
      <div className="xray-insight-columns">
        <CollapsibleSection id="insights-repeated" title="Repeated endpoints" className="xray-card">
          {summary.nPlusOneCandidates.length ? summary.nPlusOneCandidates.map((item) => (
            <button key={item.label} className="xray-insight-row" onClick={() => openEndpoint(item.path)}>
              <IconRoute {...iconProps} />
              <span>{item.label}</span>
              <strong>{item.count}x</strong>
            </button>
          )) : <p className="xray-muted">No repeated endpoint pattern above threshold.</p>}
        </CollapsibleSection>
        <CollapsibleSection id="insights-slowest" title="Slowest requests" className="xray-card">
          {summary.topSlowRequests.map((item) => (
            <button key={item.id} className="xray-insight-row" onClick={() => openEndpoint(item.path)}>
              <span className="xray-method">{item.method}</span>
              <span>{item.path}</span>
              <strong>{Math.round(item.duration)}ms</strong>
            </button>
          ))}
        </CollapsibleSection>
        <CollapsibleSection id="insights-status" title="Status mix" className="xray-card">
          {Object.entries(summary.statusCounts).map(([bucket, count]) => (
            <div key={bucket} className="xray-status-mix-row">
              <span>{bucket}</span>
              <span className="xray-bar-track"><span className="xray-bar" style={{ width: `${Math.max(8, count / Math.max(1, summary.requests) * 100)}%` }} /></span>
              <strong>{count}</strong>
            </div>
          ))}
        </CollapsibleSection>
      </div>
    </section>
  );
}

function InsightMetric({ label, value, tone = '' }: { label: string; value: string; tone?: 'ok' | 'warn' | 'error' | '' }): React.ReactElement {
  return (
    <span className={`xray-insight-stat ${tone}`}>
      <span className="xray-insight-stat-label">{label}</span>
      <strong>{value}</strong>
    </span>
  );
}
