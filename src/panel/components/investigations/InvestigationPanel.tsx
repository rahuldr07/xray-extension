import React, { useId, useRef, useState } from 'react';
import { usePanelStore } from '../../store';
import { cleanText, makeEntryRef, MAX_ASSERTIONS, MAX_INVESTIGATIONS, MAX_INVESTIGATION_NOTES, MAX_INVESTIGATION_TITLE, MAX_SCENARIOS, MAX_SCENARIO_STEPS, resolveEntryRef } from '../../models/investigations';
import type { AssertionResult, SavedInvestigation, ScenarioSpec, ScenarioStep } from '../../models/investigations';
import { Notice } from '../common/Notice';
import { ruleMatcherError } from '../../models/rules';
import type { ExperimentCheck, ExperimentPlan, XrayEntry } from '../../types';

const storageMessages = {
  ready: 'Extension storage available. Changes are kept in this panel and submitted to extension storage.',
  unavailable: 'Extension storage unavailable. Saving is disabled; existing investigations remain in this panel only and may be lost when it closes.',
  unsupported: 'Saved investigations use an unsupported version. Editing is disabled to preserve the stored data.',
  failed: 'Investigation storage failed. Changes in this panel are not confirmed persisted.',
};

export function InvestigationPanel(): React.ReactElement {
  const investigations = usePanelStore(state => state.investigationStore.investigations);
  const storage = usePanelStore(state => state.investigationStorageState);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const formId = useId();
  const readOnly = storage === 'unsupported' || storage === 'unavailable';
  const full = investigations.length >= MAX_INVESTIGATIONS;
  function closeForm(): void {
    setComposing(false);
    const trigger = triggerRef.current;
    // Saving the last allowed investigation disables the trigger on the next render;
    // focus the section's tab instead of letting focus fall to <body>.
    const willBeFull = usePanelStore.getState().investigationStore.investigations.length >= MAX_INVESTIGATIONS;
    if (trigger && !trigger.disabled && !willBeFull) trigger.focus();
    else (trigger?.getRootNode() as Document | ShadowRoot | undefined)?.getElementById?.('xray-rules-subtab-investigations')?.focus();
  }
  return <section className="xray-investigations xray-experiment-list" aria-label="Saved investigations">
    <div className="xray-investigations-bar">
      <p className="xray-section-hint">{investigations.length}/{MAX_INVESTIGATIONS} · Saves selection, pins, compare and filters. Reopening never runs requests.</p>
      <button ref={triggerRef} className="xray-btn primary" aria-expanded={composing} aria-controls={formId} disabled={readOnly || full} onClick={() => setComposing(value => !value)}>Save current context</button>
    </div>
    <Notice tone={storage === 'ready' ? 'info' : storage === 'unavailable' ? 'warning' : 'error'} live={storage !== 'ready'}>{storageMessages[storage]}</Notice>
    {composing && !readOnly && !full && <div id={formId} className="xray-card xray-experiment-card" role="group" aria-label="Save current context">
      <div className="xray-experiment-grid">
        <label className="xray-field"><span>Investigation title</span><input className="xray-input" autoFocus maxLength={MAX_INVESTIGATION_TITLE} value={title} onChange={event => setTitle(event.currentTarget.value)} /></label>
        <label className="xray-field xray-experiment-url"><span>Investigation notes</span><textarea className="xray-input" rows={3} maxLength={MAX_INVESTIGATION_NOTES} value={notes} onChange={event => setNotes(event.currentTarget.value)} /></label>
      </div>
      <div className="xray-experiment-actions"><button className="xray-btn primary" onClick={() => {
        const id = usePanelStore.getState().saveInvestigation(title.trim() || undefined, notes);
        if (id) { setTitle(''); setNotes(''); closeForm(); }
      }}>Save investigation</button><button className="xray-btn" onClick={closeForm}>Cancel</button></div>
    </div>}
    {!investigations.length && <p className="xray-muted">No saved investigations yet. Select or pin captured requests, then save the current context.</p>}
    <div className="xray-experiment-list">{investigations.map(investigation => <InvestigationCard key={investigation.id} investigation={investigation} readOnly={readOnly} />)}</div>
  </section>;
}

