import { useState } from 'react';
import { PlanDialog } from './PlanDialog';
import type { Scenario, ScheduleResult, PolicyMode } from '../domain/types';
import { exportScenarioJson, exportScheduleCsv, generateShiftHandoverBrief } from '../utils/export';

interface HandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario;
  results: Record<PolicyMode, ScheduleResult>;
  activePolicy: PolicyMode;
}

export function HandoverModal({ isOpen, ...props }: HandoverModalProps) {
  return isOpen ? <HandoverDialog {...props} /> : null;
}

function HandoverDialog({
  onClose,
  scenario,
  results,
  activePolicy,
}: Omit<HandoverModalProps, 'isOpen'>) {
  const [copyStatus, setCopyStatus] = useState('');
  const briefText = generateShiftHandoverBrief(scenario, results[activePolicy], activePolicy);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(briefText);
      setCopyStatus('Brief copied.');
    } catch {
      setCopyStatus('Clipboard access failed. You can select and copy the preview below.');
    }
  };

  return (
    <PlanDialog titleId="handover-title" wide onClose={onClose}>
        <div className="modal-header">
          <div>
            <h2 id="handover-title" className="modal-title">
              Export the active plan
            </h2>
            <p className="modal-subtitle">
              Download schedule data or copy the handover for the next shift.
            </p>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Action Download Buttons */}
          <div className="export-button-bar">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => exportScheduleCsv(scenario, results[activePolicy], activePolicy)}
            >
              Download CSV
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => exportScenarioJson(scenario, results, activePolicy)}
            >
              Download JSON
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopy}
            >
              Copy handover brief
            </button>
          </div>

          <p role="status">{copyStatus}</p>
          <div className="handover-preview-container">
            <span className="preview-label">Shift handover preview</span>
            <pre className="handover-code-block">{briefText}</pre>
          </div>

        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
    </PlanDialog>
  );
}
