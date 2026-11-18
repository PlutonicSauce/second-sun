import React from 'react';
import type { Scenario, ScheduleResult } from '../domain/types';

interface CrisisBannerProps {
  scenario: Scenario;
  result: ScheduleResult;
}

export const CrisisBanner: React.FC<CrisisBannerProps> = ({ scenario, result }) => {
  const isShortage = result.metrics.unmet > 0;
  const pctBudget = Math.round((scenario.budgetKWh / 3.8) * 100);

  return (
    <section className="crisis-banner" aria-label="Current power situation summary">
      <div className="crisis-indicator" aria-hidden="true">
        <span className={`pulse-dot ${isShortage ? 'pulse-alert' : 'pulse-ok'}`} />
      </div>
      <div className="crisis-content">
        <div className="crisis-title-row">
          <h2 className="crisis-title">
            {isShortage
              ? `Operational Power Deficit on Level 9 (${pctBudget}% of Baseline Budget)`
              : 'Discretionary Lighting Grid at Full Capacity'}
          </h2>
          <span className="crisis-tag">
            {isShortage ? `${result.metrics.unmet} Sessions Unmet` : 'All Feasible Sessions Served'}
          </span>
        </div>
        <p className="crisis-description">
          <strong>The Situation:</strong> A geothermal generator fault has cut discretionary bright-light
          power on Level 9 to <strong>{scenario.budgetKWh.toFixed(2)} kWh</strong> (peak cap:{' '}
          <strong>{scenario.peakW} W</strong>). 140 residents across four conflicting shifts (Morning
          maintenance, Night ventilation, Hydroponics, and Medical support) are competing for 3 shared
          rooms.
        </p>
        <p className="crisis-resolution">
          <strong>What SECOND SUN did:</strong> Enforced hard physical and power limits to guarantee at least{' '}
          <strong>{result.metrics.minCov !== null ? Math.round(result.metrics.minCov * 100) : 0}%</strong>{' '}
          access coverage for every requesting cohort (<strong>{result.metrics.sessions}</strong> total
          sessions scheduled), preventing any single shift from monopolizing artificial daylight while others
          are starved.
        </p>
      </div>
    </section>
  );
};
