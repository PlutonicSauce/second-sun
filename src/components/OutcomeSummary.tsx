import React from 'react';
import type { Scenario, ScheduleResult, PolicyMode, Cohort } from '../domain/types';

interface OutcomeSummaryProps {
  scenario: Scenario;
  result: ScheduleResult;
  activePolicy: PolicyMode;
}

export const OutcomeSummary: React.FC<OutcomeSummaryProps> = ({
  scenario,
  result,
  activePolicy,
}) => {
  // Compute coverage stats per cohort
  const cohortStats = scenario.cohorts.map((c: Cohort) => {
    const got = result.got[c.id] ?? 0;
    const req = c.requestedSlots;
    const pct = req > 0 ? Math.round((got / req) * 100) : 100;
    return { ...c, got, req, pct };
  });

  // Find worst served cohort
  const worstCohort = [...cohortStats].sort((a, b) => a.pct - b.pct)[0] ?? cohortStats[0];

  // Upper vs Deep coverage
  const upperCohorts = cohortStats.filter(c => c.level <= 4);
  const deepCohorts = cohortStats.filter(c => c.level >= 7);

  const upperReq = upperCohorts.reduce((acc, c) => acc + c.req, 0);
  const upperGot = upperCohorts.reduce((acc, c) => acc + c.got, 0);
  const upperCov = upperReq > 0 ? Math.round((upperGot / upperReq) * 100) : 100;

  const deepReq = deepCohorts.reduce((acc, c) => acc + c.req, 0);
  const deepGot = deepCohorts.reduce((acc, c) => acc + c.got, 0);
  const deepCov = deepReq > 0 ? Math.round((deepGot / deepReq) * 100) : 0;

  const levelGap = upperCov - deepCov;
  const formattedGap = levelGap > 0 ? `+${levelGap}%` : `${levelGap}%`;
  const personSlots = result.metrics.personSlots;
  const unmetSessions = result.metrics.unmet;

  const isDirectorate = activePolicy === 'directorate';

  return (
    <div className="outcome-summary-card">
      <div className="outcome-header-row">
        <span className="outcome-eyebrow">HUMAN-CENTERED IMPACT</span>
        <span className="outcome-policy-tag">
          {isDirectorate ? 'Institutional Priority Model' : 'SECOND SUN Fair Share Model'}
        </span>
      </div>

      <p className="outcome-narrative">
        {isDirectorate ? (
          <>
            Under the <strong>Directorate policy</strong>, upper administrative tiers capture{' '}
            <strong className="text-amber">{upperCov}%</strong> of their requested daylight, while deep-level
            crews on Level 7–9 receive <strong className="text-danger">{deepCov}%</strong>. The Level Inequality Gap
            is <strong>{formattedGap}</strong>.
          </>
        ) : (
          <>
            <strong>SECOND SUN</strong> distributes the shortage across all depths: every community from Level 2 to
            Level 9 receives at least <strong className="text-amber">{worstCohort.pct}%</strong> of requested sessions,
            bringing artificial daylight to <strong>{personSlots} residents</strong> without leaving deep levels in darkness.
          </>
        )}
      </p>

      <div className="outcome-metrics-row">
        <div className="outcome-metric-cell">
          <span className="metric-cell-label">Worst-Served Group</span>
          <span className="metric-cell-value">
            <span className={worstCohort.pct === 0 ? 'text-danger' : 'text-amber'}>
              {worstCohort.pct}%
            </span>
            <span className="metric-cell-sub">{worstCohort.name} (L{worstCohort.level})</span>
          </span>
        </div>

        <div className="outcome-metric-cell">
          <span className="metric-cell-label">Level Inequality Gap</span>
          <span className="metric-cell-value">
            <span className={levelGap > 40 ? 'text-danger' : 'text-amber'}>
              {formattedGap}
            </span>
            <span className="metric-cell-sub">Upper (L2–4) vs Deep (L7–9)</span>
          </span>
        </div>

        <div className="outcome-metric-cell">
          <span className="metric-cell-label">People Reached</span>
          <span className="metric-cell-value">
            <span>{personSlots}</span>
            <span className="metric-cell-sub">Person-slots scheduled</span>
          </span>
        </div>

        <div className="outcome-metric-cell">
          <span className="metric-cell-label">Unmet Demand</span>
          <span className="metric-cell-value">
            <span>{unmetSessions}</span>
            <span className="metric-cell-sub">Sessions missed due to power cap</span>
          </span>
        </div>
      </div>
    </div>
  );
};
