import type { ScheduleResult, PolicyMode } from '../domain/types';
import { policies } from '../domain/policies';

interface PolicyComparisonProps {
  results: Record<PolicyMode, ScheduleResult>;
  activePolicy: PolicyMode;
  onSelectPolicy: (policy: PolicyMode) => void;
}

const order = ['fair', 'directorate', 'first-come'] as const;

export function PolicyComparison({ results, activePolicy, onSelectPolicy }: PolicyComparisonProps) {
  return (
    <div className="policy-tabs" role="group" aria-label="Select allocation policy">
      {order.map(policy => {
        const { sessions, minCov, unmet, kwh, peakW } = results[policy].metrics;
        const selected = activePolicy === policy;
        return (
          <button
            key={policy}
            type="button"
            className={`policy-tab ${selected ? 'policy-tab-active' : ''}`}
            aria-pressed={selected}
            onClick={() => onSelectPolicy(policy)}
          >
            <span className="tab-title">{policies[policy].name}</span>
            <span className="tab-sub">{policies[policy].rule}</span>
            <span>{sessions} booked · {unmet} unmet</span>
            <span>Least-served group: {minCov === null ? '—' : `${Math.round(minCov * 100)}%`}</span>
            <span>{kwh.toFixed(2)} kWh used · {peakW} W peak</span>
          </button>
        );
      })}
    </div>
  );
}
