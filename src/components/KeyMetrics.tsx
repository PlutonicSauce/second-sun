import React from 'react';
import type { Metrics, Scenario } from '../domain/types';

interface KeyMetricsProps {
  metrics: Metrics;
  scenario: Scenario;
}

export const KeyMetrics: React.FC<KeyMetricsProps> = ({ metrics, scenario }) => {
  const totalRequested = scenario.cohorts.reduce((acc, c) => acc + c.requestedSlots, 0);
  const minCovPct = metrics.minCov !== null ? Math.round(metrics.minCov * 100) : null;
  const avgCovPct = metrics.avgCov !== null ? Math.round(metrics.avgCov * 100) : null;
  const energyPct = Math.round((metrics.kwh / Math.max(scenario.budgetKWh, 0.001)) * 100);

  return (
    <div className="metrics-grid" role="region" aria-label="Key Schedule Metrics">
      {/* Metric 1: Scheduled Sessions */}
      <div className="metric-card">
        <div className="metric-label">Scheduled Sessions</div>
        <div className="metric-value">
          {metrics.sessions}
          <span className="metric-sub"> / {totalRequested} req</span>
        </div>
        <div className="metric-bar-container">
          <div
            className="metric-bar-fill"
            style={{ width: `${Math.min(100, Math.round((metrics.sessions / Math.max(totalRequested, 1)) * 100))}%` }}
          />
        </div>
        <div className="metric-foot">
          {metrics.unmet > 0 ? (
            <span className="text-warning">⚠ {metrics.unmet} sessions unmet</span>
          ) : (
            <span className="text-success">✓ 100% requests met</span>
          )}
        </div>
      </div>

      {/* Metric 2: Minimum Group Coverage */}
      <div className="metric-card">
        <div className="metric-label">Lowest Group Coverage</div>
        <div className="metric-value">
          {minCovPct !== null ? `${minCovPct}%` : 'N/A'}
          <span className="metric-sub"> (avg {avgCovPct !== null ? `${avgCovPct}%` : 'N/A'})</span>
        </div>
        <div className="metric-bar-container">
          <div
            className={`metric-bar-fill ${
              minCovPct !== null && minCovPct >= 75
                ? 'bar-good'
                : minCovPct !== null && minCovPct >= 50
                ? 'bar-warn'
                : 'bar-danger'
            }`}
            style={{ width: `${minCovPct ?? 0}%` }}
          />
        </div>
        <div className="metric-foot">
          <span>Max−min gap: {metrics.gap !== null ? `${Math.round(metrics.gap * 100)}%` : '0%'}</span>
        </div>
      </div>

      {/* Metric 3: Energy Used vs Cap */}
      <div className="metric-card">
        <div className="metric-label">Daily Discretionary Energy</div>
        <div className="metric-value">
          {metrics.kwh.toFixed(2)}
          <span className="metric-sub"> / {scenario.budgetKWh.toFixed(2)} kWh</span>
        </div>
        <div className="metric-bar-container">
          <div
            className="metric-bar-fill bar-energy"
            style={{ width: `${Math.min(100, energyPct)}%` }}
          />
        </div>
        <div className="metric-foot">
          <span>{energyPct}% of budget • Peak: {metrics.peakW}W / {scenario.peakW}W</span>
        </div>
      </div>

      {/* Metric 4: Person-Slots Accommodated */}
      <div className="metric-card">
        <div className="metric-label">Total Person-Sessions</div>
        <div className="metric-value">
          {metrics.personSlots}
          <span className="metric-sub"> person-slots</span>
        </div>
        <div className="metric-foot">
          <span>Accounts for group sizes in rooms</span>
        </div>
      </div>
    </div>
  );
};
