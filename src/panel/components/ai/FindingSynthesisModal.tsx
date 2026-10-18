import React, { useRef, useState } from 'react';
import { IconAlertTriangle, IconCopy, IconSparkles } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { aiDestination } from '../../models/aiContext';
import type { AiDestination } from '../../models/aiContext';
import type { AiSettings } from '../../types';
import type { FindingRecord } from '../../models/findings';
import { prepareFindingSynthesisContext } from '../../models/findings';
import { requestAiExplanation } from '../../runtime/aiBridge';
import { copyText } from '../../utils';
import { ModalShell } from '../common/ModalShell';
import { Notice } from '../common/Notice';
import { PromptPreview } from '../common/PromptPreview';

const iconProps = { size: 16, stroke: 1.8 } as const;

/**
 * The outer component deliberately derives a key from only the consent scope.
 * This lets normal finding reconciliation updates flow through without changing
 * the frozen snapshot, while a new target, fingerprint, session, or destination
 * starts a fresh preview and requires Analyze again.
 */
export function FindingSynthesisModal(): React.ReactElement | null {
  const ids = usePanelStore((state) => state.findingSynthesisIds);
  const findings = usePanelStore((state) => state.findings);
  const sessionId = usePanelStore((state) => state.session.sessionId);
  const settings = usePanelStore((state) => state.aiSettings);
  if (!ids) return null;

  const records = ids
    .map((id) => findings.findings.find((record: FindingRecord) => record.id === id))
    .filter((record): record is FindingRecord => Boolean(record));
  if (!records.length || records.length !== ids.length) return null;

  const destination = aiDestination(settings);
  const scope = JSON.stringify([sessionId, findings.sessionId, ids, records.map((record) => [record.id, record.sessionId, record.fingerprint])]);
  return (
    <PreparedFindingSynthesis
      key={`${scope}:${JSON.stringify(destination)}`}
      ids={ids}
      records={records}
      settings={settings}
      destination={destination}
      sessionId={sessionId}
      findingSessionId={findings.sessionId}
    />
  );
}

function requestSummary(record: FindingRecord): string {
  const evidence = record.evidence.find((item) => item.role === 'current') || record.evidence[0];
  if (!evidence) return record.summary;
  return [`${evidence.method} ${evidence.path}`.trim(), evidence.status ? String(evidence.status) : ''].filter(Boolean).join(' · ');
}

interface PreparedFindingSynthesisProps {
  ids: string[];
  records: FindingRecord[];
  settings: AiSettings;
  destination: AiDestination;
  sessionId: string;
  findingSessionId: string;
}

function PreparedFindingSynthesis({ ids, records, settings, destination, sessionId, findingSessionId }: PreparedFindingSynthesisProps): React.ReactElement {
  const close = usePanelStore((state) => state.closeFindingSynthesis);
  const openSettings = usePanelStore((state) => state.openSettings);
  const [frozenRecords] = useState(() => records.map((record) => ({ ...record })));
  const [prepare] = useState(() => prepareFindingSynthesisContext(frozenRecords, destination));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const pending = useRef(false);
  const active = useRef(true);

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
    const response = await requestAiExplanation(settings, prepare.prompt, destination);
    const current = usePanelStore.getState();
    const currentRecords = current.findingSynthesisIds?.map((id) => current.findings.findings.find((record: FindingRecord) => record.id === id));
    const sameScope = JSON.stringify(current.findingSynthesisIds) === JSON.stringify(ids)
      && current.session.sessionId === sessionId
      && current.findings.sessionId === findingSessionId
      && currentRecords?.length === frozenRecords.length
      && currentRecords.every((record, index) => record?.sessionId === frozenRecords[index].sessionId && record.fingerprint === frozenRecords[index].fingerprint);
    const sameDestination = JSON.stringify(aiDestination(current.aiSettings)) === JSON.stringify(destination);
    // Closing or changing the finding scope/destination ignores a late provider response.
    if (active.current && sameScope && sameDestination) {
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
      title="Synthesize findings with AI"
      subtitle="Review the exact outbound prompt before sending"
      icon={<IconSparkles {...iconProps} />}
      className="xray-explain-modal xray-synthesis-modal"
      onClose={close}
      initialFocusRef={closeRef}
      footer={(
        <>
          <span className="xray-spacer" />
          <button ref={closeRef} className="xray-btn" onClick={close}>Close</button>
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
        <p className="xray-modal-hint">Uses frozen, compact finding facts only. Raw bodies, headers, and schema payloads are not included. Nothing is sent until you select Analyze.</p>
        <div className="xray-finding-list">
          <span className="xray-modal-eyebrow">Selected findings ({frozenRecords.length})</span>
          <ul>
            {frozenRecords.map((record) => (
              <li key={`${record.id}:${record.fingerprint}`}>
                <span className="xray-finding-list-title">{record.title}</span>
                <span className="xray-modal-hint">{requestSummary(record)}</span>
              </li>
            ))}
          </ul>
        </div>
        {prepare.notices.map((notice) => <Notice tone="warning" key={notice}>{notice}</Notice>)}
        <PromptPreview prompt={prepare.prompt} />
        {loading && <div className="xray-explain-loading" role="status" aria-live="polite"><span className="xray-spinner" />Analyzing findings…</div>}
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
        {result && (
          <div className="xray-explain-result">
            <p className="xray-modal-hint">AI interpretation — not a diagnosis</p>
            <div>{result}</div>
          </div>
        )}
        {copyError && <p className="xray-explain-error" role="alert">{copyError}</p>}
      </div>
    </ModalShell>
  );
}
