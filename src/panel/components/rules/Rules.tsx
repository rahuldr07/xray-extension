import React, { useState } from 'react';
import { IconChevronDown, IconClipboard, IconCopy, IconDots, IconPlus, IconPlugConnected, IconTrash } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { RULE_PRESETS, parseRuleSet, ruleMatcherError, ruleSummary, serializeRuleSet } from '../../models/rules';
import { hasPageBridgeRoute } from '../../runtime/captureConfig';
import { copyText } from '../../utils';
import type { RulesSubTab, TrafficRule, TrafficRuleAction } from '../../types';
import { iconProps } from '../shell/panelTabs';
import { Notice } from '../common/Notice';
import { DisclosureMenu } from '../common/DisclosureMenu';
import { ExperimentPanel } from '../experiments/ExperimentPanel';
import { InvestigationPanel } from '../investigations/InvestigationPanel';

const actionTypes: Array<{ id: TrafficRuleAction['type']; label: string }> = [
  { id: 'mock', label: 'Mock response' },
  { id: 'delay', label: 'Add delay' },
  { id: 'fail', label: 'Force failure' },
  { id: 'passthrough', label: 'Passthrough' },
];

const subTabs: Array<{ id: RulesSubTab; label: string }> = [
  { id: 'rules', label: 'Rules' },
  { id: 'experiments', label: 'Experiments' },
  { id: 'investigations', label: 'Investigations' },
];

// Rules, Experiments and Investigations share one page. Every section stays mounted
// (the inactive ones are hidden) so unsaved drafts survive switching between them.
export function Rules(): React.ReactElement {
  const subTab = usePanelStore((state) => state.rulesSubTab);
  const setSubTab = usePanelStore((state) => state.setRulesSubTab);
  const counts: Record<RulesSubTab, number> = {
    rules: usePanelStore((state) => state.rules.length),
    experiments: usePanelStore((state) => state.experiments.length),
    investigations: usePanelStore((state) => state.investigationStore.investigations.length),
  };

  function onTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, id: RulesSubTab): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = subTabs.findIndex((tab) => tab.id === id);
    const last = subTabs.length - 1;
    const next = subTabs[event.key === 'Home' ? 0 : event.key === 'End' ? last
      : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1) : (index === last ? 0 : index + 1)];
    setSubTab(next.id);
    const root = event.currentTarget.getRootNode() as Document | ShadowRoot;
    (root.getElementById?.(`xray-rules-subtab-${next.id}`) as HTMLElement | null)?.focus();
  }

  return (
    <section className="xray-page xray-rules-page">
      <div className="xray-subtabs" role="tablist" aria-label="Rules sections">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            id={`xray-rules-subtab-${tab.id}`}
            role="tab"
            className={`xray-chip xray-subtab ${subTab === tab.id ? 'active' : ''}`}
            aria-selected={subTab === tab.id}
            aria-controls={`xray-rules-subpanel-${tab.id}`}
            tabIndex={subTab === tab.id ? 0 : -1}
            onClick={() => setSubTab(tab.id)}
            onKeyDown={(event) => onTabKeyDown(event, tab.id)}
          >
            {tab.label}<span className="xray-chip-count">{counts[tab.id]}</span>
          </button>
        ))}
      </div>
      {subTabs.map((tab) => (
        <div key={tab.id} id={`xray-rules-subpanel-${tab.id}`} className="xray-subpanel" role="tabpanel" tabIndex={0} aria-labelledby={`xray-rules-subtab-${tab.id}`} hidden={subTab !== tab.id}>
          {tab.id === 'rules' ? <RulesList /> : tab.id === 'experiments' ? <ExperimentPanel /> : <InvestigationPanel />}
        </div>
      ))}
    </section>
  );
}

