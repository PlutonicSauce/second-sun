import { useMemo } from 'react';
import type { Scenario, ScheduleResult, PolicyMode } from '../domain/types';
import { solve, validate } from '../domain/engine';
import { preferredCoverage } from '../domain/metrics';

export interface SchedulerOutputs {
  results: Record<PolicyMode, ScheduleResult>;
  validationErrors: Record<PolicyMode, string[]>;
  preferredCov: Record<PolicyMode, Record<string, number>>;
  activeResult: ScheduleResult;
}

export function useScheduler(
  scenario: Scenario,
  activePolicy: PolicyMode = 'fair',
): SchedulerOutputs {
  return useMemo(() => {
    const fair = solve(scenario, 'fair');
    const firstCome = solve(scenario, 'first-come');
    const directorate = solve(scenario, 'directorate');

    const results: Record<PolicyMode, ScheduleResult> = {
      fair,
      'first-come': firstCome,
      directorate,
    };

    const validationErrors: Record<PolicyMode, string[]> = {
      fair: validate(scenario, fair),
      'first-come': validate(scenario, firstCome),
      directorate: validate(scenario, directorate),
    };

    const preferredCov: Record<PolicyMode, Record<string, number>> = {
      fair: preferredCoverage(scenario, fair),
      'first-come': preferredCoverage(scenario, firstCome),
      directorate: preferredCoverage(scenario, directorate),
    };

    return {
      results,
      validationErrors,
      preferredCov,
      activeResult: results[activePolicy],
    };
  }, [scenario, activePolicy]);
}
