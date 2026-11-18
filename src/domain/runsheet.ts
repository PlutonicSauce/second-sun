// SECOND SUN — Run Sheet Consolidation, Accurate Metrics, and Emergency Delta Logic
// Pure domain logic with 100% testable functions.

import type { Scenario, ScheduleResult, Assignment, Cohort, Room } from './types';

export type WakeWindowStatus = 'full' | 'partial' | 'off-peak';

export interface ConsolidatedBooking {
  id: string;
  roomId: string;
  roomName: string;
  roomLevel?: number;
  roomCapacity: number;
  cohortId: string;
  cohortName: string;
  cohortLevel: number;
  cohortPopulation: number;
  cohortShiftLabel: string;
  startSlot: number;
  endSlot: number; // exclusive
  slotsCount: number;
  durationMinutes: number;
  powerWatts: number;
  energyKWh: number;
  preferredSlotsCount: number;
  wakeWindowStatus: WakeWindowStatus;
  preferredSummary: string;
}

export interface ScenarioOperationalMetrics {
  /** Total population of all requesting cohorts in the scenario. */
  residentsAffected: number;
  /** Population of residents whose cohort received at least one scheduled session. */
  residentsServed: number;
  /** Total person-sessions (sum of population * sessions for each assignment). */
  personSessions: number;
  /** Total 30-minute room sessions scheduled. */
  totalSessions: number;
  /** Lowest subterranean level in scenario. */
  minLevel: number;
  /** Deepest subterranean level in scenario. */
  maxLevel: number;
  /** Human-readable level span, e.g. "Levels 2 through 9". */
  levelSpanText: string;
}

export interface CohortEmergencyDelta {
  cohortId: string;
  cohortName: string;
  cohortLevel: number;
  cohortPopulation: number;
  previousSessions: number;
  newSessions: number;
  sessionsDelta: number; // e.g. -1
  isBlackedOut: boolean;
}

export interface EmergencyScheduleDelta {
  previousKWh: number;
  newKWh: number;
  lostKWh: number;
  previousSessions: number;
  newSessions: number;
  lostSessions: number;
  previousPersonSessions: number;
  newPersonSessions: number;
  lostPersonSessions: number;
  cohortDeltas: CohortEmergencyDelta[];
  blackedOutCohorts: CohortEmergencyDelta[];
}

/**
 * Consolidate consecutive half-hour slots for the same cohort in the same room.
 *
 * CRITICAL FIX: Groups assignments by (roomId, cohortId) FIRST so that interleaved
 * assignments in other rooms during the same time slot do not prevent valid merging.
 *
 * Accurately tracks preferred vs off-peak slots instead of erroneously marking
 * mixed intervals as fully preferred.
 */
export function consolidateRunSheetBookings(
  scenario: Scenario,
  result: ScheduleResult,
): ConsolidatedBooking[] {
  const roomMap = new Map<string, Room>(scenario.rooms.map(r => [r.id, r]));
  const cohortMap = new Map<string, Cohort>(scenario.cohorts.map(c => [c.id, c]));

  // Group assignments by composite key: roomId + '::' + cohortId
  const groups = new Map<string, Assignment[]>();
  for (const asg of result.assignments) {
    const key = `${asg.roomId}::${asg.cohortId}`;
    let list = groups.get(key);
    if (!list) {
      list = [];
      groups.set(key, list);
    }
    list.push(asg);
  }

  const consolidated: ConsolidatedBooking[] = [];

  for (const [key, asgs] of groups.entries()) {
    const [roomId, cohortId] = key.split('::');
    const room = roomMap.get(roomId);
    const cohort = cohortMap.get(cohortId);

    // Sort this group strictly by slotIndex ascending
    const sorted = [...asgs].sort((a, b) => a.slotIndex - b.slotIndex);

    let currentStart = sorted[0].slotIndex;
    let currentEnd = currentStart + 1;
    let currentWatts = sorted[0].actualPowerWatts;
    let preferredCount = 0;

    const preferredSet = new Set(cohort ? cohort.preferredSlots : []);
    if (preferredSet.has(sorted[0].slotIndex)) {
      preferredCount++;
    }

    for (let i = 1; i < sorted.length; i++) {
      const nextAsg = sorted[i];
      if (nextAsg.slotIndex === currentEnd) {
        // Genuinely consecutive in the same room for the same cohort!
        currentEnd = nextAsg.slotIndex + 1;
        if (preferredSet.has(nextAsg.slotIndex)) {
          preferredCount++;
        }
      } else {
        // Gap encountered: push existing booking and start fresh
        pushBooking(currentStart, currentEnd, preferredCount, currentWatts);
        currentStart = nextAsg.slotIndex;
        currentEnd = currentStart + 1;
        currentWatts = nextAsg.actualPowerWatts;
        preferredCount = preferredSet.has(nextAsg.slotIndex) ? 1 : 0;
      }
    }

    // Push the final booking in the group
    pushBooking(currentStart, currentEnd, preferredCount, currentWatts);

    function pushBooking(start: number, end: number, prefCount: number, watts: number) {
      const slotsCount = end - start;
      const durationMin = slotsCount * 30;
      const energyKWh = (watts * 0.5 * slotsCount) / 1000;

      let wakeWindowStatus: WakeWindowStatus = 'off-peak';
      let preferredSummary = 'Off-Peak';

      if (prefCount === slotsCount) {
        wakeWindowStatus = 'full';
        preferredSummary = '★ Primary Wake Window';
      } else if (prefCount > 0) {
        wakeWindowStatus = 'partial';
        preferredSummary = `Partial Wake Window (${prefCount * 30} of ${durationMin} min)`;
      }

      consolidated.push({
        id: `${roomId}-${cohortId}-${start}-${end}`,
        roomId,
        roomName: room?.name ?? roomId,
        roomLevel: room?.locationLevel,
        roomCapacity: room?.capacityPeople ?? 0,
        cohortId,
        cohortName: cohort?.name ?? cohortId,
        cohortLevel: cohort?.level ?? 0,
        cohortPopulation: cohort?.populationPeople ?? 0,
        cohortShiftLabel: cohort?.shiftLabel ?? '',
        startSlot: start,
        endSlot: end,
        slotsCount,
        durationMinutes: durationMin,
        powerWatts: watts,
        energyKWh: parseFloat(energyKWh.toFixed(3)),
        preferredSlotsCount: prefCount,
        wakeWindowStatus,
        preferredSummary,
      });
    }
  }

  // Sort all consolidated bookings chronologically by startSlot, then by room
  return consolidated.sort((a, b) => a.startSlot - b.startSlot || a.roomId.localeCompare(b.roomId));
}

