import React, { useEffect, useRef, useState } from 'react';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { copyText } from '../../utils';

const iconProps = { size: 14, stroke: 1.8 } as const;
type CopyState = 'idle' | 'copied' | 'failed';

/**
 * The exact outbound prompt as a read-only code block. It is keyboard-scrollable
 * (tabIndex 0) but never takes initial focus: ModalShell prefers form fields.
 */
export function PromptPreview({ prompt }: { prompt: string }): React.ReactElement {
  const [state, setState] = useState<CopyState>('idle');
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  async function copy(): Promise<void> {
    try {
      await copyText(prompt);
      if (active.current) setState('copied');
    } catch {
      if (active.current) setState('failed');
    }
  }

  return (
    <div className="xray-prompt-preview">
      <div className="xray-prompt-preview-head">
        <span className="xray-modal-eyebrow" aria-hidden="true">Exact sanitized prompt</span>
        <span className="xray-spacer" />
        <button type="button" className="xray-btn xray-btn-sm" onClick={() => void copy()}>
          {state === 'copied' ? <IconCheck {...iconProps} /> : <IconCopy {...iconProps} />}
          {state === 'copied' ? 'Copied' : 'Copy prompt'}
        </button>
      </div>
      <pre className="xray-prompt-preview-code" role="region" aria-label="Exact sanitized prompt" tabIndex={0}>{prompt}</pre>
      <span className="xray-visually-hidden" role="status" aria-live="polite">{state === 'copied' ? 'Prompt copied' : ''}</span>
      {state === 'failed' && <span className="xray-modal-hint xray-prompt-copy-error" role="alert">Could not copy. Select the prompt and copy it manually, or check clipboard permissions.</span>}
    </div>
  );
}
