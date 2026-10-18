import React from 'react';
import { usePanelStore } from '../../store';
import { planBodyNode } from '../../models/experiments';
import { fromValue, printJson } from '../../models/jsonText';
import type { ExperimentCheck, ExperimentRecord } from '../../types';

/** The sanitized plan as shown: its headers and body, an integer past 2^53 as its digits (spec J10). */
function planText(record: ExperimentRecord): string {
  return printJson({ t: 'obj', entries: [
    { key: 'headers', value: fromValue(record.plan.headers) },
    { key: 'body', value: planBodyNode(record.plan.body ?? null) },
  ] }, { indent: 2 });
}

export function ExperimentPanel(): React.ReactElement {
  const experiments = usePanelStore(state => state.experiments);
  return <section className="xray-experiments" aria-label="Experiments">
    <p className="xray-section-hint">{experiments.length}/50 · Draft and Arm are inert; only Run submits work.</p>
    {!experiments.length && <p className="xray-muted">No experiments yet. Use “Prepare experiment” on a captured request or a disabled mock rule.</p>}
    <div className="xray-experiment-list">{experiments.map(record => <ExperimentCard key={record.id} record={record} />)}</div>
  </section>;
}

function ExperimentCard({ record }: { record: ExperimentRecord }): React.ReactElement {
  const entries = usePanelStore(state => state.entries);
  const experiments = usePanelStore(state => state.experiments);
  const baseline = entries.find(entry => entry.id === record.baselineEntryId);
  const observed = entries.find(entry => entry.id === record.observedEntryId);
  const [method, setMethod] = React.useState(record.plan.method);
  const [url, setUrl] = React.useState(record.plan.url);
  const [acknowledged, setAcknowledged] = React.useState(record.plan.retargetAcknowledged === true);
  const [expectedStatus, setExpectedStatus] = React.useState(String(record.checks.find(check => check.type === 'status')?.expected ?? 200));
  const [response, setResponse] = React.useState(record.checks.some(check => check.type === 'response' && check.expected));
  const [structure, setStructure] = React.useState(record.checks.find(check => check.type === 'structural')?.mode || 'none');
  const [timeout, setTimeoutValue] = React.useState(String(record.plan.timeoutMs ?? 30_000));
  const editable = record.status === 'draft';
  const terminal = ['observed', 'failed', 'cancelled'].includes(record.status);
  const activeBaseline = experiments.some(item => item.id !== record.id && item.baselineEntryId === record.baselineEntryId && item.status === 'running');

  function save(): boolean {
    const status = Number(expectedStatus);
    if (!Number.isInteger(status) || status < 100 || status > 599 || !Number.isFinite(Number(timeout)) || Number(timeout) < 1) {
      usePanelStore.getState().showToast('Use an expected status from 100–599 and a positive timeout.'); return false;
    }
    const checks: ExperimentCheck[] = [{ type: 'status', expected: status }];
    if (response) checks.push({ type: 'response', expected: true });
    if (structure === 'equal' || structure === 'contains' || structure === 'schema') checks.push({ type: 'structural', mode: structure });
    return usePanelStore.getState().updateExperiment(record.id, { method, url, retargetAcknowledged: acknowledged, timeoutMs: Number(timeout) }, checks);
  }

  return <article className="xray-card xray-experiment-card" aria-label={`Experiment ${record.id}`}>
    <header className="xray-experiment-head"><h4>{record.plan.mockRuleId ? 'Mock experiment' : 'Replay experiment'}</h4>
      <span className={`xray-experiment-status ${record.status}`} role="status">{record.status}</span></header>
    <p className="xray-muted">Baseline: {record.baselineEntryId}{!baseline && ' — no longer retained'}{record.plan.mockRuleId && ` · Mock rule: ${record.plan.mockRuleId}`}</p>
    <div className="xray-experiment-grid">
      <label className="xray-field"><span>Planned method</span><input className="xray-input" value={editable ? method : record.plan.method} readOnly={!editable} maxLength={12} onChange={event => setMethod(event.currentTarget.value)} /></label>
      <label className="xray-field xray-experiment-url"><span>Planned URL (sanitized)</span><input className="xray-input" value={editable ? url : record.plan.url} readOnly={!editable} onChange={event => setUrl(event.currentTarget.value)} /></label>
      <label className="xray-field"><span>Expected status</span><input className="xray-input" type="number" min={100} max={599} value={expectedStatus} readOnly={!editable} onChange={event => setExpectedStatus(event.currentTarget.value)} /></label>
      <label className="xray-field"><span>Structural check vs baseline</span><select className="xray-select" disabled={!editable} value={structure} onChange={event => setStructure(event.currentTarget.value)}>
        <option value="none">None</option><option value="equal">Equal</option><option value="contains">Contains baseline</option><option value="schema">Same schema</option>
      </select></label>
      <label className="xray-field"><span>Timeout (ms, max 120000)</span><input className="xray-input" type="number" min={1} max={120000} value={timeout} readOnly={!editable} onChange={event => setTimeoutValue(event.currentTarget.value)} /></label>
    </div>
    <div className="xray-experiment-options">
      <label><input type="checkbox" checked={response} disabled={!editable} onChange={event => setResponse(event.currentTarget.checked)} /> Expect a captured response</label>
      <label><input type="checkbox" checked={acknowledged} disabled={!editable} onChange={event => setAcknowledged(event.currentTarget.checked)} /> Acknowledge cross-origin retargeting (original secrets will not be restored)</label>
    </div>
    <details><summary>Sanitized headers and body</summary><pre className="xray-json">{planText(record)}</pre>
      <p className="xray-muted">While this body is the captured one, a run on the captured origin sends the captured request body as it was sent — fields shown as [REDACTED] go out with their real values. An edited or retargeted body is sent as shown here, re-printed: integers exact, 1.0 and 1E5 normalised.</p>
    </details>
    {record.status === 'running' && <p role="status">Waiting for matching captured evidence. Submission does not confirm page application.{record.plan.mockRuleId && ' Trigger the matching request on the page.'}</p>}
    {record.errorReason && <p role="status">{record.errorCode}: {record.errorReason}</p>}
    {record.status === 'observed' && <div className="xray-experiment-results">
      <p>Observed: {record.observedEntryId}{!observed && ' — entry no longer retained'}. Captured representations only; this does not establish causality.</p>
      <ul>{record.checkResults?.map((check, index) => <li key={index}>{check.type}: {check.passed ? 'Passed' : 'Failed'}{check.reason ? ` — ${check.reason}` : ''}</li>)}</ul>
    </div>}
    <footer className="xray-experiment-actions">
      {baseline && <button className="xray-chip" onClick={() => { const state = usePanelStore.getState(); state.selectEntry(baseline.id); state.setActiveTab('api'); }}>View baseline</button>}
      {observed && <button className="xray-chip" onClick={() => { const state = usePanelStore.getState(); state.selectEntry(observed.id); state.setActiveTab('api'); }}>View observed</button>}
      <span className="xray-spacer" />
      {editable && <><button className="xray-btn" disabled={!baseline} onClick={save}>Save plan</button><button className="xray-btn" disabled={!baseline} onClick={() => { if (save()) usePanelStore.getState().armExperiment(record.id); }}>Arm</button></>}
      {record.status === 'armed' && <button className="xray-btn primary" disabled={activeBaseline || !baseline} onClick={() => usePanelStore.getState().runExperiment(record.id)}>Run</button>}
      {!terminal && <button className="xray-btn" onClick={() => usePanelStore.getState().cancelExperiment(record.id)}>Cancel</button>}
      <button className="xray-btn" onClick={() => usePanelStore.getState().deleteExperiment(record.id)}>Delete</button>
    </footer>
  </article>;
}