function RequestPicker({ label, value, onChange, disabled = false }: { label: string; value: string; onChange(value: string): void; disabled?: boolean }): React.ReactElement {
  const entries = usePanelStore(state => state.entries);
  const sessionId = usePanelStore(state => state.session.sessionId);
  return <label className="xray-field"><span>{label}</span><select className="xray-select" value={value} disabled={disabled} onChange={event => onChange(event.currentTarget.value)}>
    <option value="">Choose a retained API request</option>
    {entries.filter(entry => entry.type === 'api').map(entry => {
      const ref = makeEntryRef(entry, sessionId);
      return <option key={entry.id} value={entry.id}>{ref.method} {ref.path} · {ref.status || 'pending'} · {entry.id}</option>;
    })}
  </select></label>;
}

function InvestigationCard({ investigation, readOnly }: { investigation: SavedInvestigation; readOnly: boolean }): React.ReactElement {
  const entries = usePanelStore(state => state.entries);
  const sessionId = usePanelStore(state => state.session.sessionId);
  const [title, setTitle] = useState(investigation.title);
  const [notes, setNotes] = useState(investigation.notes);
  const [evaluation, setEvaluation] = useState<{ specs: SavedInvestigation['assertions']; entries: XrayEntry[]; sessionId: string; results: AssertionResult[] } | null>(null);
  const running = investigation.runs.some(run => run.status === 'running');
  const results = evaluation?.specs === investigation.assertions && evaluation.entries === entries && evaluation.sessionId === sessionId ? evaluation.results : [];
  return <article className="xray-card xray-experiment-card" aria-label={`Investigation ${investigation.title}`}>
    <h4>{investigation.title || 'Investigation'}</h4>
    {investigation.notes && <p>{investigation.notes}</p>}
    <p className="xray-muted">{investigation.entryRefs.length} saved references · {investigation.findingIds.length} linked findings · {investigation.sourceSessionId === sessionId ? 'Current session' : 'Different session — retained references require explicit rebinding for execution'}</p>
    <details><summary>Saved references and context</summary>
      <ul>{investigation.entryRefs.map(ref => <li key={`${ref.sessionId}:${ref.entryId}`}>{ref.method} {ref.origin}{ref.path} · {resolveEntryRef(ref, sessionId, entries) ? 'available' : 'unavailable'} · {ref.entryId}</li>)}</ul>
      <p>Selected: {investigation.selectedEntryId || 'none'} · Pinned: {investigation.pinnedEntryIds.length} · Compare: {investigation.compareLeftId || 'none'} / {investigation.compareRightId || 'none'}</p>
      <p>Filter: {investigation.filters.apiQuickFilter} · Search: {investigation.filters.apiSearchQuery || 'none'}</p>
    </details>
    <details><summary>Edit title and notes</summary>
      <div className="xray-experiment-grid">
        <label className="xray-field"><span>Saved title</span><input className="xray-input" maxLength={MAX_INVESTIGATION_TITLE} disabled={readOnly} value={title} onChange={event => setTitle(event.currentTarget.value)} /></label>
        <label className="xray-field xray-experiment-url"><span>Saved notes</span><textarea className="xray-input" rows={3} maxLength={MAX_INVESTIGATION_NOTES} disabled={readOnly} value={notes} onChange={event => setNotes(event.currentTarget.value)} /></label>
      </div>
      <div className="xray-experiment-actions"><button className="xray-btn" disabled={readOnly} onClick={() => {
        usePanelStore.getState().updateInvestigation(investigation.id, { title, notes });
        const saved = usePanelStore.getState().investigationStore.investigations.find(item => item.id === investigation.id);
        if (saved) { setTitle(saved.title); setNotes(saved.notes); }
      }}>Save changes</button><button className="xray-btn" onClick={() => { setTitle(investigation.title); setNotes(investigation.notes); }}>Discard edits</button></div>
    </details>
    <h5>Assertions <span className="xray-muted">{investigation.assertions.length}/{MAX_ASSERTIONS}</span></h5>
    <AssertionComposer investigationId={investigation.id} disabled={readOnly || investigation.assertions.length >= MAX_ASSERTIONS} />
    {!!investigation.assertions.length && <>
      <button className="xray-btn" onClick={() => setEvaluation({ specs: investigation.assertions, entries, sessionId, results: usePanelStore.getState().evaluateInvestigationAssertions(investigation.id) })}>Evaluate assertions</button>
      <p className="xray-muted">Reads retained evidence only; re-evaluate after capture changes.</p>
      <ul>{investigation.assertions.map(assertion => {
        const result = results.find(item => item.id === assertion.id);
        return <li key={assertion.id}>{assertion.check.type} · {assertion.entryRef.method} {assertion.entryRef.path} · {resolveEntryRef(assertion.entryRef, sessionId, entries) ? 'available' : 'unavailable'}
          {result ? <span role="status"> · {result.outcome} · expected {String(result.expected)} · actual {String(result.actual)}{result.reason && ` — ${result.reason}`}</span> : ' · not evaluated'}
          <div className="xray-experiment-actions"><button className="xray-chip" disabled={readOnly} onClick={() => usePanelStore.getState().removeInvestigationAssertion(investigation.id, assertion.id)}>Remove assertion</button></div>
        </li>;
      })}</ul>
    </>}
    <h5>Scenarios <span className="xray-muted">{investigation.scenarios.length}/{MAX_SCENARIOS}</span></h5>
    <ScenarioComposer investigationId={investigation.id} disabled={readOnly || running || investigation.scenarios.length >= MAX_SCENARIOS} />
    {investigation.scenarios.map(scenario => <ScenarioCard key={scenario.id} investigation={investigation} scenario={scenario} readOnly={readOnly} />)}
    <footer className="xray-experiment-actions">
      <button className="xray-btn" onClick={() => usePanelStore.getState().openInvestigation(investigation.id)}>Reopen context</button>
      <button className="xray-btn" disabled={readOnly || running} onClick={() => usePanelStore.getState().deleteInvestigation(investigation.id)}>Delete investigation</button>
    </footer>
  </article>;
}

