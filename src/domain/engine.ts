// SECOND SUN — TypeScript domain engine
// Ported faithfully from second-sun-engine.js (reference implementation).
//
// IMPORTANT LIMITATIONS:
// - The 'fair' scheduler is a DETERMINISTIC GREEDY HEURISTIC (progressive filling),
//   not a proven globally optimal max-min solver.
// - Whole-cohort booking: a cohort occupies an entire room. Rooms smaller than the
//   cohort population are skipped. Cohort splitting is not implemented.
// - No clinical recommendations, health predictions, or circadian-dose calculations
//   are made or implied.

import type { Room, Cohort, Scenario, Assignment, ScheduleResult, Metrics, PolicyMode } from './types';

export const SLOTS = 48;
export const MIN = 30; // minutes per half-hour slot

/**
 * Generate a slot range from a (inclusive) to b (exclusive), wrapping around 47→0.
 * When a === b returns []. Valid inputs: a, b in [0, 47].
 */
export function rng(a: number, b: number): number[] {
  if (a === b) return [];
  const o: number[] = [];
  let i = a;
  // Guard: at most SLOTS iterations to prevent infinite loops on bad input
  let guard = 0;
  while (i !== b && guard < SLOTS) {
    o.push(i);
    i = (i + 1) % SLOTS;
    guard++;
  }
  return o;
}

/** Convert kilowatt-hours to watt-minutes. */
export function kwhToWm(k: number): number {
  return Math.round(k * 60000);
}

/** Convert watts to watt-minutes consumed in one half-hour slot. */
export function wm(watts: number): number {
  return watts * MIN;
}

/** Format a slot index as HH:MM (24-hour clock). */
export function fmtT(i: number): string {
  return String(Math.floor(i / 2)).padStart(2, '0') + ':' + (i % 2 ? '30' : '00');
}

/** A candidate assignment: one room + one slot that a cohort could use. */
export interface Candidate {
  r: Room;
  s: number;
}

/**
 * Return all (room, slot) candidates eligible for a cohort.
 * Eligibility: room enabled, cohort permitted, room capacity ≥ cohort population,
 * slot in allowedSlots and NOT in quietSlots.
 */
export function candidates(scenario: Scenario, cohort: Cohort): Candidate[] {
  const quiet = new Set(cohort.quietSlots);
  // Deduplicate and sort allowed slots
  const allowed = [...new Set(cohort.allowedSlots)].sort((a, b) => a - b);
  const result: Candidate[] = [];
  for (const r of scenario.rooms) {
    if (!r.enabled) continue;
    if (!cohort.permittedRoomIds.includes(r.id)) continue;
    if (r.capacityPeople < cohort.populationPeople) continue;
    for (const s of allowed) {
      if (!quiet.has(s)) result.push({ r, s });
    }
  }
  return result;
}

/**
 * Schedule sessions for all cohorts under the given policy mode.
 *
 * Policy modes:
 *  - 'fair': greedy progressive-filling heuristic — picks the cohort with lowest
 *    coverage ratio each round. NOT a proven globally optimal solver.
 *  - 'first-come': serve cohorts in input order.
 *  - 'directorate': Illustrative Directorate Policy (Simulated) — fictional, NOT
 *    actual government behavior. Priority by population descending.
 */
