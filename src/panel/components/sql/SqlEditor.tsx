import React, { useEffect, useRef } from 'react';
import { Compartment, EditorState, Prec, RangeSetBuilder, StateEffect, StateField } from '@codemirror/state';
import { Decoration, EditorView, highlightActiveLine, keymap, lineNumbers, placeholder, type DecorationSet } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { bracketMatching, defaultHighlightStyle, HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { sql } from '@codemirror/lang-sql';
import { connectionDialect, setSelectionReader, usePanelSqlStore } from '../../sqlStore';
import { sqlLanguage, statementAt } from '../../models/sqlStatements';
import { toCompletionSchema } from '../../models/sqlSchema';
import { quickStarts } from '../../models/sqlStarters';
import { editorPlaceholder, isMacPlatform } from '../../models/sqlUi';
import type { SchemaTree, SqlDialect } from '../../models/sqlTypes';

const MAC = isMacPlatform(typeof navigator === 'undefined' ? '' : navigator.platform);

// The statement Ctrl+Enter would run (no selection: the one at the caret) gets a band on its lines,
// so what runs is always visible. Same rule as run('current') in the store.
const statementLine = Decoration.line({ class: 'xray-sql-active-statement' });
function statementBand(state: EditorState): DecorationSet {
  const sel = state.selection.main;
  if (!sel.empty || state.doc.length === 0) return Decoration.none;
  const st = statementAt(state.doc.toString(), sel.head, connectionDialect(usePanelSqlStore.getState().connection));
  if (!st || !st.text.trim()) return Decoration.none;
  const builder = new RangeSetBuilder<Decoration>();
  const first = state.doc.lineAt(st.from).number;
  const last = state.doc.lineAt(Math.max(st.from, st.to)).number;
  for (let n = first; n <= last; n++) builder.add(state.doc.line(n).from, state.doc.line(n).from, statementLine);
  return builder.finish();
}
const statementField = StateField.define<DecorationSet>({
  create: statementBand,
  update: (band, tr) => (tr.docChanged || tr.selection ? statementBand(tr.state) : band),
  provide: (field) => EditorView.decorations.from(field),
});

// The mounted editor, for the quick-start buttons beside it.
let mountedView: EditorView | null = null;

/** Replaces the active tab's SQL through the editor (so it can be undone), and focuses it. */
export function insertIntoEditor(sql: string): void {
  const view = mountedView;
  if (!view) return;
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: sql }, selection: { anchor: sql.length } });
  view.focus();
}

function reportCursor(state: EditorState): void {
  const head = state.selection.main.head;
  const line = state.doc.lineAt(head);
  usePanelSqlStore.getState().setCursor(line.number, head - line.from + 1);
}

// The error underline: one mark at the engine's error position, dropped on the next edit.
const setErrorMark = StateEffect.define<{ from: number; to: number } | null>();
const errorMark = Decoration.mark({ class: 'xray-sql-error-mark' });
const errorField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(marks, tr) {
    let next = tr.docChanged ? Decoration.none : marks;
    for (const effect of tr.effects) {
      if (effect.is(setErrorMark)) next = effect.value ? Decoration.set([errorMark.range(effect.value.from, effect.value.to)]) : Decoration.none;
    }
    return next;
  },
  provide: (field) => EditorView.decorations.from(field),
});

// Token colours from the theme. The tags come from CodeMirror's default style (its specs carry
// them), so no extra highlighting package is needed; each default colour maps to an --xray token.
const TOKEN_COLOURS: Record<string, string> = {
  '#708': 'var(--xray-mauve)',
  '#219': 'var(--xray-peach)',
  '#164': 'var(--xray-peach)',
  '#a11': 'var(--xray-green)',
  '#e40': 'var(--xray-yellow)',
  '#00f': 'var(--xray-blue)',
  '#30a': 'var(--xray-blue)',
  '#085': 'var(--xray-teal)',
  '#167': 'var(--xray-teal)',
  '#256': 'var(--xray-blue)',
  '#00c': 'var(--xray-blue)',
  '#940': 'var(--xray-hint)',
  '#f00': 'var(--xray-red)',
  '#404740': 'var(--xray-subtext)',
};
const xrayHighlight = HighlightStyle.define(
  defaultHighlightStyle.specs.map((spec) => (spec.color ? { ...spec, color: TOKEN_COLOURS[spec.color] ?? 'var(--xray-text)' } : spec)),
);

const xrayTheme = EditorView.theme({
  '&': { height: '100%', color: 'var(--xray-text)', backgroundColor: 'var(--xray-bg)', fontSize: '13px' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'var(--xray-font)', lineHeight: '1.55' },
  '.cm-content': { caretColor: 'var(--xray-accent)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--xray-accent)' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--xray-active)',
  },
  '.cm-activeLine': { backgroundColor: 'rgba(var(--xray-text-rgb), .04)' },
  '.cm-gutters': { backgroundColor: 'var(--xray-surface)', color: 'var(--xray-hint)', border: 'none', borderRight: '1px solid var(--xray-border)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(var(--xray-text-rgb), .06)', color: 'var(--xray-subtext)' },
  '.cm-matchingBracket': { backgroundColor: 'var(--xray-selection)', outline: '1px solid var(--xray-border-control)' },
  '.cm-tooltip': { backgroundColor: 'var(--xray-surface2)', color: 'var(--xray-text)', border: '1px solid var(--xray-border)' },
  '.cm-tooltip-autocomplete > ul': { fontFamily: 'var(--xray-font)' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: 'var(--xray-active)', color: 'var(--xray-text)' },
  '.xray-sql-error-mark': { textDecoration: 'underline wavy var(--xray-red)', textUnderlineOffset: '3px' },
  '.cm-placeholder': { color: 'var(--xray-hint)', fontStyle: 'normal' },
  '.xray-sql-active-statement': {
    backgroundColor: 'color-mix(in srgb, var(--xray-accent) 6%, transparent)',
    boxShadow: 'inset 2px 0 0 color-mix(in srgb, var(--xray-accent) 55%, transparent)',
  },
  '.xray-sql-active-statement.cm-activeLine': {
    backgroundColor: 'color-mix(in srgb, var(--xray-accent) 9%, transparent)',
  },
});

