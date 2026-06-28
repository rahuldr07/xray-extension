import type { PanelSettings } from '../types';

export function publishCaptureSettings(settings: Pick<PanelSettings, 'captureFetch' | 'captureXhr'>): void {
  try {
    window.postMessage({
      __xray_config__: true,
      source: 'xray-react-ui',
      token: window.__XRAY_bridgeToken,
      config: {
        captureFetch: settings.captureFetch,
        captureXhr: settings.captureXhr,
      },
    }, '*');
  } catch {}
}
