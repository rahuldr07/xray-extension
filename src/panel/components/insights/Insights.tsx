import React from 'react';
import { IconAlertTriangle, IconBolt, IconClock, IconDatabase, IconRoute, IconServer } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { buildInsightsSummary } from '../../models/insights';
import { formatBytes } from '../../utils';
import { iconProps } from '../shell/panelTabs';

export function Insights(): React.ReactElement {
  const entries = usePanelStore((state) => state.entries);
  const setApiSearchQuery = usePanelStore((state) => state.setApiSearchQuery);
  const setActiveTab = usePanelStore((state) => state.setActiveTab);
  const summary = buildInsightsSummary(entries);

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
      <div className="xray-insight-grid">
        <InsightMetric icon={<IconDatabase {...iconProps} />} label="Requests" value={String(summary.requests)} />
        <InsightMetric icon={<IconAlertTriangle {...iconProps} />} label="Errors" value={String(summary.errors)} tone={summary.errors ? 'error' : 'ok'} />
        <InsightMetric icon={<IconBolt {...iconProps} />} label="Slow" value={String(summary.slow)} tone={summary.slow ? 'warn' : 'ok'} />
        <InsightMetric icon={<IconClock {...iconProps} />} label="Average" value={`${Math.round(summary.avgDuration)}ms`} />
        <InsightMetric icon={<IconServer {...iconProps} />} label="Payload" value={formatBytes(summary.totalBytes)} />
      </div>
      <div className="xray-insight-columns">
        <section className="xray-card">
          <h3>Repeated endpoints</h3>
          {summary.nPlusOneCandidates.length ? summary.nPlusOneCandidates.map((item) => (
            <button key={item.path} className="xray-insight-row" onClick={() => openEndpoint(item.path)}>
              <IconRoute {...iconProps} />
              <span>{item.path}</span>
              <strong>{item.count}x</strong>
            </button>
          )) : <p className="xray-muted">No repeated endpoint pattern above threshold.</p>}
        </section>
        <section className="xray-card">
          <h3>Slowest requests</h3>
          {summary.topSlowRequests.map((item) => (
            <button key={item.id} className="xray-insight-row" onClick={() => openEndpoint(item.path)}>
              <span className="xray-method">{item.method}</span>
              <span>{item.path}</span>
              <strong>{Math.round(item.duration)}ms</strong>
            </button>
          ))}
        </section>
        <section className="xray-card">
          <h3>Status mix</h3>
          {Object.entries(summary.statusCounts).map(([bucket, count]) => (
            <div key={bucket} className="xray-status-mix-row">
              <span>{bucket}</span>
              <span className="xray-bar-track"><span className="xray-bar" style={{ width: `${Math.max(8, count / Math.max(1, summary.requests) * 100)}%` }} /></span>
              <strong>{count}</strong>
            </div>
          ))}
        </section>
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
