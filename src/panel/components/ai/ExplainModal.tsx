import React, { useState } from 'react';
import { IconAlertTriangle, IconCopy, IconSparkles } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { ModalShell } from '../common/ModalShell';
import { entryPath } from '../../models/entries';
import { buildExplainPrompt, relatedEntries, requestAiExplanation } from '../../runtime/aiBridge';
import { copyText } from '../../utils';

const iconProps = { size: 16, stroke: 1.8 } as const;

export function ExplainModal(): React.ReactElement | null {
  const entry = usePanelStore((state) => state.explainEntry);
  const close = usePanelStore((state) => state.closeExplain);
  const entries = usePanelStore((state) => state.entries);
  const aiSettings = usePanelStore((state) => state.aiSettings);
  const setSettingsOpen = usePanelStore((state) => state.setSettingsOpen);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!entry) return;
    let cancelled = false;
    setResult(null);
    setError(null);
    if (!aiSettings.apiKey) {
      setError('Add an API key in Settings → AI to enable explanations.');
      return;
    }
    setLoading(true);
    const prompt = buildExplainPrompt(entry, relatedEntries(entry, entries));
    requestAiExplanation(aiSettings, prompt).then((response) => {
      if (cancelled) return;
      setLoading(false);
      if (response.ok && response.text) setResult(response.text);
      else setError(response.error || 'AI request failed.');
    });
    return () => { cancelled = true; };
    // Only re-run when the target entry changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.id]);

  if (!entry) return null;

  function openAiSettings(): void {
    close();
    setSettingsOpen(true);
  }

  return (
    <ModalShell
      title="Explain with AI"
      subtitle={`${entry.method || 'GET'} ${entryPath(entry)}`}
      icon={<IconSparkles {...iconProps} />}
      className="xray-explain-modal"
      onClose={close}
      footer={(
        <>
          <span className="xray-muted">{aiSettings.provider} · {aiSettings.model}</span>
          <span className="xray-spacer" />
          {result && <button className="xray-btn" onClick={() => void copyText(result)}><IconCopy {...iconProps} />Copy</button>}
          <button className="xray-btn" onClick={close}>Close</button>
        </>
      )}
    >
      <div className="xray-explain-body">
        {loading && <div className="xray-explain-loading"><span className="xray-spinner" />Analyzing request…</div>}
        {error && (
          <div className="xray-explain-error">
            <IconAlertTriangle {...iconProps} />
            <div>
              <p>{error}</p>
              <button className="xray-btn" onClick={openAiSettings}>Open AI settings</button>
            </div>
          </div>
        )}
        {result && <div className="xray-explain-result">{result}</div>}
      </div>
    </ModalShell>
  );
}
