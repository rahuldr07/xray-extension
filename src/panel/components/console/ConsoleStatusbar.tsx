import React, { useMemo } from 'react';
import { usePanelStore } from '../../store';
import { duration, isApi } from '../../models/entries';

export function ConsoleStatusbar(): React.ReactElement {
  const entries = usePanelStore((state) => state.entries);
  const slowThresholdMs = usePanelStore((state) => state.settings.slowThresholdMs);
  const stats = useMemo(() => {
    const apis = entries.filter(isApi);
    const errors = apis.filter((entry) => Number(entry.status) >= 400);
    const slow = apis.filter((entry) => duration(entry) >= slowThresholdMs);
    const avg = apis.length ? apis.reduce((sum, entry) => sum + duration(entry), 0) / apis.length : 0;
    return { total: apis.length, errors: errors.length, slow: slow.length, avg };
  }, [entries, slowThresholdMs]);
  return (
    <footer className="xray-statusbar">
      <span className="xray-status-item" style={{ color: 'var(--xray-green)' }}>{stats.total - stats.errors} ok</span>
      <span className="xray-status-item" style={{ color: 'var(--xray-red)' }}>{stats.errors} errors</span>
      <span className="xray-status-item xray-status-slow" style={{ color: 'var(--xray-yellow)' }}>{stats.slow} slow (≥{slowThresholdMs}ms)</span>
      <span className="xray-spacer" />
      <span className="xray-status-total">{stats.total} requests<span className="xray-status-avg"> - avg {Math.round(stats.avg)}ms</span></span>
    </footer>
  );
}
