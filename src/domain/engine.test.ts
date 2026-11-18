// SECOND SUN — Vitest test suite for the TypeScript domain engine
// Tests mirror the reference smoke tests (engine-smoke.test.cjs) and add
// comprehensive constraint-verification, edge-case, and regression tests.

import { describe, it, expect } from 'vitest';
import { rng, kwhToWm, solve, validate, fmtT, wm, SLOTS } from './engine';
import { hollow, rationing, toy } from './presets';

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

describe('kwhToWm', () => {
  it('converts 0.4 kWh to 24000 watt-minutes', () => {
    expect(kwhToWm(0.4)).toBe(24000);
  });
});

describe('rng', () => {
  it('generates an overnight-wrapping slot range [46,47,0,1]', () => {
    expect(rng(46, 2)).toEqual([46, 47, 0, 1]);
  });

  it('returns empty array when a === b', () => {
    expect(rng(10, 10)).toEqual([]);
    expect(rng(0, 0)).toEqual([]);
  });

  it('generates a simple daytime range', () => {
    expect(rng(10, 14)).toEqual([10, 11, 12, 13]);
  });
});

describe('fmtT', () => {
  it('formats slot 0 as 00:00', () => expect(fmtT(0)).toBe('00:00'));
  it('formats slot 1 as 00:30', () => expect(fmtT(1)).toBe('00:30'));
  it('formats slot 10 as 05:00', () => expect(fmtT(10)).toBe('05:00'));
  it('formats slot 47 as 23:30', () => expect(fmtT(47)).toBe('23:30'));
});

describe('wm', () => {
  it('converts watts to watt-minutes for a half-hour slot', () => {
    expect(wm(600)).toBe(18000);
    expect(wm(400)).toBe(12000);
  });
});

// ---------------------------------------------------------------------------
// Toy scenario
// ---------------------------------------------------------------------------