/**
 * Accurately calculate scenario operational metrics, clearly distinguishing
 * residents affected from residents who actually received scheduled sessions.
 */
export function calculateOperationalMetrics(
  scenario: Scenario,
  result: ScheduleResult,
): ScenarioOperationalMetrics {
  const requestingCohorts = scenario.cohorts.filter(c => c.requestedSlots > 0);

  // Residents affected: total population across all cohorts that requested discretionary lighting
  const residentsAffected = requestingCohorts.reduce((sum, c) => sum + c.populationPeople, 0);

  // Residents served: population of cohorts that were actually granted at least 1 session
  const residentsServed = requestingCohorts
    .filter(c => (result.got[c.id] ?? 0) > 0)
    .reduce((sum, c) => sum + c.populationPeople, 0);

  const personSessions = result.metrics.personSlots;
  const totalSessions = result.assignments.length;

  const levels = scenario.cohorts.map(c => c.level);
  const minLevel = levels.length ? Math.min(...levels) : 0;
  const maxLevel = levels.length ? Math.max(...levels) : 0;

  const levelSpanText =
    minLevel === maxLevel
      ? `Level ${minLevel}`
      : `Levels ${minLevel} through ${maxLevel}`;

  return {
    residentsAffected,
    residentsServed,
    personSessions,
    totalSessions,
    minLevel,
    maxLevel,
    levelSpanText,
  };
}

/**
 * Compute the live delta between a baseline schedule and an emergency reschedule.
 * Completely dynamic from real solver results — zero hardcoding.
 */
export function computeEmergencyScheduleDelta(
  scenario: Scenario,
  previousResult: ScheduleResult,
  emergencyResult: ScheduleResult,
): EmergencyScheduleDelta {
  const previousSessions = previousResult.assignments.length;
  const newSessions = emergencyResult.assignments.length;
  const lostSessions = Math.max(0, previousSessions - newSessions);

  const previousKWh = previousResult.metrics.kwh;
  const newKWh = emergencyResult.metrics.kwh;
  const lostKWh = Math.max(0, parseFloat((previousKWh - newKWh).toFixed(2)));

  const previousPersonSessions = previousResult.metrics.personSlots;
  const newPersonSessions = emergencyResult.metrics.personSlots;
  const lostPersonSessions = Math.max(0, previousPersonSessions - newPersonSessions);

  const cohortDeltas: CohortEmergencyDelta[] = [];
  const blackedOutCohorts: CohortEmergencyDelta[] = [];

  for (const cohort of scenario.cohorts) {
    if (cohort.requestedSlots <= 0) continue;

    const prevGot = previousResult.got[cohort.id] ?? 0;
    const newGot = emergencyResult.got[cohort.id] ?? 0;
    const diff = newGot - prevGot;
    const isBlackedOut = prevGot > 0 && newGot === 0;

    const deltaItem: CohortEmergencyDelta = {
      cohortId: cohort.id,
      cohortName: cohort.name,
      cohortLevel: cohort.level,
      cohortPopulation: cohort.populationPeople,
      previousSessions: prevGot,
      newSessions: newGot,
      sessionsDelta: diff,
      isBlackedOut,
    };

    if (diff !== 0) {
      cohortDeltas.push(deltaItem);
    }
    if (isBlackedOut) {
      blackedOutCohorts.push(deltaItem);
    }
  }

  // Sort cohort deltas by largest loss first
  cohortDeltas.sort((a, b) => a.sessionsDelta - b.sessionsDelta);

  return {
    previousKWh,
    newKWh,
    lostKWh,
    previousSessions,
    newSessions,
    lostSessions,
    previousPersonSessions,
    newPersonSessions,
    lostPersonSessions,
    cohortDeltas,
    blackedOutCohorts,
  };
}
