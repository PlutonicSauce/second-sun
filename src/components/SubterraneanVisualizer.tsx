import type { ReactNode } from 'react';
import type { Scenario, ScheduleResult, PolicyMode } from '../domain/types';
import { fmtT, SLOTS } from '../domain/engine';
import { policies } from '../domain/policies';

interface SubterraneanVisualizerProps {
  scenario: Scenario;
  activeResult: ScheduleResult;
  results: Record<PolicyMode, ScheduleResult>;
  activePolicy: PolicyMode;
  onSelectPolicy: (policy: PolicyMode) => void;
  normalBudgetKWh: number;
  baseBudgetKWh: number;
  onBudgetChange: (kwh: number) => void;
  onSimulateGeneratorFailure: () => void;
  onRestoreGenerator: () => void;
  onShowEmergencyDetails: () => void;
  isEmergencySimulated: boolean;
  emergencyDetails: ReactNode;
}

function describeWindows(slots: number[]): string {
  const selected = new Set(slots);
  if (selected.size === SLOTS) return 'All day';
  const windows: string[] = [];
  for (let start = 0; start < SLOTS; start++) {
    if (!selected.has(start) || selected.has((start + SLOTS - 1) % SLOTS)) continue;
    let end = start + 1;
    while (selected.has(end % SLOTS)) end++;
    windows.push(`${fmtT(start)}–${fmtT(end === SLOTS ? SLOTS : end % SLOTS)}`);
  }
  return windows.join(', ') || 'None set';
}

const policyOrder = ['fair', 'directorate', 'first-come'] as const;

export function SubterraneanVisualizer({
  scenario,
  activeResult,
  results,
  activePolicy,
  onSelectPolicy,
  normalBudgetKWh,
  baseBudgetKWh,
  onBudgetChange,
  onSimulateGeneratorFailure,
  onRestoreGenerator,
  onShowEmergencyDetails,
  isEmergencySimulated,
  emergencyDetails,
}: SubterraneanVisualizerProps) {
  const normalPct = Math.round(normalBudgetKWh / baseBudgetKWh * 100);
  const availablePct = Math.round(scenario.budgetKWh / baseBudgetKWh * 100);
  const setPct = (pct: number) => onBudgetChange(Number((pct / 100 * baseBudgetKWh).toFixed(2)));
  const sortedCohorts = [...scenario.cohorts].sort((a, b) => a.level - b.level);

  return (
    <section className="subterranean-visualizer-section no-print" id="allocation" aria-labelledby="allocation-title">
      <div className="visualizer-header">
        <div className="visualizer-title-group">
          <h2 className="visualizer-title" id="allocation-title">Who gets time in the light rooms?</h2>
          <p className="visualizer-subtitle">Compare three ways to share the same lighting budget, rooms and shift windows.</p>
        </div>

        <div className="policy-segmented-control" role="group" aria-label="Allocation policy">
          {policyOrder.map(policy => {
            const selected = activePolicy === policy;
            const { sessions, minCov } = results[policy].metrics;
            return (
              <button
                key={policy}
                type="button"
                aria-pressed={selected}
                className={`btn-policy-segment ${selected ? 'segment-active' : ''}`}
                onClick={() => onSelectPolicy(policy)}
              >
                <span className="segment-text">
                  <strong>{policies[policy].name}</strong>
                  <small>{sessions} sessions · {minCov === null ? '—' : `${Math.round(minCov * 100)}%`} for the least-served group</small>
                </span>
              </button>
            );
          })}
        </div>
        <p className="selected-policy-note"><strong>{policies[activePolicy].name}.</strong> {policies[activePolicy].rule}</p>
      </div>

      <div className="visualizer-power-bar">
        <div className="power-bar-left">
          <div className="power-readout-compact">
            <label className="power-pct-label" htmlFor="lighting-budget">
              {isEmergencySimulated ? 'Baseline budget' : 'Lighting budget'} · {normalPct}%
            </label>
            <span className="power-val-label">{normalBudgetKWh.toFixed(2)} kWh</span>
          </div>
          <div className="power-slider-container">
            <input
              id="lighting-budget"
              type="range"
              min={0}
              max={100}
              step={5}
              value={normalPct}
              aria-valuetext={`${normalPct}% of the usual lighting budget`}
              onChange={e => setPct(Number(e.target.value))}
              className="apple-range-input"
            />
          </div>
        </div>

        <div className="power-bar-right">
          <div className="preset-buttons-row">
            {[100, 60, 25].map(pct => (
              <button
                key={pct}
                type="button"
                aria-pressed={normalPct === pct}
                className={`btn-apple-preset ${normalPct === pct ? 'preset-active' : ''}`}
                onClick={() => setPct(pct)}
              >{pct}%</button>
            ))}
          </div>
          {isEmergencySimulated ? (
            <button type="button" className="btn-emergency-restore" onClick={onRestoreGenerator}>
              End failure simulation
            </button>
          ) : (
            <button type="button" className="btn-apple-emergency-trigger" onClick={onSimulateGeneratorFailure}>
              Simulate generator failure
            </button>
          )}
        </div>
      </div>

      {isEmergencySimulated && (
        <p className="selected-policy-note" role="status">
          Generator failure active · {availablePct}% available.
          {!emergencyDetails && <> <button className="btn-header-ghost" onClick={onShowEmergencyDetails}>Show changes</button></>}
        </p>
      )}
      {emergencyDetails}

      <div className="cross-section-container">
        <div className="cross-section-header" aria-hidden="true">
          <span>Level & crew</span>
          <span>Shift & planning window</span>
          <span>Half-hour sessions booked</span>
        </div>
        <div className="cross-section-tiers">
          {sortedCohorts.map(cohort => {
            const requested = cohort.requestedSlots;
            const scheduled = activeResult.got[cohort.id] ?? 0;
            const inPreferred = activeResult.assignments.filter(a =>
              a.cohortId === cohort.id && cohort.preferredSlots.includes(a.slotIndex)
            ).length;
            const noAccess = requested > 0 && scheduled === 0;

            return (
              <div key={cohort.id} className={`tier-row ${noAccess ? 'tier-blackout' : ''}`}>
                <div className="tier-col-crew">
                  <span className="tier-crew-name">Level {cohort.level} · {cohort.name}</span>
                  <span className="tier-crew-pop">{cohort.populationPeople} residents</span>
                </div>
                <div className="tier-col-shift">
                  <span className="tier-shift-label">Shift {cohort.shiftLabel}</span>
                  <span className="tier-wake-label">Preferred {describeWindows(cohort.preferredSlots)}</span>
                  {cohort.quietSlots.length > 0 && (
                    <span className="tier-wake-label">Quiet {describeWindows(cohort.quietSlots)}</span>
                  )}
                </div>
                <div className="tier-col-bar">
                  <div className="light-meter-track" aria-hidden="true">
                    <div className="light-meter-fill fill-sun" style={{ width: `${requested ? scheduled / requested * 100 : 0}%` }} />
                  </div>
                  <div className="light-meter-stats">
                    <span className="slots-count">
                      {requested > 0 ? <><strong>{scheduled}</strong> of {requested} booked</> : 'No requests'}
                    </span>
                    <span className={noAccess ? 'text-danger' : 'coverage-pct'}>
                      {noAccess ? 'No room time' : scheduled > 0 ? `${inPreferred} in preferred window` : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="allocation-footer">
        <span>Shift, preferred and quiet times are planning assumptions.</span>
        <a href="#run-sheet" className="btn-apple-primary">View run sheet ↓</a>
      </div>
    </section>
  );
}
