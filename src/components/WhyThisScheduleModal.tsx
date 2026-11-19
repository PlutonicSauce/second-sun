import React from 'react';
import { PlanDialog } from './PlanDialog';
import type { ScheduleResult, PolicyMode } from '../domain/types';
import { PolicyComparison } from './PolicyComparison';

interface WhyThisScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: Record<PolicyMode, ScheduleResult>;
  activePolicy: PolicyMode;
  onSelectPolicy: (policy: PolicyMode) => void;
}

export const WhyThisScheduleModal: React.FC<WhyThisScheduleModalProps> = ({
  isOpen,
  onClose,
  results,
  activePolicy,
  onSelectPolicy,
}) => {
  if (!isOpen) return null;

  return (
    <PlanDialog titleId="why-schedule-title" wide onClose={onClose}>
        <div className="modal-header">
          <div>
            <h2 id="why-schedule-title" className="modal-title">
              Compare policy results
            </h2>
            <p className="modal-subtitle">
              All three plans use the current room settings and energy limits.
            </p>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <PolicyComparison
            results={results}
            activePolicy={activePolicy}
            onSelectPolicy={onSelectPolicy}
          />
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
    </PlanDialog>
  );
};
