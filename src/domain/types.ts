// SECOND SUN — strict TypeScript domain types
// All scheduling units: slot indices 0–47 (each = 30 min), watt-minutes (Wm)

/** A shared bright-light room in the Hollow. */
export interface Room {
  id: string;
  name: string;
  /** Maximum people the room can hold at one time. */
  capacityPeople: number;
  /** Power draw when bright mode is active, in watts. */
  brightModeWatts: number;
  /** Cohort ids that are permitted to book this room. */
  permittedCohortIds: string[];
  /** Whether the room is currently operational. */
  enabled: boolean;
}

/**
 * A group of residents with a shared shift and scheduling window.
 * NOTE: allowedSlots and quietSlots express availability, NOT clinical recommendations.
 */
export interface Cohort {
  id: string;
  name: string;
  /** Number of people in this group (whole room booking model — a cohort occupies an entire room). */
  populationPeople: number;
  /** Number of bright-light sessions requested per day (non-negative integer). */
  requestedSlots: number;
  /** Slot indices during which this cohort is available. */
  allowedSlots: number[];
  /** Slot indices during which this cohort must NOT be scheduled (rest/sleep periods). */
  quietSlots: number[];
  /** Room ids this cohort is eligible to book. */
  permittedRoomIds: string[];
  /** Human label for the cohort's shift (e.g. "06:00–14:00"). */
  shiftLabel: string;
  /**
   * User-editable preferred bright-light exposure planning windows (slot indices).
   * These reflect shift/wake-time planning assumptions — NOT clinical recommendations
   * or measured circadian-rhythm outcomes.
   */
  preferredSlots: number[];
}

/** A single scheduled session: one cohort in one room for one half-hour slot. */
export interface Assignment {
  cohortId: string;
  roomId: string;
  /** Half-hour slot index, 0–47 (0 = 00:00, 47 = 23:30). */
  slotIndex: number;
  /** Actual power consumed, equal to room.brightModeWatts. */
  actualPowerWatts: number;
}

/**
 * A complete scheduling scenario (inputs only — no results).
 * assumptions must clearly state any simplifications (e.g. whole-cohort booking).
 */
export interface Scenario {
  id: string;
  title: string;
  description: string;
  /** Daily discretionary bright-light energy budget in kilowatt-hours. */
  budgetKWh: number;
  /** Hard peak power cap across all rooms at any single slot, in watts. */
  peakW: number;
  rooms: Room[];
  cohorts: Cohort[];
  /**
   * Plain-language statement of modelling assumptions (whole-cohort booking,
   * greedy heuristic, no clinical claims, etc.)
   */
  assumptions: string;
}

/**
 * Output of the scheduler for one policy mode.
 * This is a GREEDY HEURISTIC result, not a proven globally optimal solution.
 */
export interface ScheduleResult {
  assignments: Assignment[];
  /** Sessions granted per cohort id. */
  got: Record<string, number>;
  metrics: Metrics;
  /** Human-readable explanation of why each cohort's demand was (un)met. */
  why: Record<string, string>;
  /** Energy budget converted to watt-minutes (for internal accounting). */
  budgetWm: number;
}

/** Aggregate metrics for a ScheduleResult. */
export interface Metrics {
  /** Total sessions scheduled. */
  sessions: number;
  /** Minimum coverage ratio (got/req) across all requesting cohorts, or null if none. */
  minCov: number | null;
  /** Average coverage ratio, or null if no requesting cohorts. */
  avgCov: number | null;
  /** Max−min coverage gap, or null if no requesting cohorts. */
  gap: number | null;
  /** Energy consumed in kilowatt-hours. */
  kwh: number;
  /** Sum of (cohort population × sessions assigned) across all assignments. */
  personSlots: number;
  /** Peak simultaneous wattage observed across all slots. */
  peakW: number;
  /** Total unmet session requests across all cohorts. */
  unmet: number;
}

/**
 * Scheduling policy mode.
 * - 'fair': deterministic greedy max-min heuristic (not proven globally optimal).
 * - 'first-come': cohorts served in input order until their quota is met or resources exhausted.
 * - 'directorate': illustrative simulated priority policy (fictional, NOT actual government behavior).
 */
export type PolicyMode = 'fair' | 'first-come' | 'directorate';