export function solve(scenario: Scenario, mode: PolicyMode): ScheduleResult {
  const budget = kwhToWm(scenario.budgetKWh);
  const peak = scenario.peakW;
  let usedWm = 0;

  // Pre-compute candidates per cohort
  const cand: Record<string, Candidate[]> = {};
  for (const c of scenario.cohorts) {
    cand[c.id] = candidates(scenario, c);
  }

  const roomUse = new Set<string>(); // "roomId|slotIndex"
  const cohUse = new Set<string>();  // "cohortId|slotIndex"
  const slotW = new Array<number>(SLOTS).fill(0);
  const got: Record<string, number> = {};
  const assignments: Assignment[] = [];

  for (const c of scenario.cohorts) got[c.id] = 0;

  /** Number of cohorts that include slot s in their allowed window (slot contention). */
  const cont = (s: number): number =>
    scenario.cohorts.filter(c => c.allowedSlots.includes(s)).length;

  /** Feasible (room, slot) pairs for cohort c under current state. */
  const feas = (c: Cohort): Candidate[] =>
    cand[c.id].filter(({ r, s }) =>
      !roomUse.has(r.id + '|' + s) &&
      !cohUse.has(c.id + '|' + s) &&
      usedWm + wm(r.brightModeWatts) <= budget &&
      slotW[s] + r.brightModeWatts <= peak
    );

  /** Commit an assignment for cohort c. */
  const put = (c: Cohort, { r, s }: Candidate): void => {
    roomUse.add(r.id + '|' + s);
    cohUse.add(c.id + '|' + s);
    slotW[s] += r.brightModeWatts;
    usedWm += wm(r.brightModeWatts);
    got[c.id]++;
    assignments.push({
      cohortId: c.id,
      roomId: r.id,
      slotIndex: s,
      actualPowerWatts: r.brightModeWatts,
    });
  };

  if (mode === 'fair') {
    // Greedy progressive-filling heuristic:
    // Each round pick the feasible cohort with lowest got/req ratio (ties broken by id).
    // Then pick the best candidate (lowest watts, lowest contention, earliest slot, room id).
    for (;;) {
      const open = scenario.cohorts
        .filter(c => c.requestedSlots > 0 && got[c.id] < c.requestedSlots)
        .map(c => ({ c, f: feas(c) }))
        .filter(x => x.f.length > 0);
      if (open.length === 0) break;
      open.sort((a, b) =>
        got[a.c.id] / a.c.requestedSlots - got[b.c.id] / b.c.requestedSlots ||
        a.c.id.localeCompare(b.c.id)
      );
      const { c, f } = open[0];
      f.sort((a, b) =>
        a.r.brightModeWatts - b.r.brightModeWatts ||
        cont(a.s) - cont(b.s) ||
        a.s - b.s ||
        a.r.id.localeCompare(b.r.id)
      );
      put(c, f[0]);
    }
  } else {
    // first-come or directorate: iterate cohorts, greedily fill each quota
    let orderedCohorts = [...scenario.cohorts];
    if (mode === 'directorate') {
      // Illustrative Directorate Policy (Simulated) — fictional, NOT actual government behavior.
      // Priority: largest population first; ties broken by cohort id ascending.
      orderedCohorts.sort((a, b) =>
        b.populationPeople - a.populationPeople || a.id.localeCompare(b.id)
      );
    }
    for (const c of orderedCohorts) {
      while (got[c.id] < c.requestedSlots) {
        const f = feas(c);
        if (!f.length) break;
        f.sort((a, b) => a.s - b.s || a.r.id.localeCompare(b.r.id));
        put(c, f[0]);
      }
    }
  }

  // Build metrics
  const pop: Record<string, number> = Object.fromEntries(
    scenario.cohorts.map(c => [c.id, c.populationPeople])
  );
  const covRatios = scenario.cohorts
    .filter(c => c.requestedSlots > 0)
    .map(c => Math.min(1, got[c.id] / c.requestedSlots));

  const metrics: Metrics = {
    sessions: assignments.length,
    minCov: covRatios.length ? Math.min(...covRatios) : null,
    avgCov: covRatios.length ? covRatios.reduce((a, b) => a + b, 0) / covRatios.length : null,
    gap: covRatios.length ? Math.max(...covRatios) - Math.min(...covRatios) : null,
    kwh: usedWm / 60000,
    personSlots: assignments.reduce((a, x) => a + pop[x.cohortId], 0),
    peakW: Math.max(0, ...slotW),
    unmet: scenario.cohorts.reduce((a, c) => a + Math.max(0, c.requestedSlots - got[c.id]), 0),
  };

  // Build why-text per cohort
  const why: Record<string, string> = {};
  for (const c of scenario.cohorts) {
    const un = c.requestedSlots - got[c.id];
    if (c.requestedSlots <= 0) { why[c.id] = 'No request.'; continue; }
    if (un <= 0) { why[c.id] = 'Fully served.'; continue; }
    if (!cand[c.id].length) {
      why[c.id] = `Unmet ${un} of ${c.requestedSlots}. No eligible room and slot exists: check its window, quiet hours, room access, room capacity and whether rooms are enabled.`;
      continue;
    }
    let occ = 0, en = 0, pk = 0;
    for (const { r, s } of cand[c.id]) {
      if (cohUse.has(c.id + '|' + s)) continue;
      if (roomUse.has(r.id + '|' + s)) { occ++; continue; }
      if (usedWm + wm(r.brightModeWatts) > budget) en++;
      else if (slotW[s] + r.brightModeWatts > peak) pk++;
    }
    const p: string[] = [];
    if (en) p.push(`${en} open option${en > 1 ? 's' : ''} need more energy than remains`);
    if (pk) p.push(`${pk} would exceed the peak-power cap`);
    if (occ) p.push(`${occ} room-slot${occ > 1 ? 's are' : ' is'} already booked`);
    why[c.id] = `Unmet ${un} of ${c.requestedSlots}. Of ${cand[c.id].length} eligible options, ${
      p.length ? p.join('; ') : 'the rest overlap sessions this group already has'
    }. Several limits can apply at once.`;
  }

  return { assignments, got, metrics, why, budgetWm: budget };
}

