import { useLayoutEffect, useRef, type ReactNode } from 'react';

interface PlanDialogProps {
  titleId: string;
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
}

export function PlanDialog({ titleId, onClose, wide, children }: PlanDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={`modal-backdrop no-print ${wide ? 'modal-backdrop-wide' : ''}`}
      aria-labelledby={titleId}
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-card">{children}</div>
    </dialog>
  );
}
