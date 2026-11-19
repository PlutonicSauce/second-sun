import React from 'react';
import type { Scenario, ScheduleResult, PolicyMode } from '../domain/types';

interface SubterraneanVisualizerProps {
  scenario: Scenario;
  activeResult: ScheduleResult;
  results: Record<PolicyMode, ScheduleResult>;
  activePolicy: PolicyMode;
  onSelectPolicy: (policy: PolicyMode) => void;
  budgetKWh: number;
  baseBudgetKWh: number;
  onBudgetChange: (kwh: number) => void;
  onSimulateGeneratorFailure: () => void;
  isEmergencySimulated: boolean;
}

export const SubterraneanVisualizer: React.FC<SubterraneanVisualizerProps> = ({
  scenario,
  activeResult,
  results,
  activePolicy,
  onSelectPolicy,
  budgetKWh,
  baseBudgetKWh,
  onBudgetChange,
  onSimulateGeneratorFailure,
  isEmergencySimulated,
}) => {
  const currentPct = baseBudgetKWh > 0 ? Math.round((budgetKWh / baseBudgetKWh) * 100) : 100;

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseInt(e.target.value, 10);
    const newKWh = parseFloat(((pct / 100) * baseBudgetKWh).toFixed(2));
    onBudgetChange(newKWh);
  };

  const setPct = (pct: number) => {
    const newKWh = parseFloat(((pct / 100) * baseBudgetKWh).toFixed(2));
    onBudgetChange(newKWh);
  };

  // Compute tier coverage gap between Upper (L2–L4) and Deep (L7–L9)
  const upperCohorts = scenario.cohorts.filter(c => c.level <= 4 && c.requestedSlots > 0);
  const deepCohorts = scenario.cohorts.filter(c => c.level >= 7 && c.requestedSlots > 0);
  
  const upperAvg = upperCohorts.length > 0
    ? upperCohorts.reduce((acc, c) => acc + (activeResult.got[c.id] ?? 0) / c.requestedSlots, 0) / upperCohorts.length
    : 0;
  const deepAvg = deepCohorts.length > 0
    ? deepCohorts.reduce((acc, c) => acc + (activeResult.got[c.id] ?? 0) / c.requestedSlots, 0) / deepCohorts.length
    : 0;
  const tierGap = Math.round((upperAvg - deepAvg) * 100);

  // Depth meter estimates for visual storytelling in the Hollow
  const getDepthEstimate = (level: number) => {
    switch (level) {
      case 2: return '−180m';
      case 3: return '−350m';
      case 4: return '−520m';
      case 5: return '−710m';
      case 7: return '−1,120m';
      case 9: return '−1,480m';
      default: return `−${level * 150}m`;
    }
  };

  // Sort cohorts top-to-bottom by subterranean level (Level 2 down to Level 9)
  const sortedCohorts = [...scenario.cohorts].sort((a, b) => a.level - b.level);

  return (
    <section className="subterranean-visualizer-section no-print" aria-label="Subterranean Daylight Allocation Studio">
      {/* Visualizer Header: Interactive Policy & Power Studio */}
      <div className="visualizer-header">
        <div className="visualizer-title-group">
          <div className="visualizer-badge-row">
            <span className="visualizer-dot" />
            <span className="visualizer-kicker">HOLLOW SUBTERRANEAN GRID · REAL-TIME ALLOCATION STUDIO</span>
          </div>
          <h2 className="visualizer-title">Compare Institutional Policies Under Rationing</h2>
          <p className="visualizer-subtitle">
            See how available electricity distributes across subterranean tiers. Switch policies or drag the power slider to observe which communities receive daylight or face total darkness.
          </p>
        </div>

        {/* Policy Switcher Segmented Control */}
        <div className="policy-segmented-control" role="tablist" aria-label="Allocation Policy">
          <button
            type="button"
            role="tab"
            aria-selected={activePolicy === 'fair'}
            className={`btn-policy-segment ${activePolicy === 'fair' ? 'segment-active' : ''}`}
            onClick={() => onSelectPolicy('fair')}
          >
            <span className="segment-indicator" />
            <span className="segment-text">
              <strong>SECOND SUN</strong>
              <small>
                {results.fair.metrics.sessions} sessions · {Math.round((results.fair.metrics.minCov ?? 0) * 100)}% min cov
              </small>
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activePolicy === 'directorate'}
            className={`btn-policy-segment ${activePolicy === 'directorate' ? 'segment-active segment-directorate' : ''}`}
            onClick={() => onSelectPolicy('directorate')}
          >
            <span className="segment-indicator indicator-directorate" />
            <span className="segment-text">
              <strong>Directorate Baseline</strong>
              <small>
                {results.directorate.metrics.sessions} sessions · {Math.round((results.directorate.metrics.minCov ?? 0) * 100)}% min cov
              </small>
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activePolicy === 'first-come'}
            className={`btn-policy-segment ${activePolicy === 'first-come' ? 'segment-active segment-first-come' : ''}`}
            onClick={() => onSelectPolicy('first-come')}
          >
            <span className="segment-indicator indicator-first-come" />
            <span className="segment-text">
              <strong>First-Come Baseline</strong>
              <small>
                {results['first-come'].metrics.sessions} sessions · {Math.round((results['first-come'].metrics.minCov ?? 0) * 100)}% min cov
              </small>
            </span>
          </button>
        </div>
      </div>

      {/* Energy Slider & Incident Presets Strip */}
      <div className="visualizer-power-bar">
        <div className="power-bar-left">
          <div className="power-readout-compact">
            <span className="power-pct-label">{currentPct}% Power</span>
            <span className="power-val-label">{budgetKWh.toFixed(2)} kWh of {baseBudgetKWh.toFixed(2)} kWh</span>
          </div>

          <div className="power-slider-container">
            <input
              type="range"
              min={15}
              max={100}
              step={5}
              value={currentPct}
              onChange={handleSlider}
              aria-label="Available Lighting Power Percentage"
              className="apple-range-input"
            />
          </div>
        </div>

        <div className="power-bar-right">
          <div className="preset-buttons-row">
            <button
              type="button"
              className={`btn-apple-preset ${currentPct === 100 ? 'preset-active' : ''}`}
              onClick={() => setPct(100)}
            >
              100% Normal
            </button>
            <button
              type="button"
              className={`btn-apple-preset ${currentPct === 60 ? 'preset-active' : ''}`}
              onClick={() => setPct(60)}
            >
              60% Shortage
            </button>
            <button
              type="button"
              className={`btn-apple-preset ${currentPct === 25 ? 'preset-active' : ''}`}
              onClick={() => setPct(25)}
            >
              25% Emergency
            </button>
          </div>

          <button
            type="button"
            className={`btn-apple-emergency-trigger ${isEmergencySimulated ? 'btn-emergency-active' : ''}`}
            onClick={onSimulateGeneratorFailure}
            title="Simulate sudden geothermal generator trip to test emergency schedule"
          >
            ⚡ Simulate Generator Failure
          </button>
        </div>
      </div>

      {/* The Subterranean Cross-Section (Vertical Tier Visualization) */}
      <div className="cross-section-container">
        <div className="cross-section-header">
          <span className="col-level">Subterranean Level</span>
          <span className="col-crew">Resident Workgroup</span>
          <span className="col-shift">Shift & Wake Window</span>
          <span className="col-bar">Daylight Allocation (30m Slots)</span>
          <span className="col-status">Operational Outcome</span>
        </div>

        <div className="cross-section-tiers">
          {sortedCohorts.map(cohort => {
            const requested = cohort.requestedSlots;
            const scheduled = activeResult.got[cohort.id] ?? 0;
            const pct = requested > 0 ? Math.round((scheduled / requested) * 100) : 100;
            const isZero = scheduled === 0;
            const depth = getDepthEstimate(cohort.level);
            const isDeepTier = cohort.level >= 7;

            // Preferred wake window count
            const assignedSlots = activeResult.assignments
              .filter(a => a.cohortId === cohort.id)
              .map(a => a.slotIndex);
            const inWakeWindow = assignedSlots.filter(s => cohort.preferredSlots.includes(s)).length;

            return (
              <div
                key={cohort.id}
                className={`tier-row ${isZero ? 'tier-blackout' : 'tier-illuminated'} ${
                  isDeepTier ? 'tier-deep' : 'tier-upper'
                }`}
              >
                {/* Level & Depth indicator */}
                <div className="tier-col-level">
                  <div className="level-badge">Level {cohort.level}</div>
                  <span className="depth-subtext">{depth} depth</span>
                </div>

                {/* Resident Workgroup */}
                <div className="tier-col-crew">
                  <span className="tier-crew-name">{cohort.name}</span>
                  <span className="tier-crew-pop">{cohort.populationPeople} crew members</span>
                </div>

                {/* Shift & Wake Window */}
                <div className="tier-col-shift">
                  <span className="tier-shift-label">{cohort.shiftLabel} Shift</span>
                  <span className="tier-wake-label">Wake window: {cohort.preferredSlots.length * 30} min</span>
                </div>

                {/* Visual Daylight Allocation Meter */}
                <div className="tier-col-bar">
                  <div className="light-meter-track" aria-hidden="true">
                    <div
                      className={`light-meter-fill ${isZero ? 'fill-zero' : 'fill-sun'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="light-meter-stats">
                    <span className="slots-count">
                      <strong>{scheduled}</strong> of {requested} sessions ({scheduled * 30} min)
                    </span>
                    <span className="coverage-pct">{pct}% coverage</span>
                  </div>
                </div>

                {/* Operational Outcome Note */}
                <div className="tier-col-status">
                  {isZero ? (
                    <div className="status-blackout">
                      <span className="badge-darkness">0 MIN · TOTAL DARKNESS</span>
                      <p className="status-note">
                        {activePolicy === 'directorate'
                          ? 'Deprioritized under upper-tier Directorate rules'
                          : 'Budget exhausted before reaching this queue slot'}
                      </p>
                    </div>
                  ) : (
                    <div className="status-served">
                      <span className="badge-illuminated">
                        {inWakeWindow > 0 ? '✓ WAKE-WINDOW TIMED' : 'OFF-PEAK ALLOCATED'}
                      </span>
                      <p className="status-note">
                        {scheduled} session{scheduled > 1 ? 's' : ''} placed in bright room ({scheduled * 30}m total exposure)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Equity Summary Callout */}
        <div className="cross-section-footer">
          <div className="equity-telemetry-item">
            <span className="equity-label">Upper vs. Deep Level Gap</span>
            <span className={`equity-value ${tierGap > 50 ? 'text-danger' : tierGap > 0 ? 'text-amber' : 'text-success'}`}>
              {tierGap > 0 ? `+${tierGap}%` : `${tierGap}%`}
            </span>
            <span className="equity-desc">
              {tierGap > 50
                ? 'Severe inequality: Upper administrative levels monopolize scarce lighting'
                : 'Balanced: Power distributed across both upper and deep tiers'}
            </span>
          </div>

          <div className="equity-divider" aria-hidden="true" />

          <div className="equity-telemetry-item">
            <span className="equity-label">Lowest-Served Group Coverage</span>
            <span className="equity-value">
              {activeResult.metrics.minCov !== null ? `${Math.round(activeResult.metrics.minCov * 100)}%` : '0%'}
            </span>
            <span className="equity-desc">
              {activeResult.metrics.minCov === 0
                ? 'Complete sector blackout detected in at least one workgroup'
                : 'All requesting workgroups received at least some daylight'}
            </span>
          </div>

          <div className="equity-divider" aria-hidden="true" />

          <div className="equity-telemetry-item">
            <span className="equity-label">Active Policy Reality</span>
            <span className="equity-value policy-title-highlight">
              {activePolicy === 'fair' ? 'SECOND SUN Fairness' : activePolicy === 'directorate' ? 'Directorate Favoritism' : 'First-Come Queue'}
            </span>
            <span className="equity-desc">
              {activePolicy === 'fair'
                ? 'Equalizes minimum group coverage across shifts and subterranean levels'
                : activePolicy === 'directorate'
                ? 'Reserves power for upper administrators; deep ventilation crews receive 0%'
                : 'Fills requests in entry order; late or lower shifts risk total blackout'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
