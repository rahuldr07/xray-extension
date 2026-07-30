import React, { useState } from 'react';
import { IconClipboard, IconCopy, IconPlus, IconPlugConnected, IconTrash } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { RULE_PRESETS, parseRuleSet, ruleSummary, serializeRuleSet } from '../../models/rules';
import { copyText } from '../../utils';
import type { TrafficRule, TrafficRuleAction } from '../../types';
import { iconProps } from '../shell/panelTabs';

const actionTypes: Array<{ id: TrafficRuleAction['type']; label: string }> = [
  { id: 'mock', label: 'Mock response' },
  { id: 'delay', label: 'Add delay' },
  { id: 'fail', label: 'Force failure' },
  { id: 'passthrough', label: 'Passthrough' },
];

export function Rules(): React.ReactElement {
  const rules = usePanelStore((state) => state.rules);
  const addRule = usePanelStore((state) => state.addRule);
  const setRules = usePanelStore((state) => state.setRules);
  const showToast = usePanelStore((state) => state.showToast);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');

  function exportRules(): void {
    if (!rules.length) { showToast('No rules to export.'); return; }
    void copyText(serializeRuleSet(rules));
    showToast(`Copied ${rules.length} rule${rules.length === 1 ? '' : 's'} to clipboard.`);
  }
  function importRules(): void {
    const parsed = parseRuleSet(importText);
    if (!parsed) { showToast('Could not read a rule set from that text.'); return; }
    setRules([...rules, ...parsed]);
    setImportText('');
    setImportOpen(false);
    showToast(`Imported ${parsed.length} rule${parsed.length === 1 ? '' : 's'}.`);
  }

  return (
    <section className="xray-page xray-rules-page">
      <header className="xray-page-head">
        <div>
          <h3>Traffic Rules</h3>
          <p>Intercept matching requests to mock responses, inject latency, or force failures. Rules run in the page before the real network call.</p>
        </div>
        <button className="xray-btn primary" onClick={() => addRule()}><IconPlus {...iconProps} />New rule</button>
      </header>
      <div className="xray-rules-toolbar">
        <span className="xray-rules-toolbar-label">Presets</span>
        {RULE_PRESETS.map((preset) => (
          <button key={preset.label} className="xray-chip" onClick={() => { addRule(preset.rule); showToast(`Added preset “${preset.label}”.`); }}>{preset.label}</button>
        ))}
        <span className="xray-spacer" />
        <button className="xray-chip" onClick={exportRules} title="Copy all rules as portable JSON"><IconCopy {...iconProps} />Export</button>
        <button className="xray-chip" onClick={() => setImportOpen((value) => !value)} title="Paste a rule set to load"><IconClipboard {...iconProps} />Import</button>
      </div>
      {importOpen && (
        <div className="xray-rules-import">
          <textarea
            className="xray-input xray-rules-import-field"
            placeholder="Paste a rule set exported from XRAY (JSON)"
            value={importText}
            spellCheck={false}
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
    </section>
  );
}

function RuleCard({ rule }: { rule: TrafficRule }): React.ReactElement {
  const updateRule = usePanelStore((state) => state.updateRule);
  const removeRule = usePanelStore((state) => state.removeRule);
  const toggleRule = usePanelStore((state) => state.toggleRule);

  return (
    <div className={`xray-card xray-rule-card ${rule.enabled ? '' : 'disabled'}`}>
      <div className="xray-rule-head">
        <button className={`xray-toggle ${rule.enabled ? 'on' : ''}`} aria-label="Toggle rule" aria-pressed={rule.enabled} onClick={() => toggleRule(rule.id)} />
        <input
          className="xray-input xray-rule-label"
          value={rule.label}
          onChange={(event) => updateRule(rule.id, { label: event.currentTarget.value })}
          placeholder="Rule name"
        />
        <span className="xray-rule-summary">{ruleSummary(rule)}</span>
        <button className="xray-icon-btn" aria-label="Delete rule" onClick={() => removeRule(rule.id)}><IconTrash {...iconProps} /></button>
      </div>
      <div className="xray-rule-grid">
        <label className="xray-field">
          <span>URL contains / re:pattern</span>
          <input className="xray-input" value={rule.match.url} onChange={(event) => updateRule(rule.id, { match: { ...rule.match, url: event.currentTarget.value } })} placeholder="/api/users or re:\\/v2\\/.*" />
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
