// SECOND SUN — planning metrics
// NOTE: "Preferred slots" are user-editable planning assumptions, NOT clinical recommendations.
// Coverage percentages here do NOT imply health or circadian outcomes.

import type { Scenario, ScheduleResult } from './types';

/**
 * For each cohort, compute what fraction of their assigned sessions fall within
 * their user-defined preferredSlots window.
 *
 * Returns a value in [0, 1] per cohort (or 1.0 for cohorts with no assignments,
 * since there is nothing to report as outside-preferred).
 *
 * This is a planning metric ONLY — not a measure of biological effect.
 */
export function preferredCoverage(
  scenario: Scenario,
  result: ScheduleResult,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const cohort of scenario.cohorts) {
    const cohortAssignments = result.assignments.filter(a => a.cohortId === cohort.id);
    if (cohortAssignments.length === 0) {
      out[cohort.id] = 0;
      continue;
    }
    const preferredSet = new Set(cohort.preferredSlots);
    const inPreferred = cohortAssignments.filter(a => preferredSet.has(a.slotIndex)).length;
    out[cohort.id] = inPreferred / cohortAssignments.length;
  }
  return out;
}

export interface ComparisonSummary {
  labels: [string, string];
  a: {
    sessions: number;
    minCov: number | null;
    avgCov: number | null;
    kwh: number;
    unmet: number;
  };
  b: {
    sessions: number;
    minCov: number | null;
    avgCov: number | null;
    kwh: number;
    unmet: number;
  };
}

/**
 * Produce a side-by-side summary comparing two ScheduleResult objects.
 * Useful for rendering policy comparison tables.
 */
export function compareResults(
  a: ScheduleResult,
  b: ScheduleResult,
  labels: [string, string],
): ComparisonSummary {
  return {
    labels,
    a: {
      sessions: a.metrics.sessions,
      minCov: a.metrics.minCov,
      avgCov: a.metrics.avgCov,
      kwh: a.metrics.kwh,
      unmet: a.metrics.unmet,
    },
    b: {
      sessions: b.metrics.sessions,
      minCov: b.metrics.minCov,
      avgCov: b.metrics.avgCov,
      kwh: b.metrics.kwh,
      unmet: b.metrics.unmet,
    },
  };
}
