import { describe, it, expect } from 'vitest';
import { hollow } from '../domain/presets';
import { solve } from '../domain/engine';
import { preferredCoverage, compareResults } from '../domain/metrics';

describe('metrics domain tests', () => {
  it('computes preferredCoverage accurately', () => {
    const sc = hollow();
    sc.budgetKWh = 2.28;
    const res = solve(sc, 'fair');
    const prefCov = preferredCoverage(sc, res);

    // Each cohort should have a number between 0 and 1
    for (const c of sc.cohorts) {
      expect(prefCov[c.id]).toBeGreaterThanOrEqual(0);
      expect(prefCov[c.id]).toBeLessThanOrEqual(1);
    }
  });

  it('compares two schedule results side-by-side', () => {
    const sc = hollow();
    sc.budgetKWh = 2.28;
    const fairRes = solve(sc, 'fair');
    const firstRes = solve(sc, 'first-come');

    const summary = compareResults(fairRes, firstRes, ['SECOND SUN', 'First-Come']);
    expect(summary.labels).toEqual(['SECOND SUN', 'First-Come']);
    expect(summary.a.sessions).toBe(9);
    expect(summary.b.sessions).toBe(7);
    expect(summary.a.minCov).toBe(0.5);
    expect(summary.b.minCov).toBe(0.0);
  });
});
