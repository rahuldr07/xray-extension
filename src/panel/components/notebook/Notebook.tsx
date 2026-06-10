import React from 'react';
import { IconPlus, IconPlayerPlay, IconSend } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { executeConsoleCommand } from '../../runtime/consoleBridge';
import { iconProps } from '../shell/panelTabs';
import { JsonView } from '../detail/JsonView';

export function Notebook(): React.ReactElement {
  const notebookCells = usePanelStore((state) => state.notebookCells);
  const addNotebookCell = usePanelStore((state) => state.addNotebookCell);
  const updateNotebookCell = usePanelStore((state) => state.updateNotebookCell);
  const setNotebookCellResult = usePanelStore((state) => state.setNotebookCellResult);
  const insertConsoleCommand = usePanelStore((state) => state.insertConsoleCommand);

  async function runNotebookCell(id: string, code: string): Promise<void> {
    const trimmed = code.trim();
    if (!trimmed) return;
    setNotebookCellResult(id, { running: true, error: undefined });
    const result = await executeConsoleCommand(trimmed);
    if (!result) {
      setNotebookCellResult(id, { running: false, output: null });
      return;
    }
    if (result.type === 'error') {
      setNotebookCellResult(id, { running: false, error: result.error?.message || 'Execution failed', output: result.error });
      return;
    }
    setNotebookCellResult(id, { running: false, output: result.result, error: undefined });
  }

  return (
    <section className="xray-page xray-notebook-page">
      <header className="xray-page-head">
        <div>
          <h3>Investigation Notebook</h3>
          <p>Save response-aware commands, run them manually, or send them back to the Console prompt.</p>
        </div>
        <button className="xray-btn" onClick={() => addNotebookCell({ code: 'schema(res)', title: 'Response schema' })}>
          <IconPlus {...iconProps} />
          Add cell
        </button>
      </header>
      <div className="xray-notebook-grid">
        {notebookCells.map((cell) => (
          <div key={cell.id} className="xray-notebook-cell">
            <div className="xray-notebook-cell-head">
              <div className="xray-notebook-title">{cell.title || 'Investigation cell'}</div>
              <button className="xray-icon-btn" onClick={() => insertConsoleCommand(cell.code)} aria-label="Send cell to Console">
                <IconSend {...iconProps} />
              </button>
              <button className="xray-btn" onClick={() => void runNotebookCell(cell.id, cell.code)}>
                <IconPlayerPlay {...iconProps} />
                {cell.running ? 'Running' : 'Run'}
              </button>
            </div>
            <textarea
              className="xray-textarea"
              value={cell.code}
              onChange={(event) => updateNotebookCell(cell.id, event.currentTarget.value)}
            />
            {(cell.output !== undefined || cell.error) && (
              <div className={`xray-notebook-output ${cell.error ? 'error' : ''}`}>
                {cell.error ? <pre className="xray-json">{cell.error}</pre> : <JsonView value={cell.output} />}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