describe('toy scenario', () => {
  it('fair gives minCov=0.5 (one slot each), validate returns []', () => {
    const scenario = toy();
    const fair = solve(scenario, 'fair');
    expect(fair.metrics.minCov).toBe(0.5);
    expect(validate(scenario, fair)).toEqual([]);
  });

  it('first-come gives minCov=0 (A gets 2, B gets 0 or vice versa), validate returns []', () => {
    // With identical slots and only one room, first-come fills all slots for A,
    // leaving no room for B → one cohort has 0 coverage.
    const scenario = toy();
    const first = solve(scenario, 'first-come');
    expect(first.metrics.minCov).toBe(0);
    expect(validate(scenario, first)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Hollow full budget (3.8 kWh)
// ---------------------------------------------------------------------------

describe('Hollow full budget (3.8 kWh)', () => {
  it('fair: 15 sessions, kwh≈3.8, validate=[]', () => {
    const scenario = hollow();
    const fair = solve(scenario, 'fair');
    expect(fair.metrics.sessions).toBe(15);
    expect(fair.metrics.kwh).toBeCloseTo(3.8, 5);
    expect(validate(scenario, fair)).toEqual([]);
  });

  it('first-come: 13 sessions, validate=[]', () => {
    const scenario = hollow();
    const first = solve(scenario, 'first-come');
    expect(first.metrics.sessions).toBe(13);
    expect(validate(scenario, first)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Hollow 60% budget (2.28 kWh)
// ---------------------------------------------------------------------------

describe('Hollow 60% budget (2.28 kWh)', () => {
  it('fair: 9 sessions, minCov=0.5, validate=[]', () => {
    const scenario = hollow();
    scenario.budgetKWh = 2.28;
    const fair = solve(scenario, 'fair');
    expect(fair.metrics.sessions).toBe(9);
    expect(fair.metrics.minCov).toBe(0.5);
    expect(validate(scenario, fair)).toEqual([]);
  });

  it('first-come: 7 sessions, validate=[]', () => {
    const scenario = hollow();
    scenario.budgetKWh = 2.28;
    const first = solve(scenario, 'first-come');
    expect(first.metrics.sessions).toBe(7);
    expect(validate(scenario, first)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('zero budget', () => {
  it('yields 0 assignments and validate=[]', () => {
    const scenario = hollow();
    scenario.budgetKWh = 0;
    const result = solve(scenario, 'fair');
    expect(result.assignments.length).toBe(0);
    expect(validate(scenario, result)).toEqual([]);
  });
});

describe('disabled room', () => {
  it('no R1 assignments when R1 disabled, validate=[]', () => {
    const scenario = hollow();
    const r1 = scenario.rooms.find(r => r.id === 'R1');
    if (!r1) throw new Error('R1 not found');
    r1.enabled = false;
    const result = solve(scenario, 'fair');
    expect(result.assignments.every(a => a.roomId !== 'R1')).toBe(true);
    expect(validate(scenario, result)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Hard-constraint verification across all three modes
// ---------------------------------------------------------------------------

describe('hard constraints — no quiet-time violations', () => {
  it('fair mode: no assignment in cohort quiet slots', () => {
    const scenario = hollow();
    const result = solve(scenario, 'fair');
    for (const a of result.assignments) {
      const cohort = scenario.cohorts.find(c => c.id === a.cohortId)!;
      expect(cohort.quietSlots).not.toContain(a.slotIndex);
    }
  });

  it('first-come mode: no assignment in cohort quiet slots', () => {
    const scenario = hollow();
    const result = solve(scenario, 'first-come');
    for (const a of result.assignments) {
      const cohort = scenario.cohorts.find(c => c.id === a.cohortId)!;
      expect(cohort.quietSlots).not.toContain(a.slotIndex);
    }
  });

  it('directorate mode: no assignment in cohort quiet slots', () => {
    const scenario = hollow();
    const result = solve(scenario, 'directorate');
    for (const a of result.assignments) {
      const cohort = scenario.cohorts.find(c => c.id === a.cohortId)!;
      expect(cohort.quietSlots).not.toContain(a.slotIndex);
    }
  });
});

describe('hard constraints — no room double-booking', () => {
  const modes = ['fair', 'first-come', 'directorate'] as const;
  for (const mode of modes) {
    it(`${mode} mode: no room+slot booked twice`, () => {
      const scenario = hollow();
      const result = solve(scenario, mode);
      const seen = new Set<string>();
      for (const a of result.assignments) {
        const key = `${a.roomId}|${a.slotIndex}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      }
    });
  }
});

describe('hard constraints — peak watts never exceeded', () => {
  const modes = ['fair', 'first-come', 'directorate'] as const;
  for (const mode of modes) {
    it(`${mode} mode: peak cap respected`, () => {
      const scenario = hollow();
      const result = solve(scenario, mode);
      const slotW = new Array<number>(SLOTS).fill(0);
      for (const a of result.assignments) slotW[a.slotIndex] += a.actualPowerWatts;
      for (const w of slotW) expect(w).toBeLessThanOrEqual(scenario.peakW);
    });
  }
});

describe('hard constraints — budget never exceeded', () => {
  const modes = ['fair', 'first-come', 'directorate'] as const;
  for (const mode of modes) {
    it(`${mode} mode: energy budget respected`, () => {
      const scenario = hollow();
      const result = solve(scenario, mode);
      const usedWm = result.assignments.reduce((sum, a) => sum + wm(a.actualPowerWatts), 0);
      expect(usedWm).toBeLessThanOrEqual(kwhToWm(scenario.budgetKWh));
    });
  }
});

// ---------------------------------------------------------------------------
// Determinism
// ---------------------------------------------------------------------------

describe('determinism', () => {
  it('solve(hollow(), fair) is identical on two calls', () => {
    const r1 = solve(hollow(), 'fair');
    const r2 = solve(hollow(), 'fair');
    expect(JSON.stringify(r1)).toBe(JSON.stringify(r2));
  });
});

// ---------------------------------------------------------------------------
// validate() detects injected violations
// ---------------------------------------------------------------------------

describe('validate() detects injected bad assignment', () => {
  it('flags violations when a bad assignment is appended', () => {
    const scenario = hollow();
    const result = solve(scenario, 'fair');
    // Inject an obviously invalid assignment
    result.assignments.push({
      cohortId: 'M',
      roomId: 'R1',
      slotIndex: 999, // invalid slot
      actualPowerWatts: 600,
    });
    const violations = validate(scenario, result);
    expect(violations.length).toBeGreaterThan(0);
  });

  it('flags energy cap violation when total wm is over budget', () => {
    const scenario = hollow();
    scenario.budgetKWh = 0.001; // near zero
    const result = solve(scenario, 'fair');
    // Force an assignment that breaks energy cap
    result.assignments.push({
      cohortId: 'M',
      roomId: 'R1',
      slotIndex: 10,
      actualPowerWatts: 600,
    });
    const violations = validate(scenario, result);
    expect(violations).toContain('energy cap');
  });
});

// ---------------------------------------------------------------------------
// Directorate mode: largest cohort gets priority
// ---------------------------------------------------------------------------

describe('directorate mode', () => {
  it('Medical support (smallest, 24 ppl) gets fewer sessions than Morning maintenance (largest, 48 ppl)', () => {
    const scenario = hollow();
    const result = solve(scenario, 'directorate');
    const morningGot = result.got['M'] ?? 0; // Morning maintenance, 48 ppl
    const medicalGot = result.got['S'] ?? 0; // Medical support, 24 ppl
    expect(morningGot).toBeGreaterThan(medicalGot);
  });

  it('validate returns [] for directorate result', () => {
    const scenario = hollow();
    const result = solve(scenario, 'directorate');
    expect(validate(scenario, result)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Rationing preset
// ---------------------------------------------------------------------------

describe('rationing preset', () => {
  it('no R1 assignments (R1 disabled), validate=[]', () => {
    const scenario = rationing();
    const result = solve(scenario, 'fair');
    expect(result.assignments.every(a => a.roomId !== 'R1')).toBe(true);
    expect(validate(scenario, result)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Assignments within allowed windows
// ---------------------------------------------------------------------------

describe('all assignments within allowed windows', () => {
  it('fair mode: every assignment slot is in the cohort allowed window', () => {
    const scenario = hollow();
    const result = solve(scenario, 'fair');
    for (const a of result.assignments) {
      const cohort = scenario.cohorts.find(c => c.id === a.cohortId)!;
      expect(cohort.allowedSlots).toContain(a.slotIndex);
    }
  });
});
