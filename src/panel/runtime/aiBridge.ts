import type { AiSettings, XrayEntry } from '../types';
import { entryPath } from '../models/entries';
import { aiDestination, prepareAiContext } from '../models/aiContext';
import type { AiDestination } from '../models/aiContext';

export interface AiResult {
  ok: boolean;
  text?: string;
  error?: string;
}

// Compatibility helper uses the same conservative, body-free local projection.
export function buildExplainPrompt(entry: XrayEntry, related: XrayEntry[]): string {
  return prepareAiContext(entry, related, { headers: false, requestBody: false, responseBody: false }, aiDestination({ provider: 'anthropic', model: '', baseUrl: '', authHeader: '', authPrefix: '' })).prompt;
}

export async function requestAiExplanation(settings: AiSettings, prompt: string, expectedDestination: AiDestination): Promise<AiResult> {
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
      // C-12: prompt and noncredential destination only. The key stays in storage; the
      // service worker reads it directly, instead of travelling through
      // isolated-world memory on every page just to be handed straight back.
      sendMessage({ type: 'xray:ai-explain', prompt, expectedDestination: aiDestination(expectedDestination) }, (response) => {
        const err = runtime.lastError;
        if (err) {
          resolve({ ok: false, error: 'AI runtime request failed. Try again explicitly.' });
          return;
        }
        resolve((response as AiResult) || { ok: false, error: 'No response from AI provider.' });
      });
    } catch {
      resolve({ ok: false, error: 'AI runtime request failed. Try again explicitly.' });
    }
  });
}

export function relatedEntries(entry: XrayEntry, entries: XrayEntry[]): XrayEntry[] {
  const path = entryPath(entry);
  return entries.filter((candidate) => candidate.id !== entry.id && candidate.type === 'api' && entryPath(candidate) === path);
}
