// panel/insights.js — Analytics and insights panel
// Provides intelligent analysis of captured data using the worker
window.XRAY_Insights = (() => {
  'use strict';

  let _container = null;
  let _visible = false;
  let _lastAnalysis = null;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  function _formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  function _formatNumber(n) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  }

  function _getStatusColor(status) {
    if (status >= 200 && status < 300) return 'var(--xr-green)';
    if (status >= 300 && status < 400) return 'var(--xr-yellow)';
    if (status >= 400 && status < 500) return 'var(--xr-orange)';
    if (status >= 500) return 'var(--xr-red)';
    return 'var(--xr-text-muted)';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BUILD UI
  // ═══════════════════════════════════════════════════════════════════════════

  function _buildInsightsHTML(analysis) {
    if (!analysis) {
      return `<div class="xr-insights-empty">No data to analyze</div>`;
    }

    const { totalRequests, totalLogs, avgDuration, slowestEntry, statusCounts, logLevels, topEndpoints } = analysis;

    return `
      <div class="xr-insights-grid">
        <!-- Summary Cards -->
        <div class="xr-insight-card xr-card-requests">
          <div class="xr-card-value">${_formatNumber(totalRequests)}</div>
          <div class="xr-card-label">API Requests</div>
        </div>
        
        <div class="xr-insight-card xr-card-logs">
          <div class="xr-card-value">${_formatNumber(totalLogs)}</div>
          <div class="xr-card-label">Console Logs</div>
        </div>
        
        <div class="xr-insight-card xr-card-duration">
          <div class="xr-card-value">${_formatDuration(avgDuration)}</div>
          <div class="xr-card-label">Avg Response</div>
        </div>
        
        ${slowestEntry ? `
        <div class="xr-insight-card xr-card-slow" data-entry-id="${slowestEntry.id}">
          <div class="xr-card-value">${_formatDuration(slowestEntry.duration)}</div>
          <div class="xr-card-label">Slowest Request</div>
          <div class="xr-card-detail" title="${slowestEntry.url}">${_truncateUrl(slowestEntry.url)}</div>
        </div>
        ` : ''}
        
        <!-- Status Distribution -->
        <div class="xr-insight-section xr-status-section">
          <div class="xr-section-title">Response Status</div>
          <div class="xr-status-bars">
            ${_buildStatusBar('2xx Success', statusCounts.success, totalRequests, 'var(--xr-green)')}
            ${_buildStatusBar('4xx Client', statusCounts.clientError, totalRequests, 'var(--xr-orange)')}
            ${_buildStatusBar('5xx Server', statusCounts.serverError, totalRequests, 'var(--xr-red)')}
          </div>
        </div>
        
        <!-- Log Levels -->
        <div class="xr-insight-section xr-logs-section">
          <div class="xr-section-title">Log Levels</div>
          <div class="xr-log-badges">
            <span class="xr-badge xr-badge-log">${logLevels.log} log</span>
            <span class="xr-badge xr-badge-warn">${logLevels.warn} warn</span>
            <span class="xr-badge xr-badge-error">${logLevels.error} error</span>
          </div>
        </div>
        
        <!-- Top Endpoints -->
        ${topEndpoints.length > 0 ? `
        <div class="xr-insight-section xr-endpoints-section">
          <div class="xr-section-title">Top Endpoints</div>
          <div class="xr-endpoints-list">
            ${topEndpoints.map(({ endpoint, count }) => `
              <div class="xr-endpoint-row">
                <span class="xr-endpoint-name" title="${endpoint}">${_truncateEndpoint(endpoint)}</span>
                <span class="xr-endpoint-count">${count}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>
    `;
  }

  function _buildStatusBar(label, count, total, color) {
    const percent = total > 0 ? (count / total * 100) : 0;
    return `
      <div class="xr-status-row">
        <span class="xr-status-label">${label}</span>
        <div class="xr-status-bar-bg">
          <div class="xr-status-bar-fill" style="width: ${percent}%; background: ${color}"></div>
        </div>
        <span class="xr-status-count">${count}</span>
      </div>
    `;
  }

  function _truncateUrl(url) {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      const path = parsed.pathname;
      return path.length > 30 ? '...' + path.slice(-27) : path;
    } catch {
      return url.slice(0, 30) + (url.length > 30 ? '...' : '');
    }
  }

  function _truncateEndpoint(endpoint) {
    return endpoint.length > 40 ? endpoint.slice(0, 37) + '...' : endpoint;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CSS
  // ═══════════════════════════════════════════════════════════════════════════

  const CSS = `
    .xr-insights-panel {
      padding: 16px;
      overflow-y: auto;
      height: 100%;
    }
    
    .xr-insights-empty {
      color: var(--xr-text-muted);
      text-align: center;
      padding: 40px 20px;
    }
    
    .xr-insights-grid {
      display: grid;
      gap: 12px;
    }
    
    .xr-insight-card {
      background: var(--xr-bg-elevated);
      border: 1px solid var(--xr-border);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: border-color 0.15s, transform 0.1s;
    }
    
    .xr-insight-card:hover {
      border-color: var(--xr-accent);
      transform: translateY(-1px);
    }
    
    .xr-card-value {
      font-size: 24px;
      font-weight: 600;
      color: var(--xr-text);
      margin-bottom: 4px;
    }
    
    .xr-card-label {
      font-size: 11px;
      color: var(--xr-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .xr-card-detail {
      font-size: 10px;
      color: var(--xr-text-muted);
      margin-top: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .xr-card-requests .xr-card-value { color: var(--xr-blue); }
    .xr-card-logs .xr-card-value { color: var(--xr-purple); }
    .xr-card-duration .xr-card-value { color: var(--xr-green); }
    .xr-card-slow .xr-card-value { color: var(--xr-orange); }
    
    .xr-insight-section {
      background: var(--xr-bg-elevated);
      border: 1px solid var(--xr-border);
      border-radius: 8px;
      padding: 16px;
    }
    
    .xr-section-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--xr-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    
    .xr-status-bars {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .xr-status-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .xr-status-label {
      font-size: 11px;
      color: var(--xr-text-muted);
      width: 80px;
      flex-shrink: 0;
    }
    
    .xr-status-bar-bg {
      flex: 1;
      height: 6px;
      background: var(--xr-bg);
      border-radius: 3px;
      overflow: hidden;
    }
    
    .xr-status-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    
    .xr-status-count {
      font-size: 11px;
      color: var(--xr-text);
      width: 40px;
      text-align: right;
    }
    
    .xr-log-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .xr-badge {
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 500;
    }
    
    .xr-badge-log { background: var(--xr-bg); color: var(--xr-text); }
    .xr-badge-warn { background: rgba(234, 179, 8, 0.15); color: var(--xr-yellow); }
    .xr-badge-error { background: rgba(239, 68, 68, 0.15); color: var(--xr-red); }
    
    .xr-endpoints-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .xr-endpoint-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 8px;
      background: var(--xr-bg);
      border-radius: 4px;
      font-size: 11px;
    }
    
    .xr-endpoint-name {
      color: var(--xr-text);
      font-family: var(--xr-mono);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .xr-endpoint-count {
      color: var(--xr-text-muted);
      font-weight: 500;
      margin-left: 8px;
      flex-shrink: 0;
    }
  `;

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════

  async function init(root) {
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = CSS;
    root.appendChild(style);
    
    // Create container
    _container = document.createElement('div');
    _container.className = 'xr-insights-panel';
    _container.style.display = 'none';
    
    return _container;
  }

  async function show(entries) {
    if (!_container) return;
    
    _visible = true;
    _container.style.display = 'block';
    
    // Analyze using worker if available
    try {
      if (window.XRAY_Worker?.isReady()) {
        _lastAnalysis = await window.XRAY_Worker.analyze(entries);
      } else {
        // Fallback: simple analysis on main thread
        _lastAnalysis = _analyzeLocally(entries);
      }
    } catch {
      _lastAnalysis = _analyzeLocally(entries);
    }
    
    _container.innerHTML = _buildInsightsHTML(_lastAnalysis);
    
    // Bind click handlers for cards
    _container.querySelectorAll('[data-entry-id]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.entryId;
        if (id && window.XRAY_Panel) {
          // Navigate to entry in list
          window.XRAY_Panel._selectEntry?.(id);
        }
      });
    });
  }

  function hide() {
    if (!_container) return;
    _visible = false;
    _container.style.display = 'none';
  }

  function isVisible() {
    return _visible;
  }

  function getContainer() {
    return _container;
  }

  // Fallback local analysis (when worker unavailable)
  function _analyzeLocally(entries) {
    const apiEntries = entries.filter(e => e.type === 'api');
    const logEntries = entries.filter(e => e.type === 'log');
    
    let totalDuration = 0;
    let slowestEntry = null;
    const statusCounts = { success: 0, clientError: 0, serverError: 0 };
    const endpointCounts = {};
    
    for (const entry of apiEntries) {
      if (entry.duration) {
        totalDuration += entry.duration;
        if (!slowestEntry || entry.duration > slowestEntry.duration) {
          slowestEntry = entry;
        }
      }
      
      const status = entry.status || 0;
      if (status >= 200 && status < 400) statusCounts.success++;
      else if (status >= 400 && status < 500) statusCounts.clientError++;
      else if (status >= 500) statusCounts.serverError++;
      
      const endpoint = `${entry.method} ${entry.urlPath || entry.url}`;
      endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
    }
    
    const logLevels = { log: 0, warn: 0, error: 0 };
    for (const entry of logEntries) {
      if (entry.logLevel in logLevels) logLevels[entry.logLevel]++;
    }
    
    const topEndpoints = Object.entries(endpointCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }));
    
    return {
      totalRequests: apiEntries.length,
      totalLogs: logEntries.length,
      avgDuration: apiEntries.length ? Math.round(totalDuration / apiEntries.length) : 0,
      slowestEntry: slowestEntry ? { id: slowestEntry.id, url: slowestEntry.url, duration: slowestEntry.duration } : null,
      statusCounts,
      logLevels,
      topEndpoints,
    };
  }

  return {
    init,
    show,
    hide,
    isVisible,
    getContainer,
    update: show,  // Alias for show() - updates the insights with new entries
  };
})();
