import React from 'react';
import { usePanelStore } from '../../store';
import { StarterChips, useStarters } from './StarterChips';

// Examples only fill the prompt (and focus it); running stays an explicit Enter/Run.
// A draft the user already typed is kept: the example goes on a new line below it.
// `res` is already the parsed response body (see $help), so examples use it directly.
const EXAMPLE_COMMANDS = ['res', 'schema(res)', 'Object.keys(res)', '$help'] as const;

// With a request selected the empty state offers smart starters for its response
// (P8) instead; otherwise these fixed examples.
export function ExampleCommands(): React.ReactElement {
  const starters = useStarters();
  const insertConsoleCommand = usePanelStore((state) => state.insertConsoleCommand);
  const insertExample = (command: string): void => {
    const draft = usePanelStore.getState().consoleDraft.trimEnd();
    insertConsoleCommand(draft ? `${draft}\n${command}` : command);
  };
  if (starters.length) return <StarterChips items={starters} className="xray-console-examples" />;
  return (
    <div className="xray-console-examples" role="group" aria-label="Example commands">
      {EXAMPLE_COMMANDS.map((command) => (
        <button key={command} className="xray-chip xray-console-example" title="Insert into the prompt (does not run)" onClick={() => insertExample(command)}>
          <code>{command}</code>
        </button>
      ))}
    </div>
  );
}