function RulesList(): React.ReactElement {
  const rules = usePanelStore((state) => state.rules);
  const addRule = usePanelStore((state) => state.addRule);
  const importRuleDrafts = usePanelStore((state) => state.importRules);
  const showToast = usePanelStore((state) => state.showToast);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');

  async function exportRules(): Promise<void> {
    if (!rules.length) { showToast('No rules to export.'); return; }
    try {
      await copyText(serializeRuleSet(rules));
      showToast(`Copied ${rules.length} rule${rules.length === 1 ? '' : 's'} to clipboard.`);
    } catch {
      showToast('Could not copy. Export the rules manually, or check clipboard permissions.');
    }
  }
  function createRule(rule?: Partial<TrafficRule>): void {
    const result = addRule(rule);
    showToast(result.accepted ? 'Added 1 disabled rule. Enable it when ready.' : `No rules added. ${result.omitted} skipped — the 50-rule limit is reached.`);
  }
  function importRules(): void {
    const parsed = parseRuleSet(importText);
    if (!parsed) { showToast('Could not read a rule set from that text.'); return; }
    const result = importRuleDrafts(parsed);
    if (!result.accepted) {
      showToast(`No rules imported. ${result.omitted} skipped — the 50-rule limit is reached.`);
      return;
    }
    setImportText('');
    setImportOpen(false);
    showToast(`Imported ${result.accepted} rule${result.accepted === 1 ? '' : 's'} as disabled drafts. ${result.omitted} skipped.`);
  }

  return (
    <>
      <div className="xray-rules-toolbar">
        <p className="xray-rules-hint">Rules start disabled. Review each one, then enable it explicitly.</p>
        <span className="xray-spacer" />
        <DisclosureMenu triggerClassName="xray-btn" triggerTitle="Add a disabled rule from a preset" trigger={<>Presets<IconChevronDown {...iconProps} /></>} menuLabel="Rule presets">
          {RULE_PRESETS.map((preset) => (
            <button key={preset.label} className="xray-menu-item" onClick={() => createRule(preset.rule)}>{preset.label}</button>
          ))}
        </DisclosureMenu>
        <DisclosureMenu triggerClassName="xray-icon-btn" triggerLabel="More rule actions" triggerTitle="Import or export rules" trigger={<IconDots {...iconProps} />} menuLabel="Import and export rules">
          <>
            <button className="xray-menu-item" title="Copy all rules as portable JSON" onClick={() => void exportRules()}><IconCopy {...iconProps} />Export</button>
            <button className="xray-menu-item" title="Paste a rule set to load" onClick={() => setImportOpen((value) => !value)}><IconClipboard {...iconProps} />Import</button>
          </>
        </DisclosureMenu>
        <button className="xray-btn primary" onClick={() => createRule()}><IconPlus {...iconProps} />New rule</button>
      </div>
      {hasPageBridgeRoute()
        ? <Notice tone="info" live>Enabling submits valid rules to the page bridge. Runtime application is not confirmed; inspect captured traffic for observed effects.</Notice>
        : <Notice tone="warning" live>Page bridge unavailable. Enabled rules are local only and are not applied to the page. Open XRAY on a live page or in its DevTools panel.</Notice>}
      {importOpen && (
        <div className="xray-rules-import">
          <textarea
            className="xray-input xray-rules-import-field"
            placeholder="Paste a rule set exported from XRAY (JSON)"
            value={importText}
            spellCheck={false}
            autoFocus
            onChange={(event) => setImportText(event.currentTarget.value)}
          />
          <button className="xray-btn primary" onClick={importRules}>Load rules</button>
        </div>
      )}
      {!rules.length ? (
        <div className="xray-card xray-rules-empty">
          <IconPlugConnected size={22} stroke={1.6} />
          <p>No rules yet. Create one here, or use “Mock this” on any captured response to seed a rule from real traffic.</p>
        </div>
      ) : (
        <div className="xray-rules-list">
          {rules.map((rule) => <RuleCard key={rule.id} rule={rule} />)}
        </div>
      )}
    </>
  );
}