function AssertionComposer({ investigationId, disabled }: { investigationId: string; disabled: boolean }): React.ReactElement {
  const entries = usePanelStore(state => state.entries);
  const [entryId, setEntryId] = useState('');
  const [type, setType] = useState<ExperimentCheck['type']>('status');
  const [status, setStatus] = useState('200');
  const [presence, setPresence] = useState('present');
  const [mode, setMode] = useState<'equal' | 'contains' | 'schema'>('equal');
  const validStatus = Number.isInteger(Number(status)) && Number(status) >= 100 && Number(status) <= 599;
  const available = entries.some(entry => entry.id === entryId && entry.type === 'api');
  return <details><summary>Author assertion</summary>
    <div className="xray-experiment-grid">
      <RequestPicker label="Assertion request" value={entryId} onChange={setEntryId} disabled={disabled} />
      <label className="xray-field"><span>Assertion type</span><select className="xray-select" value={type} disabled={disabled} onChange={event => setType(event.currentTarget.value as ExperimentCheck['type'])}><option value="status">Status</option><option value="response">Response presence</option><option value="structural">Structure vs frozen baseline</option></select></label>
      {type === 'status' && <label className="xray-field"><span>Assertion status</span><input className="xray-input" type="number" min={100} max={599} disabled={disabled} value={status} onChange={event => setStatus(event.currentTarget.value)} /></label>}
      {type === 'response' && <label className="xray-field"><span>Assertion response</span><select className="xray-select" disabled={disabled} value={presence} onChange={event => setPresence(event.currentTarget.value)}><option value="present">Present</option><option value="absent">Absent</option></select></label>}
      {type === 'structural' && <label className="xray-field"><span>Assertion structure</span><select className="xray-select" disabled={disabled} value={mode} onChange={event => setMode(event.currentTarget.value as typeof mode)}><option value="equal">Equal</option><option value="contains">Contains baseline</option><option value="schema">Same schema</option></select></label>}
    </div>
    <p className="xray-muted">Structure checks freeze the sanitized baseline response when authored.</p>
    <button className="xray-btn" disabled={disabled || !available || (type === 'status' && !validStatus)} onClick={() => {
      const check: ExperimentCheck = type === 'status' ? { type, expected: Number(status) } : type === 'response' ? { type, expected: presence === 'present' } : { type, mode };
      usePanelStore.getState().addInvestigationAssertion(investigationId, entryId, check);
    }}>Add assertion</button>
  </details>;
}

