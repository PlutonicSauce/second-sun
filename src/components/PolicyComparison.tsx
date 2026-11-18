import React from 'react';
import type { ScheduleResult, PolicyMode } from '../domain/types';

interface PolicyComparisonProps {
  results: Record<PolicyMode, ScheduleResult>;
  activePolicy: PolicyMode;
  onSelectPolicy: (policy: PolicyMode) => void;
}

export const PolicyComparison: React.FC<PolicyComparisonProps> = ({
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
      subtitle: 'Priority by Cohort Population Descending',
      badge: 'Simulated Policy',
    },
  ];

  const metricsRow = [
    {
      label: 'Minimum Group Coverage',
      desc: 'Core fairness metric: lowest fraction of requested sessions granted to any group',
      render: (m: ScheduleResult['metrics']) =>
        m.minCov !== null ? `${Math.round(m.minCov * 100)}%` : 'N/A',
      highlightFair: true,
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
                  const val = row.render(results[p.id].metrics);
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
          (fictional, not actual government policy) to demonstrate how population-weighting starves smaller vital shift teams
          (like Medical Support) under constrained resources.
        </p>
      </div>
    </div>
  );
};