function RuleCard({ rule }: { rule: TrafficRule }): React.ReactElement {
  const updateRule = usePanelStore((state) => state.updateRule);
  const removeRule = usePanelStore((state) => state.removeRule);
  const toggleRule = usePanelStore((state) => state.toggleRule);
  const matcherError = ruleMatcherError(rule);

  return (
    <div className={`xray-card xray-rule-card ${rule.enabled ? '' : 'disabled'}`}>
      <div className="xray-rule-head">
        <button className={`xray-toggle ${rule.enabled ? 'on' : ''}`} aria-label={rule.enabled ? 'Disable rule' : 'Enable rule'} aria-pressed={rule.enabled} disabled={!rule.enabled && !!matcherError} onClick={() => toggleRule(rule.id)} />
        <input
          className="xray-input xray-rule-label"
          value={rule.label}
          onChange={(event) => updateRule(rule.id, { label: event.currentTarget.value })}
          aria-label="Rule name"
          placeholder="Rule name…"
        />
        <span className="xray-rule-summary">{ruleSummary(rule)}</span>
        <span className="xray-rule-summary">{rule.enabled ? 'Enabled locally' : 'Disabled'}</span>
        <button className="xray-icon-btn" aria-label="Delete rule" onClick={() => usePanelStore.getState().requestConfirmation({ title: 'Delete rule?', message: 'This removes the rule. Requests it matched go to the network again.', confirmLabel: 'Delete rule', tone: 'danger', onConfirm: () => removeRule(rule.id) })}><IconTrash {...iconProps} /></button>
      </div>
      {matcherError && <p role="alert">{matcherError}</p>}
      {!rule.enabled && <p>Matcher or action edits disable this rule. Review it and enable it again when ready.</p>}
      {rule.action.type === 'mock' && <button className="xray-chip" disabled={rule.enabled || !!matcherError} onClick={() => {
        const state = usePanelStore.getState();
        const baseline = state.entries.find(entry => entry.id === state.selectedId && entry.type === 'api');
        if (!baseline) { state.showToast('Select a captured API request as the baseline before preparing a mock experiment.'); return; }
        state.draftExperiment(baseline, { mockRuleId: rule.id }, [{ type: 'status', expected: rule.action.status }, { type: 'response', expected: true }]);
      }}>Prepare mock experiment</button>}
      <div className="xray-rule-grid">
        <label className="xray-field">
          <span>URL contains / re:pattern</span>
          <input className="xray-input xray-input-data" value={rule.match.url} onChange={(event) => updateRule(rule.id, { match: { ...rule.match, url: event.currentTarget.value } })} placeholder="/api/users or re:\\/v2\\/.*" />
        </label>
        <label className="xray-field xray-field-narrow">
          <span>Method</span>
          <select className="xray-select" value={rule.match.method} onChange={(event) => updateRule(rule.id, { match: { ...rule.match, method: event.currentTarget.value } })}>
            <option value="">ANY</option>
            {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((method) => <option key={method} value={method}>{method}</option>)}
          </select>
        </label>
        <label className="xray-field xray-field-narrow">
          <span>Action</span>
          <select className="xray-select" value={rule.action.type} onChange={(event) => updateRule(rule.id, { action: { ...rule.action, type: event.currentTarget.value as TrafficRuleAction['type'] } })}>
            {actionTypes.map((action) => <option key={action.id} value={action.id}>{action.label}</option>)}
          </select>
        </label>
        {(rule.action.type === 'mock') && (
          <label className="xray-field xray-field-narrow">
            <span>Status</span>
            <input className="xray-input" type="number" min={200} max={599} value={rule.action.status} onChange={(event) => updateRule(rule.id, { action: { ...rule.action, status: Number(event.currentTarget.value) } })} />
          </label>
        )}
        {(rule.action.type === 'mock' || rule.action.type === 'delay') && (
          <label className="xray-field xray-field-narrow">
            <span>Delay (ms)</span>
            <input className="xray-input" type="number" min={0} max={60000} step={100} value={rule.action.delayMs} onChange={(event) => updateRule(rule.id, { action: { ...rule.action, delayMs: Number(event.currentTarget.value) } })} />
          </label>
        )}
      </div>
      {rule.action.type === 'mock' && (
        <label className="xray-field">
          <span>Response body</span>
          <textarea
            className="xray-input xray-rule-body"
            value={rule.action.body}
            spellCheck={false}
            onChange={(event) => updateRule(rule.id, { action: { ...rule.action, body: event.currentTarget.value } })}
            placeholder='{ "mocked": true }'
          />
        </label>
      )}
    </div>
  );
}