function sqlExtension(schema: SchemaTree | null, dialect: SqlDialect) {
  return sql({
    dialect: sqlLanguage(dialect),
    schema: schema ? toCompletionSchema(schema, dialect) : {},
    upperCaseKeywords: false,
  });
}

// From the error position to the end of the token there (at least one character).
function errorRange(doc: string, position: number): { from: number; to: number } | null {
  if (!doc.length) return null;
  const from = Math.max(0, Math.min(position, doc.length - 1));
  const word = /^[\w$"'`[\].]+/.exec(doc.slice(from, from + 200));
  return { from, to: Math.min(doc.length, from + (word ? word[0].length : 1)) };
}

export function SqlEditor(): React.ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const languageRef = useRef(new Compartment());
  const activeTabId = usePanelSqlStore((s) => s.activeTabId);
  const tabSql = usePanelSqlStore((s) => s.tabs.find((t) => t.id === s.activeTabId)?.sql ?? '');
  const schema = usePanelSqlStore((s) => s.schema);
  const errorAt = usePanelSqlStore((s) => s.errorAt);
  const dialect = usePanelSqlStore((s) => connectionDialect(s.connection));
  // Read by the editor's callbacks, which outlive any one render.
  const live = useRef({ tabId: activeTabId, schema, dialect });
  const shownTabRef = useRef<string | null>(null);

  function createState(doc: string): EditorState {
    const { run } = usePanelSqlStore.getState();
    return EditorState.create({
      doc,
      extensions: [
        Prec.highest(
          keymap.of([
            { key: 'Mod-Enter', run: () => (void run('current'), true) },
            { key: 'Mod-Shift-Enter', run: () => (void run('all'), true) },
          ]),
        ),
        lineNumbers(),
        highlightActiveLine(),
        history(),
        bracketMatching(),
        autocompletion(),
        keymap.of([...completionKeymap, ...defaultKeymap, ...historyKeymap]),
        languageRef.current.of(sqlExtension(live.current.schema, live.current.dialect)),
        syntaxHighlighting(xrayHighlight),
        xrayTheme,
        errorField,
        statementField,
        placeholder(editorPlaceholder(MAC)),
        EditorView.contentAttributes.of({ 'aria-label': 'SQL editor' }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) usePanelSqlStore.getState().updateTabSql(live.current.tabId, update.state.doc.toString());
          if (update.docChanged || update.selectionSet) reportCursor(update.state);
        }),
      ],
    });
  }

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const view = new EditorView({ state: createState(tabSql), parent: host });
    viewRef.current = view;
    mountedView = view;
    shownTabRef.current = activeTabId;
    reportCursor(view.state);
    setSelectionReader(() => {
      const main = view.state.selection.main;
      return { from: main.from, to: main.to, head: main.head };
    });
    return () => {
      setSelectionReader(null);
      if (mountedView === view) mountedView = null;
      view.destroy();
      viewRef.current = null;
    };
    // Mount once; the effects below follow the store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    live.current.tabId = activeTabId;
    const view = viewRef.current;
    if (!view) return;
    if (shownTabRef.current !== activeTabId) {
      // Each tab gets its own undo history.
      shownTabRef.current = activeTabId;
      view.setState(createState(tabSql));
      reportCursor(view.state);
    } else if (view.state.doc.toString() !== tabSql) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: tabSql } });
    }
  }, [activeTabId, tabSql]);

  useEffect(() => {
    live.current.schema = schema;
    live.current.dialect = dialect;
    viewRef.current?.dispatch({ effects: languageRef.current.reconfigure(sqlExtension(schema, dialect)) });
  }, [schema, dialect]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const range = errorAt && errorAt.tabId === activeTabId ? errorRange(view.state.doc.toString(), errorAt.position) : null;
    view.dispatch({ effects: setErrorMark.of(range) });
    if (range) view.dispatch({ effects: EditorView.scrollIntoView(range.from, { y: 'nearest' }) });
  }, [errorAt, activeTabId]);

  return <div ref={hostRef} className="xray-sql-editor" />;
}

// Starters for an empty tab, under the placeholder. They insert SQL and focus the editor; nothing runs.
export function QuickStarts(): React.ReactElement | null {
  const empty = usePanelSqlStore((s) => !s.tabs.find((t) => t.id === s.activeTabId)?.sql.trim());
  const schema = usePanelSqlStore((s) => s.schema);
  // The starters are SQLite queries (sqlite_schema, pragma_table_info).
  const sqlite = usePanelSqlStore((s) => connectionDialect(s.connection) === 'sqlite');
  const starters = React.useMemo(() => quickStarts(schema), [schema]);
  if (!empty || !sqlite) return null;
  return (
    <div className="xray-sql-quickstarts" role="group" aria-label="Quick starts">
      <span className="xray-sql-quickstarts-label">Start with</span>
      {starters.map((starter) => (
        <button key={starter.label} type="button" className="xray-btn xray-btn-sm" title={starter.sql} onClick={() => insertIntoEditor(starter.sql)}>
          {starter.label}
        </button>
      ))}
    </div>
  );
}
