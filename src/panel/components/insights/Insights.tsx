import React from 'react';
import { IconAlertTriangle, IconBolt, IconClock, IconDatabase, IconRoute, IconServer } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { buildInsightsSummary } from '../../models/insights';
import { formatBytes } from '../../utils';
import { CollapsibleSection } from '../common/CollapsibleSection';
import { iconProps } from '../shell/panelTabs';

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
          <p>Deterministic local signals from captured requests. No external AI service is used.</p>
        </div>
      </header>
      <CollapsibleSection id="insights-overview" title="Overview" className="xray-insight-overview">
        <div className="xray-insight-grid">
          <InsightMetric icon={<IconDatabase {...iconProps} />} label="Requests" value={String(summary.requests)} />
          <InsightMetric icon={<IconAlertTriangle {...iconProps} />} label="Errors" value={String(summary.errors)} tone={summary.errors ? 'error' : 'ok'} />
          <InsightMetric icon={<IconBolt {...iconProps} />} label="Slow" value={String(summary.slow)} tone={summary.slow ? 'warn' : 'ok'} />
          <InsightMetric icon={<IconClock {...iconProps} />} label="Average" value={`${Math.round(summary.avgDuration)}ms`} />
          <InsightMetric icon={<IconServer {...iconProps} />} label="Payload" value={formatBytes(summary.totalBytes)} />
        </div>
      </CollapsibleSection>
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

function InsightMetric({ icon, label, value, tone = '' }: { icon: React.ReactNode; label: string; value: string; tone?: 'ok' | 'warn' | 'error' | '' }): React.ReactElement {
  return (
    <div className={`xray-api-metric ${tone}`}>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
