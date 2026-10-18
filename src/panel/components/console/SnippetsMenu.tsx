import React, { useEffect, useRef, useState } from 'react';
import {
  IconBookmark,
  IconBookmarkPlus,
  IconPencil,
  IconX,
} from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import type { Snippet } from '../../types';
import { focusFirstItem, handleMenuKeyDown, useMenuDismiss } from '../common/menuBehavior';

const iconProps = { size: 16, stroke: 1.8 } as const;

// Saved snippets live in a menu beside Run instead of a permanent strip. It is a
// disclosure of ordinary buttons; every row has a real Rename button, so renaming
// never depends on a double-click.
export function SnippetsMenu({ onLoaded }: { onLoaded: () => void }): React.ReactElement {
  const snippets = usePanelStore((state) => state.snippets);
  const setConsoleDraft = usePanelStore((state) => state.setConsoleDraft);
  const removeSnippet = usePanelStore((state) => state.removeSnippet);
  const renameSnippet = usePanelStore((state) => state.renameSnippet);
  const saveSnippet = usePanelStore((state) => state.saveSnippet);
  const draft = usePanelStore((state) => state.consoleDraft);
  const [open, setOpen] = useState(false);
  const [naming, setNaming] = useState(false);
  const [nameText, setNameText] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const [undoSnippet, setUndoSnippet] = useState<Snippet | null>(null);
  const undoTimer = useRef<number | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const editing = naming || renamingId !== null;
  const pendingFocus = useRef<string | null>(null);

  useEffect(() => () => window.clearTimeout(undoTimer.current), []);

  useEffect(() => {
    if (open) focusFirstItem(menuRef.current, true);
  }, [open]);

  // Escape cancels an inline edit first, otherwise closes the menu (shared behaviour).
  useMenuDismiss(open, wrapRef, triggerRef, () => setOpen(false), () => {
    if (!editing) return false;
    // The cancelled input unmounts under focus: hand it to the control that opened it.
    pendingFocus.current = renamingId !== null ? `[data-snippet-id="${renamingId}"] .xray-snippet-action` : '.xray-snippet-save';
    setNaming(false);
    setNameText('');
    setRenamingId(null);
    return true;
  });

  // Inline edits unmount the control that had focus; hand focus to a stable control
  // afterwards instead of letting it fall to <body>.
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    menuRef.current?.querySelector<HTMLElement>(target)?.focus();
  }, [naming, renamingId, snippets]);

  function confirmSave(): void {
    saveSnippet({ code: draft, title: nameText.trim() || undefined });
    pendingFocus.current = '.xray-snippet-save';
    setNaming(false);
    setNameText('');
  }

  function handleRemove(snippet: Snippet, item: HTMLElement | null): void {
    // Focus the neighbouring row (or the trigger) before this one unmounts.
    const neighbour = (item?.nextElementSibling ?? item?.previousElementSibling)?.querySelector<HTMLElement>('.xray-snippet-load');
    (neighbour ?? triggerRef.current)?.focus();
    removeSnippet(snippet.id);
    setUndoSnippet(snippet);
    window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => setUndoSnippet(null), 6000);
  }

  function confirmRename(id: string, restoreFocus = false): void {
    renameSnippet(id, renameText);
    if (restoreFocus) pendingFocus.current = `[data-snippet-id="${id}"] .xray-snippet-action`;
    setRenamingId(null);
  }

  function onMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    handleMenuKeyDown(event, menuRef.current, wrapRef.current, triggerRef.current, () => setOpen(false), true);
  }

  return (
    <div className="xray-snippet-menu-wrap" ref={wrapRef}>
      <button
        ref={triggerRef}
        className="xray-btn xray-snippet-trigger xray-console-action"
        aria-label="Saved snippets menu"
        aria-expanded={open}
        title={snippets.length ? `${snippets.length} saved snippet${snippets.length === 1 ? '' : 's'}` : 'Save reusable commands as snippets'}
        onClick={() => setOpen((value) => !value)}
      >
        <IconBookmark {...iconProps} /><span>Snippets</span>
        {snippets.length > 0 && <span className="xray-chip-count">{snippets.length}</span>}
      </button>
      {open && (
        <div ref={menuRef} className="xray-snippet-menu" role="group" aria-label="Saved console snippets" onKeyDown={onMenuKeyDown}>
          {naming ? (
            <span className="xray-snippet-naming">
              <input
                className="xray-input xray-snippet-rename"
                value={nameText}
                autoFocus
                aria-label="Snippet name"
                placeholder="Name (optional) - Enter to save"
                onChange={(event) => setNameText(event.currentTarget.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); confirmSave(); } }}
              />
              <button className="xray-btn" onClick={confirmSave}>Save</button>
            </span>
          ) : (
            <button className="xray-menu-item xray-snippet-save" aria-label="Save snippet" disabled={!draft.trim()} title={draft.trim() ? 'Save current command as a snippet' : 'Type a command to save it'} onClick={() => setNaming(true)}>
              <IconBookmarkPlus {...iconProps} /><span>Save current command</span>
            </button>
          )}
          <div className="xray-menu-sep" role="separator" />
          {snippets.length === 0 && !undoSnippet && <p className="xray-muted xray-snippet-empty">Save reusable commands here.</p>}
          {snippets.map((snippet) => {
            const label = snippet.title || snippet.code;
            return (
              <div key={snippet.id} className="xray-snippet-item" data-snippet-id={snippet.id}>
                {renamingId === snippet.id ? (
                  <input
                    className="xray-input xray-snippet-rename"
                    value={renameText}
                    autoFocus
                    aria-label="Snippet name"
                    placeholder="Snippet name"
                    onChange={(event) => setRenameText(event.currentTarget.value)}
                    onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); confirmRename(snippet.id, true); } }}
                    onBlur={() => confirmRename(snippet.id)}
                  />
                ) : (
                  <>
                    <button
                      className="xray-snippet-load"
                      title={snippet.code}
                      onClick={() => { setConsoleDraft(snippet.code); setOpen(false); onLoaded(); }}
                    >
                      {label}
                    </button>
                    <button className="xray-snippet-action" aria-label={`Rename snippet ${label}`} title="Rename" onClick={() => { setRenamingId(snippet.id); setRenameText(snippet.title || ''); }}><IconPencil size={13} stroke={1.8} /></button>
                  </>
                )}
                <button className="xray-snippet-action xray-snippet-remove" aria-label={`Delete snippet ${label}`} title="Delete" onClick={(event) => handleRemove(snippet, event.currentTarget.closest('.xray-snippet-item'))}><IconX size={13} stroke={2} /></button>
              </div>
            );
          })}
          {undoSnippet && (
            <button className="xray-btn xray-snippet-undo" onClick={() => { saveSnippet({ code: undoSnippet.code, title: undoSnippet.title }); setUndoSnippet(null); }}>
              Undo delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
