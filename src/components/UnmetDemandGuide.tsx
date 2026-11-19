import type { Scenario, ScheduleResult } from '../domain/types';

interface UnmetDemandGuideProps {
  scenario: Scenario;
  result: ScheduleResult;
}

export function UnmetDemandGuide({ scenario, result }: UnmetDemandGuideProps) {
  const unmet = scenario.cohorts.filter(cohort => result.got[cohort.id] < cohort.requestedSlots);

  if (unmet.length === 0) return null;

  return (
    <details className="unmet-guide-section no-print">
      <summary>Why requests went unfilled ({result.metrics.unmet} sessions)</summary>
      <p className="unmet-subline">These are the placement limits the scheduler found for each crew.</p>
      <ul className="unmet-reasons">
        {unmet.map(cohort => (
          <li key={cohort.id}>
            <strong>{cohort.name}</strong>
            <p>{result.why[cohort.id]}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}
