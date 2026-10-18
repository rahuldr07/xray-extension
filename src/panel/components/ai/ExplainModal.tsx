import React, { useRef, useState } from 'react';
import { IconAlertTriangle, IconCopy, IconSparkles } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { ModalShell } from '../common/ModalShell';
import { Notice } from '../common/Notice';
import { PromptPreview } from '../common/PromptPreview';
import { ToggleField } from '../common/ToggleField';
import { aiDestination, freezeAiContext } from '../../models/aiContext';
import type { AiContextOptions, AiDestination } from '../../models/aiContext';
import type { AiSettings, XrayEntry } from '../../types';
import { relatedEntries, requestAiExplanation } from '../../runtime/aiBridge';
import { copyText } from '../../utils';

const iconProps = { size: 16, stroke: 1.8 } as const;

export function ExplainModal(): React.ReactElement | null {
  const entry = usePanelStore((state) => state.explainEntry);
  const entries = usePanelStore((state) => state.entries);
  const aiSettings = usePanelStore((state) => state.aiSettings);
  if (!entry) return null;
  const destination = aiDestination(aiSettings);
  // A target/destination change starts fresh consent and invalidates old results.
  // Capture patches for the same target keep the already-prepared snapshot.
  return <PreparedExplanation key={`${entry.id}:${JSON.stringify(destination)}`} entry={entry} related={relatedEntries(entry, entries)} settings={aiSettings} destination={destination} />;
}

function PreparedExplanation({ entry, related, settings, destination }: { entry: XrayEntry; related: XrayEntry[]; settings: AiSettings; destination: AiDestination }): React.ReactElement {
  const close = usePanelStore((state) => state.closeExplain);
  const openSettings = usePanelStore((state) => state.openSettings);
  const [prepare] = useState(() => freezeAiContext(entry, related, destination));
  const [options, setOptions] = useState<AiContextOptions>({ headers: false, requestBody: false, responseBody: false });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const pending = useRef(false);
  const active = useRef(true);
  const preview = prepare(options);

  React.useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  async function analyze(): Promise<void> {
    if (pending.current) return;
    pending.current = true;
    setLoading(true);
    setAttempted(true);
    setResult(null);
    setError(null);
    setCopyError(null);
    const response = await requestAiExplanation(settings, preview.prompt, destination);
    // Closing ignores late results; it does not cancel a submitted provider call.
    const current = usePanelStore.getState();
    if (active.current && current.explainEntry?.id === entry.id && JSON.stringify(aiDestination(current.aiSettings)) === JSON.stringify(destination)) {
      pending.current = false;
      setLoading(false);
      if (response.ok && response.text) setResult(response.text);
      else setError(response.error || 'AI request failed.');
    }
  }

  function openAiSettings(): void {
    close();
    openSettings('ai');
  }

  async function copyResult(): Promise<void> {
    if (!result) return;
    try {
      await copyText(result);
      if (active.current) setCopyError(null);
    } catch {
      if (active.current) setCopyError('Could not copy. Select the result and copy it manually, or check clipboard permissions.');
    }
  }

  return (
    <ModalShell
      title="Explain with AI"
      subtitle="Review the exact outbound prompt before sending"
      icon={<IconSparkles {...iconProps} />}
      className="xray-explain-modal"
      onClose={close}
      footer={(
        <>
          <span className="xray-spacer" />
          <button className="xray-btn" onClick={close}>Close</button>
          {result && <button className="xray-btn" onClick={() => void copyResult()}><IconCopy {...iconProps} />Copy</button>}
          <button className="xray-btn primary" disabled={loading} onClick={() => void analyze()}>{loading ? 'Analyzing…' : attempted ? 'Analyze again' : 'Analyze'}</button>
        </>
      )}
    >
      <div className="xray-explain-body xray-modal-body">
        <div className="xray-ai-banner">
          <strong>{destination.provider} · {destination.model}</strong>
          <span>{destination.baseUrl}</span>
        </div>
        <p className="xray-modal-hint">Includes method, redacted URL, status, duration, GraphQL operation and up to four related-request timing records. Nothing is sent until you select Analyze.</p>
        <div className="xray-toggle-group">
          <ToggleField label="Include headers" checked={options.headers} disabled={loading} onChange={(headers) => setOptions({ ...options, headers })} />
          <ToggleField label="Include request body" checked={options.requestBody} disabled={loading} onChange={(requestBody) => setOptions({ ...options, requestBody })} />
          <ToggleField label="Include response body" checked={options.responseBody} disabled={loading} onChange={(responseBody) => setOptions({ ...options, responseBody })} />
        </div>
        <p className="xray-modal-hint">Request-body inclusion also includes GraphQL variables. Response inclusion uses the currently inspected representation, including decrypted content when available.</p>
        {preview.notices.map((notice) => <Notice tone="warning" key={notice}>{notice}</Notice>)}
        <PromptPreview prompt={preview.prompt} />
        {loading && <div className="xray-explain-loading" role="status" aria-live="polite"><span className="xray-spinner" />Analyzing request…</div>}
        {loading && <p className="xray-modal-hint">Closing this preview does not cancel the provider request.</p>}
        {error && (
          <div className="xray-explain-error" role="alert">
            <IconAlertTriangle {...iconProps} />
            <div>
              <p>{error}</p>
              <button className="xray-btn" onClick={openAiSettings}>Open AI settings</button>
            </div>
          </div>
        )}
        {result && <div className="xray-explain-result">{result}</div>}
        {copyError && <p className="xray-explain-error" role="alert">{copyError}</p>}
      </div>
    </ModalShell>
  );
}