function ScenarioComposer({ investigationId, scenarioId, disabled }: { investigationId: string; scenarioId?: string; disabled: boolean }): React.ReactElement {
  const entries = usePanelStore(state => state.entries);
  const rules = usePanelStore(state => state.rules);
  const [entryId, setEntryId] = useState('');
  const [kind, setKind] = useState('replay');
  const [mockRuleId, setMockRuleId] = useState('');
  const [url, setUrl] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [timeout, setTimeout] = useState('30000');
  const [status, setStatus] = useState('200');
  const [presence, setPresence] = useState('present');
  const [structure, setStructure] = useState('none');
  const prefix = scenarioId ? 'Step' : 'Scenario';
  const source = entries.find(entry => entry.id === entryId && entry.type === 'api');
  const mocks = rules.filter(rule => !rule.enabled && rule.action.type === 'mock' && !ruleMatcherError(rule));
  let validTarget = true;
  if (url.trim()) {
    try { const target = new URL(url.trim()); validTarget = ['http:', 'https:'].includes(target.protocol) && !!source && (target.origin === new URL(source.url || '').origin || acknowledged); } catch { validTarget = false; }
  }
  const valid = !!source && validTarget && (kind === 'replay' || mocks.some(rule => rule.id === mockRuleId)) && Number.isInteger(Number(status)) && Number(status) >= 100 && Number(status) <= 599 && Number.isInteger(Number(timeout)) && Number(timeout) >= 1 && Number(timeout) <= 120000;
  return <details><summary>{scenarioId ? 'Add ordered step' : 'Prepare scenario'}</summary>
    <p className="xray-muted" title="Preparation is inert. Only an explicit Run step submits work; mock steps wait for you to trigger the matching request on the page.">Inert until you Run a step; mock steps wait for the matching page request.</p>
    <div className="xray-experiment-grid">
      <RequestPicker label={`${prefix} request`} value={entryId} onChange={setEntryId} disabled={disabled} />
      <label className="xray-field"><span>{prefix} execution</span><select className="xray-select" value={kind} disabled={disabled} onChange={event => setKind(event.currentTarget.value)}><option value="replay">Replay request</option><option value="mock">Use disabled mock rule</option></select></label>
      {kind === 'mock' && <label className="xray-field"><span>{prefix} mock rule</span><select className="xray-select" value={mockRuleId} disabled={disabled} onChange={event => setMockRuleId(event.currentTarget.value)}><option value="">Choose a valid disabled mock</option>{mocks.map(rule => <option key={rule.id} value={rule.id}>{cleanText(rule.label, 120) || rule.id}</option>)}</select></label>}
      <label className="xray-field xray-experiment-url"><span>{prefix} target URL (optional, sanitized on save)</span><input className="xray-input" disabled={disabled} value={url} placeholder="Leave empty to preserve the captured target" onChange={event => { setUrl(event.currentTarget.value); setAcknowledged(false); }} /></label>
      <label className="xray-field"><span>{prefix} timeout (ms)</span><input className="xray-input" type="number" min={1} max={120000} disabled={disabled} value={timeout} onChange={event => setTimeout(event.currentTarget.value)} /></label>
      <label className="xray-field"><span>{prefix} expected status</span><input className="xray-input" type="number" min={100} max={599} disabled={disabled} value={status} onChange={event => setStatus(event.currentTarget.value)} /></label>
      <label className="xray-field"><span>{prefix} response check</span><select className="xray-select" disabled={disabled} value={presence} onChange={event => setPresence(event.currentTarget.value)}><option value="present">Present</option><option value="absent">Absent</option><option value="none">No presence check</option></select></label>
      <label className="xray-field"><span>{prefix} structural check</span><select className="xray-select" disabled={disabled} value={structure} onChange={event => setStructure(event.currentTarget.value)}><option value="none">None</option><option value="equal">Equal to baseline</option><option value="contains">Contains baseline</option><option value="schema">Same schema</option></select></label>
    </div>
    <div className="xray-experiment-options"><label><input type="checkbox" checked={acknowledged} disabled={disabled} onChange={event => setAcknowledged(event.currentTarget.checked)} /> Acknowledge cross-origin retargeting; original secrets will not be restored.</label></div>
    <button className="xray-btn" disabled={disabled || !valid} onClick={() => {
      const plan: Partial<ExperimentPlan> = { timeoutMs: Number(timeout), retargetAcknowledged: acknowledged, ...(url.trim() ? { url: url.trim() } : {}), ...(kind === 'mock' ? { mockRuleId } : {}) };
      const checks: ExperimentCheck[] = [{ type: 'status', expected: Number(status) }];
      if (presence !== 'none') checks.push({ type: 'response', expected: presence === 'present' });
      if (structure === 'equal' || structure === 'contains' || structure === 'schema') checks.push({ type: 'structural', mode: structure });
      const state = usePanelStore.getState();
      if (scenarioId) state.addScenarioStep(investigationId, scenarioId, entryId, plan, checks);
      else state.addInvestigationScenario(investigationId, entryId, plan, checks);
    }}>{scenarioId ? 'Add step' : 'Add scenario'}</button>
  </details>;
}

