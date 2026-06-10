import React from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { ModalShell } from './ModalShell';

const iconProps = { size: 17, stroke: 1.8 } as const;

export function ConfirmationModal(): React.ReactElement | null {
  const request = usePanelStore((state) => state.pendingConfirmation);
  const close = usePanelStore((state) => state.closeConfirmation);
  const confirm = usePanelStore((state) => state.confirmPending);

  if (!request) return null;

  return (
    <ModalShell
      title={request.title}
      subtitle="Confirm this action before XRAY changes the current session."
      icon={<IconAlertTriangle {...iconProps} />}
      className="xray-confirm-modal"
      onClose={close}
      footer={(
        <>
          <span className="xray-spacer" />
          <button className="xray-btn" onClick={close}>{request.cancelLabel || 'Cancel'}</button>
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
