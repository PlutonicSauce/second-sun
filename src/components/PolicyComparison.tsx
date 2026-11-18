import React from 'react';
import type { Scenario, ScheduleResult, PolicyMode } from '../domain/types';

interface PolicyComparisonProps {
  scenario: Scenario;
  results: Record<PolicyMode, ScheduleResult>;
  activePolicy: PolicyMode;
  onSelectPolicy: (policy: PolicyMode) => void;
}

export const PolicyComparison: React.FC<PolicyComparisonProps> = ({
  scenario,
  results,
  activePolicy,
  onSelectPolicy,
}) => {
  const policies: { id: PolicyMode; name: string; subtitle: string; badge: string }[] = [
    {
      id: 'fair',
      name: 'SECOND SUN',
      subtitle: 'Greedy Progressive-Filling Max-Min Heuristic',
      badge: 'Fairness-Aware',
    },
    {
      id: 'first-come',
      name: 'First-Come Baseline',
      subtitle: 'Input-Order Greedily Filled to Capacity',
      badge: 'Baseline',
    },
    {
      id: 'directorate',
      name: 'Illustrative Directorate',
      subtitle: 'Upper-Level Favoritism (Level 2–3 Prioritized First)',
      badge: 'Simulated Policy',
    },
  ];

  // Helper to compute worst-served group for a result
  const getWorstServed = (res: ScheduleResult) => {
    let minRatio = Infinity;
    let worstCohort = '';
    let worstLevel = 0;

    for (const c of scenario.cohorts) {
      if (c.requestedSlots <= 0) continue;
      const ratio = (res.got[c.id] ?? 0) / c.requestedSlots;
      if (ratio < minRatio) {
        minRatio = ratio;
        worstCohort = c.name;
        worstLevel = c.level;
      }
    }

    if (minRatio === Infinity) return 'None';
    return `${worstCohort} (L${worstLevel}): ${Math.round(minRatio * 100)}%`;
  };

  // Helper to compute tier coverage
  const getTierCoverage = (res: ScheduleResult, minL: number, maxL: number) => {
    const tierCohorts = scenario.cohorts.filter(c => c.level >= minL && c.level <= maxL && c.requestedSlots > 0);
    if (!tierCohorts.length) return 'N/A';
    const sum = tierCohorts.reduce((acc, c) => acc + (res.got[c.id] ?? 0) / c.requestedSlots, 0);
    return `${Math.round((sum / tierCohorts.length) * 100)}%`;
  };

  const getTierInequalityGap = (res: ScheduleResult) => {
    const upperCohorts = scenario.cohorts.filter(c => c.level <= 4 && c.requestedSlots > 0);
    const deepCohorts = scenario.cohorts.filter(c => c.level >= 7 && c.requestedSlots > 0);
    if (!upperCohorts.length || !deepCohorts.length) return 'N/A';
    const upperAvg = upperCohorts.reduce((acc, c) => acc + (res.got[c.id] ?? 0) / c.requestedSlots, 0) / upperCohorts.length;
    const deepAvg = deepCohorts.reduce((acc, c) => acc + (res.got[c.id] ?? 0) / c.requestedSlots, 0) / deepCohorts.length;
    const gap = upperAvg - deepAvg;
    return `${gap > 0 ? '+' : ''}${Math.round(gap * 100)}%`;
  };

  const metricsRow = [
    {
      label: 'Minimum Group Coverage',
      desc: 'Core fairness metric: lowest fraction of requested sessions granted to any single group',
      render: (_m: ScheduleResult['metrics'], res: ScheduleResult) =>
        res.metrics.minCov !== null ? `${Math.round(res.metrics.minCov * 100)}%` : 'N/A',
      highlightFair: true,
    },
    {
      label: 'Worst-Served Group',
      desc: 'The cohort that suffers the deepest deficit and their subterranean level',
      render: (_m: ScheduleResult['metrics'], res: ScheduleResult) => getWorstServed(res),
    },
    {
      label: 'Upper-Level Coverage (L2–L4)',
      desc: 'Average coverage ratio for upper administrative and medical habitats',
      render: (_m: ScheduleResult['metrics'], res: ScheduleResult) => getTierCoverage(res, 2, 4),
    },
    {
      label: 'Deep-Level Coverage (L7–L9)',
      desc: 'Average coverage ratio for deep infrastructure, utility, and ventilation crews',
      render: (_m: ScheduleResult['metrics'], res: ScheduleResult) => getTierCoverage(res, 7, 9),
    },
    {
      label: 'Level Inequality Gap',
      desc: 'Upper-tier coverage minus Deep-tier coverage (Directorate favoritism metric)',
      render: (_m: ScheduleResult['metrics'], res: ScheduleResult) => getTierInequalityGap(res),
    },
    {
      label: 'Total Sessions Scheduled',
      desc: 'Total 30-minute room bookings placed across all rooms',
      render: (m: ScheduleResult['metrics']) => `${m.sessions} sessions`,
    },
    {
      label: 'Average Group Coverage',
      desc: 'Mean fraction of requested sessions served across all cohorts',
      render: (m: ScheduleResult['metrics']) =>
        m.avgCov !== null ? `${Math.round(m.avgCov * 100)}%` : 'N/A',
    },
    {
      label: 'Max−Min Coverage Gap',
      desc: 'Difference between most-served and least-served group',
      render: (m: ScheduleResult['metrics']) =>
        m.gap !== null ? `${Math.round(m.gap * 100)}%` : 'N/A',
    },
    {
      label: 'Unmet Demand',
      desc: 'Total requested sessions that could not be placed within power or physical limits',
      render: (m: ScheduleResult['metrics']) => `${m.unmet} sessions`,
    },
    {
      label: 'Discretionary Energy Used',
      desc: 'Total kilowatt-hours consumed by scheduled bright-light sessions',
      render: (m: ScheduleResult['metrics']) => `${m.kwh.toFixed(2)} kWh`,
    },
    {
      label: 'Total Person-Sessions',
      desc: 'Sum of (cohort population × sessions) accommodated',
      render: (m: ScheduleResult['metrics']) => `${m.personSlots} person-slots`,
    },
    {
      label: 'Peak Simultaneous Load',
      desc: 'Maximum watts drawn in any single half-hour slot across active rooms',
      render: (m: ScheduleResult['metrics']) => `${m.peakW} W`,
    },
  ];

  return (
    <div className="control-card policy-comparison-section" role="region" aria-label="Policy Comparison">
      <div className="card-header">
        <div>
          <h3 className="card-title">Policy Comparison (Exact Same Constraints)</h3>
          <p className="card-subtitle">
            All three policies face the identical daily energy budget, peak power cap, room capacity, and shift
            windows. All metrics are computed live by the real solver.
          </p>
        </div>
      </div>

      <div className="policy-tabs" role="tablist" aria-label="Select active policy for timeline">
        {policies.map(p => {
          const res = results[p.id];
          const minCov = res.metrics.minCov !== null ? Math.round(res.metrics.minCov * 100) : 0;
          const isActive = activePolicy === p.id;
          return (
            <button
              key={p.id}
              role="tab"
              aria-selected={isActive}
              className={`policy-tab ${isActive ? 'policy-tab-active' : ''}`}
              onClick={() => onSelectPolicy(p.id)}
            >
              <div className="tab-badge-row">
                <span className="badge badge-neutral">{p.badge}</span>
                {isActive && <span className="badge badge-active">Viewing on Timeline</span>}
              </div>
              <div className="tab-title">{p.name}</div>
              <div className="tab-sub">{p.subtitle}</div>
              <div className="tab-stat-row">
                <span>{res.metrics.sessions} sessions</span>
                <span>•</span>
                <span className={minCov >= 50 ? 'text-success' : 'text-danger'}>
                  Min Cov: {minCov}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="table-responsive">
        <table className="comparison-table">
          <thead>
            <tr>
              <th scope="col" className="col-metric">Metric</th>
              {policies.map(p => (
                <th
                  key={p.id}
                  scope="col"
                  className={`col-policy ${activePolicy === p.id ? 'col-policy-active' : ''}`}
                >
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metricsRow.map(row => (
              <tr key={row.label}>
                <th scope="row" className="cell-metric-label">
                  <div className="metric-name">{row.label}</div>
                  <div className="metric-desc">{row.desc}</div>
                </th>
                {policies.map(p => {
                  const val = row.render(results[p.id].metrics, results[p.id]);
                  const isCurrent = activePolicy === p.id;
                  return (
                    <td
                      key={p.id}
                      className={`cell-policy-val ${isCurrent ? 'cell-policy-active' : ''}`}
                    >
                      <strong>{val}</strong>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="policy-disclaimer">
        <p>
          <strong>Scientific & Mathematical Candor:</strong> SECOND SUN uses a <em>greedy progressive-filling heuristic</em>,
          not a mathematically proven global max-min optimum. The Directorate policy is a simulated illustrative priority rule
          (fictional, not actual government policy) to demonstrate how institutional favoritism toward upper administrative tiers
          (Levels 2–4) starves deep subterranean workforces (such as Level 9 air ventilation and utilities) under rationed power.
          All three policies face the exact same physical and power constraints.
        </p>
      </div>
    </div>
  );
};
