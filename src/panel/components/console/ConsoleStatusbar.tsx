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
      {/* Spec S2: labels in the UI font, numbers in the mono data font. */}
      <span className="xray-status-item" style={{ color: 'var(--xray-green)' }}><span className="xray-status-num">{stats.total - stats.errors}</span> ok</span>
      <span className="xray-status-item" style={{ color: 'var(--xray-red)' }}><span className="xray-status-num">{stats.errors}</span> errors</span>
      <span className="xray-status-item xray-status-slow" style={{ color: 'var(--xray-yellow)' }}><span className="xray-status-num">{stats.slow}</span> slow (≥<span className="xray-status-num">{slowThresholdMs}ms</span>)</span>
      <span className="xray-spacer" />
      <span className="xray-status-total"><span className="xray-status-num">{stats.total}</span> requests<span className="xray-status-avg"> - avg <span className="xray-status-num">{Math.round(stats.avg)}ms</span></span></span>
    </footer>
  );
}
