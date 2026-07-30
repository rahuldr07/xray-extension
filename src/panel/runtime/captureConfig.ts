import type { PanelSettings, TrafficRule } from '../types';
import { serializeRulesForRuntime } from '../models/rules';

// The MAIN-world interceptor freezes the bridge token on window and the ISOLATED
// content script mirrors it to window.__XRAY_bridgeToken; the injected panel and
// HUD bundles run in that isolated world and can post to the page directly. The
// DevTools panel and pop-out window are separate extension pages with no
// interceptor in their window — config/replay must relay via the background
// service worker to the inspected tab's content script instead.
function bridgeToken(): string | undefined {
  return (window as unknown as { __XRAY_BRIDGE_TOKEN__?: string }).__XRAY_BRIDGE_TOKEN__ || window.__XRAY_bridgeToken || undefined;
}

function inspectedTabId(): number | null {
  try {
    const tabId = (chrome as unknown as { devtools?: { inspectedWindow?: { tabId?: number } } })
      .devtools?.inspectedWindow?.tabId;
    return typeof tabId === 'number' && Number.isInteger(tabId) && tabId >= 0 ? tabId : null;
  } catch {
    return null;
  }
}

// Deliver a config or replay payload to the page's MAIN-world interceptor.
// Returns false when no route exists (e.g. the pop-out window, which has no
// tab binding) so callers can surface an honest failure instead of a fake
// success.
export function postToPageBridge(kind: 'config' | 'replay', payload: Record<string, unknown>): boolean {
  const token = bridgeToken();
  const flag = kind === 'config' ? '__xray_config__' : '__xray_replay__';
  if (token) {
    try {
      window.postMessage({ [flag]: true, source: 'xray-react-ui', token, ...payload }, '*');
      return true;
    } catch {
      return false;
    }
  }
  const tabId = inspectedTabId();
  const runtime = typeof chrome !== 'undefined' ? chrome.runtime : undefined;
  if (tabId != null && runtime?.sendMessage) {
    try {
      runtime.sendMessage({ type: 'xray:page-bridge', tabId, kind, ...payload }, () => {
        void runtime.lastError;
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function publishCaptureSettings(settings: Pick<PanelSettings, 'captureFetch' | 'captureXhr' | 'captureWs'>): void {
  postToPageBridge('config', {
    config: {
      captureFetch: settings.captureFetch,
      captureXhr: settings.captureXhr,
      captureWs: settings.captureWs,
    },
  });
}

export function publishTrafficRules(rules: TrafficRule[]): void {
  postToPageBridge('config', { config: { rules: serializeRulesForRuntime(rules) } });
}
