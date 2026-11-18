import React from 'react';
import type { Scenario, ScheduleResult } from '../domain/types';

interface UnmetDemandGuideProps {
  scenario: Scenario;
  result: ScheduleResult;
  onOpenWhyThisSchedule: () => void;
}

export const UnmetDemandGuide: React.FC<UnmetDemandGuideProps> = ({
  scenario,
  result,
  onOpenWhyThisSchedule,
}) => {
  const cohortRows = scenario.cohorts.map(cohort => {
    const requested = cohort.requestedSlots;
    const scheduled = result.got[cohort.id] ?? 0;
    const pct = requested > 0 ? Math.round((scheduled / requested) * 100) : 100;
    const why = result.why[cohort.id] || 'Fulfilled within electrical and room capacity limits.';

    // Preferred wake window count
    const assignedSlots = result.assignments
      .filter(a => a.cohortId === cohort.id)
      .map(a => a.slotIndex);
    const inWakeWindow = assignedSlots.filter(s => cohort.preferredSlots.includes(s)).length;

    return {
      cohort,
      requested,
      scheduled,
      pct,
      why,
      inWakeWindow,
    };
  });

  return (
    <section className="unmet-guide-section no-print" aria-label="Crew Inquiry Reference">
      <div className="unmet-header">
        <div className="unmet-title-group">
          <span className="runsheet-eyebrow">CREW INQUIRY REFERENCE</span>
          <h2 className="unmet-title">When Shift Leaders Ask Why Hours Were Cut</h2>
          <p className="unmet-subline">
            During power rationing, use this reference to explain allocation decisions to crew supervisors respectfully and transparently.
          </p>
        </div>

        <button
          type="button"
          className="btn-apple-secondary"
          onClick={onOpenWhyThisSchedule}
        >
          Compare Institutional Policies
        </button>
      </div>

      <div className="unmet-grid" role="list">
        {cohortRows.map(({ cohort, requested, scheduled, pct, why, inWakeWindow }) => (
          <div key={cohort.id} className="unmet-card" role="listitem">
            <div className="unmet-card-header">
              <div className="unmet-card-identity">
                <span className="unmet-crew-name">{cohort.name}</span>
                <span className="unmet-crew-meta">
                  Level {cohort.level} · {cohort.populationPeople} crew · {cohort.shiftLabel}
                </span>
              </div>
              <div className="unmet-card-metric">
                <span className="unmet-stat-pct">{pct}%</span>
                <span className="unmet-stat-label">
                  {scheduled} of {requested} sessions ({scheduled * 30} min)
                </span>
              </div>
            </div>

            <div className="unmet-bar-bg" aria-hidden="true">
              <div
                className="unmet-bar-fill"
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>

            <div className="unmet-explanation">
              <p className="unmet-why-text">{why}</p>
              <div className="unmet-timing-note">
                {scheduled > 0 ? (
                  <span>
                    Timing: {inWakeWindow} of {scheduled} sessions placed in primary wake window.
                  </span>
                ) : (
                  <span className="unmet-unserved">
                    No sessions scheduled under current power budget.
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="unmet-equity-footer">
        <div className="equity-badge" aria-hidden="true">EQUITY ASSURANCE</div>
        <p className="equity-note">
          Under SECOND SUN, no deep-level sector is completely blacked out. Every crew retains access to bright-light fixtures, whereas conventional seniority and upper-level preference allocate 100% of rationed power to Levels 2–3 while leaving lower levels at zero.
        </p>
      </div>
    </section>
  );
};
