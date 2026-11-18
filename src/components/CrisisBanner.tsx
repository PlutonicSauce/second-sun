import React from 'react';
import type { Scenario, ScheduleResult } from '../domain/types';

interface CrisisBannerProps {
  scenario: Scenario;
  result: ScheduleResult;
}

export const CrisisBanner: React.FC<CrisisBannerProps> = ({ scenario, result }) => {
  const isShortage = result.metrics.unmet > 0;
  const pctBudget = Math.round((scenario.budgetKWh / (scenario.id === 'multilevel' ? 3.2 : 3.8)) * 100);

  return (
    <section className="crisis-banner" aria-label="Current power situation summary">
      <div className="crisis-indicator" aria-hidden="true">
        <span className={`pulse-dot ${isShortage ? 'pulse-alert' : 'pulse-ok'}`} />
      </div>
      <div className="crisis-content">
        <div className="crisis-title-row">
          <h2 className="crisis-title">
            {isShortage
              ? `Subterranean Power Crisis — Rationed Discretionary Light (${pctBudget}% Grid Capacity)`
              : 'Discretionary Lighting Grid at Normal Baseline Capacity'}
          </h2>
          <span className="crisis-tag">
            {isShortage ? `${result.metrics.unmet} Sessions Unmet Demand` : 'All Feasible Requests Served'}
          </span>
        </div>
        <p className="crisis-description">
          <strong>Life Underground Dilemma:</strong> Hundreds of meters beneath the surface, residents have{' '}
          <strong>zero natural sunlight</strong> and live on conflicting work/rest schedules (overnight shaft scrubbers,
          day utility crews, split-shift medical staff). Access to shared bright-light rooms is vital for circadian entrainment,
          alertness, and psychological stability, but discretionary power is rationed to{' '}
          <strong>{scenario.budgetKWh.toFixed(2)} kWh</strong> (peak: <strong>{scenario.peakW} W</strong>).
        </p>
        <p className="crisis-resolution">
          <strong>The Allocation Policy Conflict:</strong> Traditional Directorate policy systematically favors upper
          administrative tiers (Level 2/3), starving deep mechanical crews (Level 9). First-come allows early bookers
          to monopolize daylight hours. <strong>SECOND SUN</strong> uses a progressive max-min fairness heuristic
          to guarantee every eligible cohort at least{' '}
          <strong>{result.metrics.minCov !== null ? Math.round(result.metrics.minCov * 100) : 0}%</strong> of their
          needed sessions (<strong>{result.metrics.sessions}</strong> total scheduled), ensuring deep subterranean
          workers are never left in perpetual darkness.
        </p>
      </div>
    </section>
  );
};
