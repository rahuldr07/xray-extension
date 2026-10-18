import React, { useRef } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { ModalShell } from './ModalShell';

const iconProps = { size: 17, stroke: 1.8 } as const;

export function ConfirmationModal(): React.ReactElement | null {
  const request = usePanelStore((state) => state.pendingConfirmation);
  const close = usePanelStore((state) => state.closeConfirmation);
  const confirm = usePanelStore((state) => state.confirmPending);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  if (!request) return null;

  return (
    <ModalShell
      title={request.title}
      icon={<IconAlertTriangle {...iconProps} />}
      className="xray-confirm-modal"
      onClose={close}
      initialFocusRef={cancelRef}
      footer={(
        <>
          <span className="xray-spacer" />
          <button ref={cancelRef} className="xray-btn" onClick={close}>{request.cancelLabel || 'Cancel'}</button>
          <button className={`xray-btn ${request.tone === 'danger' ? 'danger' : 'primary'}`} onClick={confirm}>
            {request.confirmLabel}
          </button>
        </>
      )}
    >
      <div className="xray-modal-body">
        <p className="xray-confirm-message">{request.message}</p>
      </div>
    </ModalShell>
  );
}