/**
 * Validate all hard constraints for a schedule result.
 * Returns an empty array if valid; otherwise a list of violation strings.
 *
 * Checks: unknown refs, disabled rooms, out-of-window, quiet slots, capacity,
 * room access, room double-booking, cohort double-booking, over-request,
 * peak cap, energy cap.
 */
export function validate(scenario: Scenario, result: ScheduleResult): string[] {
  const violations: string[] = [];
  const roomSeen: Record<string, boolean> = {};   // "roomId|slotIndex"
  const cohSeen: Record<string, boolean> = {};    // "cohortId|slotIndex"
  const slotWatts = new Array<number>(SLOTS).fill(0);
  const count: Record<string, number> = {};
  let totalWm = 0;

  for (const a of result.assignments) {
    const cohort = scenario.cohorts.find(x => x.id === a.cohortId);
    const room = scenario.rooms.find(x => x.id === a.roomId);

    if (!cohort || !room) { violations.push('unknown ref'); continue; }
    if (!room.enabled) violations.push('disabled room');
    if (!cohort.allowedSlots.includes(a.slotIndex)) violations.push('outside window');
    if (cohort.quietSlots.includes(a.slotIndex)) violations.push('quiet slot');
    if (room.capacityPeople < cohort.populationPeople) violations.push('capacity');
    if (!cohort.permittedRoomIds.includes(room.id)) violations.push('room access');

    const rKey = room.id + '|' + a.slotIndex;
    if (roomSeen[rKey]) violations.push('room double-booked');
    roomSeen[rKey] = true;

    const cKey = cohort.id + '|' + a.slotIndex;
    if (cohSeen[cKey]) violations.push('cohort double-booked');
    cohSeen[cKey] = true;

    slotWatts[a.slotIndex] += a.actualPowerWatts;
    totalWm += wm(a.actualPowerWatts);
    count[a.cohortId] = (count[a.cohortId] ?? 0) + 1;
  }

  for (const c of scenario.cohorts) {
    if ((count[c.id] ?? 0) > c.requestedSlots) violations.push('over request');
  }
  if (slotWatts.some(w => w > scenario.peakW)) violations.push('peak cap');
  if (totalWm > kwhToWm(scenario.budgetKWh)) violations.push('energy cap');

  return violations;
}
