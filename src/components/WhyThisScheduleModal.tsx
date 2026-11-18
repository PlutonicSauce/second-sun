import React from 'react';
import type { Scenario, ScheduleResult, PolicyMode } from '../domain/types';
import { PolicyComparison } from './PolicyComparison';

interface WhyThisScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario;
  results: Record<PolicyMode, ScheduleResult>;
  activePolicy: PolicyMode;
  onSelectPolicy: (policy: PolicyMode) => void;
}

export const WhyThisScheduleModal: React.FC<WhyThisScheduleModalProps> = ({
  isOpen,
  onClose,
  scenario,
  results,
  activePolicy,
  onSelectPolicy,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="why-schedule-title">
      <div className="modal-card modal-card-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">SUPPORTING ALLOCATION INTELLIGENCE</span>
            <h2 id="why-schedule-title" className="modal-title">
              Why This Schedule? Policy Tradeoffs & Baselines
            </h2>
            <p className="modal-subtitle">
              Evaluating SECOND SUN's progressive filling against institutional Directorate favoritism and First-Come order under identical physical constraints.
            </p>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Executive Summary Cards */}
          <div className="policy-summary-cards">
            <div className={`policy-summary-box ${activePolicy === 'fair' ? 'policy-box-selected' : ''}`}>
              <div className="box-top">
                <span className="box-title">SECOND SUN (Recommended)</span>
                <span className="box-pill pill-fair">Fair Heuristic</span>
              </div>
              <p className="box-desc">
                Progressive-filling max-min heuristic. Prevents systemic abandonment of lower levels by distributing available power across all five tiers.
              </p>
              <div className="box-stat">
                <strong>{results.fair.metrics.sessions} sessions</strong> · {results.fair.metrics.personSlots} person-slots · Level Gap: {Math.round((results.fair.metrics.minCov ?? 0) * 100)}% min cov
              </div>
              {activePolicy !== 'fair' && (
                <button type="button" className="btn-select-policy" onClick={() => onSelectPolicy('fair')}>
                  Switch to SECOND SUN
                </button>
              )}
            </div>

            <div className={`policy-summary-box ${activePolicy === 'directorate' ? 'policy-box-selected' : ''}`}>
              <div className="box-top">
                <span className="box-title">Directorate Baseline</span>
                <span className="box-pill pill-directorate">Upper Priority</span>
              </div>
              <p className="box-desc">
                Institutional hierarchy prioritizing executive & administrative sectors (Levels 2–3). Leaves deep-level ventilation crews in total darkness (0%).
              </p>
              <div className="box-stat text-danger">
                <strong>{results.directorate.metrics.sessions} sessions</strong> · {results.directorate.metrics.personSlots} person-slots · Level Gap: +100%
              </div>
              {activePolicy !== 'directorate' && (
                <button type="button" className="btn-select-policy" onClick={() => onSelectPolicy('directorate')}>
                  Switch to Directorate
                </button>
              )}
            </div>
          </div>

          {/* Full Side-by-Side Comparison Matrix */}
          <PolicyComparison
            scenario={scenario}
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
      </div>
    </div>
  );
};
