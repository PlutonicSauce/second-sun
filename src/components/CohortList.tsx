import React from 'react';
import type { Cohort, ScheduleResult } from '../domain/types';
import { COHORT_COLORS } from './Timeline';

interface CohortListProps {
  cohorts: Cohort[];
  result: ScheduleResult;
  preferredCov: Record<string, number>;
  selectedCohortId: string | null;
  onSelectCohort: (id: string | null) => void;
  onRequestChange: (cohortId: string, newReq: number) => void;
}

export const CohortList: React.FC<CohortListProps> = ({
  cohorts,
  result,
  preferredCov,
  selectedCohortId,
  onSelectCohort,
  onRequestChange,
}) => {
  return (
    <div className="control-card" role="region" aria-label="Cohort Inspection and Editing">
      <div className="card-header">
        <h3 className="card-title">Resident Cohorts & Demand</h3>
        <span className="badge badge-neutral">4 Shift Groups</span>
      </div>

      <div className="cohorts-list">
        {cohorts.map(cohort => {
          const got = result.got[cohort.id] ?? 0;
          const req = cohort.requestedSlots;
          const covPct = req > 0 ? Math.round((got / req) * 100) : 0;
          const prefPct = Math.round((preferredCov[cohort.id] ?? 0) * 100);
          const whyText = result.why[cohort.id] ?? '';
          const style = COHORT_COLORS[cohort.id] || { bg: '#475569', border: '#94a3b8', text: '#fff' };
          const isSelected = selectedCohortId === cohort.id;

          return (
            <div
              key={cohort.id}
              className={`cohort-card ${isSelected ? 'cohort-card-selected' : ''}`}
            >
              <div className="cohort-top-row">
                <button
                  type="button"
                  className="cohort-name-btn"
                  onClick={() => onSelectCohort(isSelected ? null : cohort.id)}
                  title="Filter timeline to this cohort"
                >
                  <span
                    className="cohort-color-pill"
                    style={{ backgroundColor: style.bg, borderColor: style.border }}
                  />
                  <div>
                    <h4 className="cohort-name">{cohort.name}</h4>
                    <span className="cohort-shift">
                      Shift: {cohort.shiftLabel} • {cohort.populationPeople} residents
                    </span>
                  </div>
                </button>

                <div className="cohort-req-control">
                  <span className="req-label">Req:</span>
                  <button
                    type="button"
                    className="btn-counter"
                    onClick={() => onRequestChange(cohort.id, Math.max(0, req - 1))}
                    aria-label={`Decrease requested sessions for ${cohort.name}`}
                  >
                    −
                  </button>
                  <span className="req-count">{req}</span>
                  <button
                    type="button"
                    className="btn-counter"
                    onClick={() => onRequestChange(cohort.id, req + 1)}
                    aria-label={`Increase requested sessions for ${cohort.name}`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Progress & metrics */}
              <div className="cohort-progress-section">
                <div className="cohort-progress-labels">
                  <span>
                    Allocated: <strong>{got}</strong> of <strong>{req}</strong> sessions ({covPct}%)
                  </span>
                  <span className="preferred-cov-tag" title="Planning assumption only — not a clinical outcome">
                    Preferred Window: <strong>{prefPct}%</strong>
                  </span>
                </div>
                <div className="cohort-bar-track">
                  <div
                    className={`cohort-bar-fill ${
                      covPct >= 100 ? 'bar-good' : covPct >= 50 ? 'bar-warn' : 'bar-danger'
                    }`}
                    style={{ width: `${Math.min(100, covPct)}%` }}
                  />
                </div>
              </div>

              {/* Allocation explanation */}
              <div className="cohort-why-box">
                <span className="why-icon">ℹ</span>
                <p className="why-text">{whyText}</p>
              </div>

              <div className="cohort-rooms-allowed">
                <span className="rooms-allowed-label">Permitted Rooms:</span>
                {cohort.permittedRoomIds.map(rid => (
                  <span key={rid} className="room-chip">
                    {rid}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
