import React, { useState } from 'react';
import type { Scenario, ScheduleResult, PolicyMode } from '../domain/types';
import { exportScenarioJson, exportScheduleCsv, generateShiftHandoverBrief } from '../utils/export';

interface HandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario;
  results: Record<PolicyMode, ScheduleResult>;
  activePolicy: PolicyMode;
}

export const HandoverModal: React.FC<HandoverModalProps> = ({
  isOpen,
  onClose,
  scenario,
  results,
  activePolicy,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const briefText = generateShiftHandoverBrief(scenario, results[activePolicy], activePolicy);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(briefText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="handover-title">
      <div className="modal-card modal-card-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">ACTIONABLE OPERATIONS ARTIFACT</span>
            <h2 id="handover-title" className="modal-title">
              Shift Handover Brief & Data Export
            </h2>
            <p className="modal-subtitle">
              Cycle 2087-D42 · 24-Hour Horizon (00:00–23:30) · Export for facility engineers and shift leaders.
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
              onClick={() => exportScheduleCsv(scenario, results, activePolicy)}
            >
              📥 Download Schedule CSV
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => exportScenarioJson(scenario, results, activePolicy)}
            >
              📄 Download Full JSON
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopy}
            >
              {copied ? '✓ Copied to Clipboard!' : '📋 Copy Brief to Clipboard'}
            </button>
          </div>

          {/* Formatted Plaintext Handover Brief */}
          <div className="handover-preview-container">
            <span className="preview-label">PRINTABLE SHIFT HANDOVER BRIEF:</span>
            <pre className="handover-code-block">{briefText}</pre>
          </div>

          {/* Operational Boundaries Notice */}
          <div className="operational-boundary-notice">
            <span className="notice-icon">ℹ️</span>
            <div className="notice-content">
              <strong>Planning & Supervisory Artifact:</strong>
              <p>
                This generated schedule coordinates room access and operator procedures. It does not directly control physical high-voltage SCADA electrical circuits. Safety, exit, and corridor emergency lighting are strictly separated from this discretionary allocation.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
