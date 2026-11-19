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
    const rawWhy = result.why[cohort.id] || 'Fulfilled within electrical and room capacity limits.';

    // Preferred wake window count
    const assignedSlots = result.assignments
      .filter(a => a.cohortId === cohort.id)
      .map(a => a.slotIndex);
    const inWakeWindow = assignedSlots.filter(s => cohort.preferredSlots.includes(s)).length;

    // Human-grounded operational explanation for facility supervisors
    let humanExplanation = '';
    if (scheduled === requested) {
      humanExplanation = `Fully accommodated. All ${requested} requested sessions scheduled within eligible shift windows and room capacities.`;
    } else if (scheduled === 0) {
      humanExplanation = `Zero sessions scheduled tomorrow. Discretionary power budget was fully exhausted by higher-priority or earlier-queued tiers under active constraints.`;
    } else {
      humanExplanation = `Scheduled ${scheduled} of ${requested} requested sessions (${scheduled * 30} min) during pre-shift wake window. The remaining ${requested - scheduled} requested slots were deferred under the ${scenario.budgetKWh.toFixed(2)} kWh power cap to avoid blacking out other subterranean workgroups.`;
    }

    return {
      cohort,
      requested,
      scheduled,
      pct,
      rawWhy,
      humanExplanation,
      inWakeWindow,
    };
  });

  const deepCohorts = scenario.cohorts.filter(c => c.level >= 7 && c.requestedSlots > 0);
  const deepServed = deepCohorts.filter(c => (result.got[c.id] ?? 0) > 0);
  const allDeepServed = deepCohorts.length > 0 && deepServed.length === deepCohorts.length;

  return (
    <section className="unmet-guide-section no-print" aria-label="Crew Inquiry Reference">
      <div className="unmet-header">
        <div className="unmet-title-group">
          <span className="runsheet-eyebrow">FACILITY SHIFT SUPERVISOR REFERENCE</span>
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
        {cohortRows.map(({ cohort, requested, scheduled, pct, rawWhy, humanExplanation, inWakeWindow }) => (
          <div key={cohort.id} className="unmet-card" role="listitem">
            <div className="unmet-card-header">
              <div className="unmet-card-identity">
                <span className="unmet-crew-name">{cohort.name}</span>
                <span className="unmet-crew-meta">
                  Level {cohort.level} · {cohort.populationPeople} crew · Shift: {cohort.shiftLabel}
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
              <p className="unmet-why-text">{humanExplanation}</p>
              <div className="unmet-timing-note">
                {scheduled > 0 ? (
                  <span>
                    Timing: {inWakeWindow} of {scheduled} sessions placed in planned wake window.
                  </span>
                ) : (
                  <span className="unmet-unserved">
                    No sessions scheduled under current power budget.
                  </span>
                )}
                <span className="unmet-diagnostic-toggle" title={rawWhy}>
                  Technical note: {rawWhy.length > 70 ? rawWhy.slice(0, 70) + '...' : rawWhy}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="unmet-equity-footer">
        <div className="equity-badge" aria-hidden="true">EQUITY EVALUATION</div>
        <p className="equity-note">
          {allDeepServed ? (
            <>
              Under the current schedule, all <strong>{deepCohorts.length} deep-level workgroups</strong> (Levels 7–9) received scheduled bright-light sessions. Under the Directorate upper-level priority baseline at this exact power budget, deep-level crews receive zero sessions because all power is reserved for upper administrative sectors.
            </>
          ) : (
            <>
              Under current power constraints ({scenario.budgetKWh.toFixed(2)} kWh), <strong>{deepServed.length} of {deepCohorts.length} deep-level workgroups</strong> received scheduled sessions. The progressive-filling heuristic distributes remaining power to avoid total sector abandonment where capacity allows.
            </>
          )}
        </p>
      </div>
    </section>
  );
};