function ScenarioCard({ investigation, scenario, readOnly }: { investigation: SavedInvestigation; scenario: ScenarioSpec; readOnly: boolean }): React.ReactElement {
  const entries = usePanelStore(state => state.entries);
  const sessionId = usePanelStore(state => state.session.sessionId);
  const rules = usePanelStore(state => state.rules);
  const experiments = usePanelStore(state => state.experiments);
  const runs = investigation.runs.filter(run => run.scenarioId === scenario.id);
  const busy = experiments.some(record => record.status === 'running') || investigation.runs.some(run => run.status === 'running');
  function runnable(step: ScenarioStep): boolean {
    const mock = step.plan.mockRuleId ? rules.find(rule => rule.id === step.plan.mockRuleId) : null;
    return !readOnly && !busy && !!resolveEntryRef(step.source, sessionId, entries) && (!step.plan.mockRuleId || !!(mock && !mock.enabled && mock.action.type === 'mock' && !ruleMatcherError(mock)));
  }
  const lastRun = runs[runs.length - 1];
  const nextIndex = lastRun ? scenario.steps.findIndex(step => step.id === lastRun.stepId) + 1 : 0;
  const next = scenario.steps[nextIndex];
  return <section className="xray-card xray-experiment-card" aria-label={`Scenario ${scenario.title}`}>
    <h5>{scenario.title} · {scenario.steps.length}/{MAX_SCENARIO_STEPS} steps</h5>
    <p className="xray-muted" title="Ordered, manual execution. No next step starts automatically. Cancel stops waiting and cannot recall an already submitted replay.">Manual and ordered; nothing starts automatically. Cancel cannot recall a sent replay.</p>
    <ol>{scenario.steps.map(step => <li key={step.id}>
      <p>{step.label} · {step.plan.mockRuleId ? 'Mock' : 'Replay'} · {resolveEntryRef(step.source, sessionId, entries) ? 'baseline available' : 'baseline unavailable'}</p>
      <p className="xray-muted">{step.plan.method} {step.plan.url} · timeout {step.plan.timeoutMs ?? 30000} ms · checks: {step.checks.map(check => check.type).join(', ') || 'none'}</p>
      <div className="xray-experiment-actions"><button className="xray-btn primary" disabled={!runnable(step)} onClick={() => usePanelStore.getState().runScenarioStep(investigation.id, scenario.id, step.id)}>Run step</button></div>
      <StepRebind investigationId={investigation.id} scenarioId={scenario.id} stepId={step.id} disabled={readOnly || busy} />
    </li>)}</ol>
    <div className="xray-experiment-actions"><button className="xray-btn" disabled={!next || !runnable(next)} onClick={() => { if (next) usePanelStore.getState().runScenarioStep(investigation.id, scenario.id, next.id); }}>Run next step</button>
      <button className="xray-btn" disabled={readOnly || busy} onClick={() => usePanelStore.getState().removeInvestigationScenario(investigation.id, scenario.id)}>Remove scenario</button></div>
    {!next && <p className="xray-muted">All steps attempted. Run a step explicitly to retry.</p>}
    <ScenarioComposer investigationId={investigation.id} scenarioId={scenario.id} disabled={readOnly || busy || scenario.steps.length >= MAX_SCENARIO_STEPS} />
    {!!runs.length && <div className="xray-experiment-results"><h5>Run receipts</h5><ul>{runs.map(run => {
      const step = scenario.steps.find(item => item.id === run.stepId);
      const observedAvailable = !!run.observedEntryId && !!step && step.source.sessionId === sessionId && entries.some(entry => entry.id === run.observedEntryId);
      return <li key={run.id}><p role="status">{run.status} · step {scenario.steps.findIndex(item => item.id === run.stepId) + 1} · experiment {run.experimentId}{run.reason && ` — ${run.reason}`}</p>
        <p>Observed evidence: {observedAvailable ? run.observedEntryId : 'unavailable'}. Captured representations only; this does not establish causality.</p>
        {run.results.map(result => <p key={result.id}>{result.type}: {result.outcome} · expected {String(result.expected)} · actual {String(result.actual)}{result.reason && ` — ${result.reason}`}</p>)}
        {run.status === 'running' && <><p>Waiting for captured evidence. Submission does not confirm page application.</p><button className="xray-btn" onClick={() => usePanelStore.getState().cancelScenarioStep(investigation.id, run.id)}>Cancel waiting</button></>}
      </li>;
    })}</ul></div>}
  </section>;
}

function StepRebind({ investigationId, scenarioId, stepId, disabled }: { investigationId: string; scenarioId: string; stepId: string; disabled: boolean }): React.ReactElement {
  const entries = usePanelStore(state => state.entries);
  const [entryId, setEntryId] = useState('');
  return <details><summary>Explicitly rebind baseline</summary>
    <div className="xray-experiment-grid"><RequestPicker label="Rebind request" value={entryId} onChange={setEntryId} disabled={disabled} /></div>
    <p className="xray-muted">Prepares a baseline only; never runs the step.</p>
    <button className="xray-btn" disabled={disabled || !entries.some(entry => entry.type === 'api' && entry.id === entryId)} onClick={() => usePanelStore.getState().rebindScenarioStep(investigationId, scenarioId, stepId, entryId)}>Rebind step</button>
  </details>;
}
