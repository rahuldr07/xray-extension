import type { AiSettings, XrayEntry } from '../types';
import { entryPath } from '../models/entries';
import { entryRequest, entryResponse, safeStringify } from '../utils';

export interface AiResult {
  ok: boolean;
  text?: string;
  error?: string;
}

// Build a compact, privacy-conscious prompt describing the request. Sensitive
// headers are already redacted upstream by the interceptor.
export function buildExplainPrompt(entry: XrayEntry, related: XrayEntry[]): string {
  const context = {
    method: entry.method,
    url: entry.url || entry.urlPath,
    status: entry.status,
    durationMs: Math.round(Number(entry.duration) || 0),
    graphql: entry.graphql || undefined,
    requestHeaders: entry.requestHeaders,
    requestBody: entryRequest(entry),
    response: entryResponse(entry),
    recentSameEndpoint: related.slice(0, 4).map((item) => ({
      status: item.status,
      durationMs: Math.round(Number(item.duration) || 0),
      timestamp: item.timestamp,
    })),
  };
  return [
    'You are an API debugging assistant embedded in a browser devtools extension.',
    'Analyze this captured HTTP request and its response. Be concise and specific.',
    'Explain: (1) what this call does, (2) whether it succeeded or failed and why,',
    '(3) anything notable in the payload or timing, and (4) one concrete next step for the developer.',
    '',
    'Captured request:',
    safeStringify(context, 2, 40_000),
  ].join('\n');
}

export async function requestAiExplanation(settings: AiSettings, prompt: string): Promise<AiResult> {
  if (!settings.apiKey) {
    return { ok: false, error: 'Add an API key in Settings → AI to enable explanations.' };
  }
  if (typeof chrome === 'undefined' || !chrome?.runtime?.sendMessage) {
    return { ok: false, error: 'AI explanations require the extension runtime (open XRAY on an inspected page).' };
  }
  const runtime = chrome?.runtime;
  const sendMessage = runtime?.sendMessage;
  if (!runtime || !sendMessage) {
    return { ok: false, error: 'AI explanations require the extension runtime (open XRAY on an inspected page).' };
  }
  return new Promise<AiResult>((resolve) => {
    try {
      sendMessage({ type: 'xray:ai-explain', settings, prompt }, (response) => {
        const err = runtime.lastError;
        if (err) {
          resolve({ ok: false, error: err.message || 'AI request failed' });
          return;
        }
        resolve((response as AiResult) || { ok: false, error: 'No response from AI provider.' });
      });
    } catch (error) {
      resolve({ ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  });
}

export function relatedEntries(entry: XrayEntry, entries: XrayEntry[]): XrayEntry[] {
  const path = entryPath(entry);
  return entries.filter((candidate) => candidate.id !== entry.id && candidate.type === 'api' && entryPath(candidate) === path);
}
