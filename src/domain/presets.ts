// SECOND SUN — scenario presets
// Each preset is a function so callers always get a fresh, independent object.
//
// Slot windows are planning availability windows (shift-based), NOT clinical recommendations.
// Preferred slots are user-editable planning assumptions, NOT circadian prescriptions.

import { rng } from './engine';
import type { Scenario } from './types';

const HOLLOW_ASSUMPTIONS = [
  'Whole-cohort booking: a cohort occupies an entire room as a group.',
  'Allowed/quiet windows reflect shift availability, not clinical timing recommendations.',
  'Preferred slots are user-editable planning assumptions — not medical prescriptions.',
  'The fair scheduler is a greedy heuristic, not a proven globally optimal solver.',
  'Safety, emergency, and essential task lighting are excluded from this budget.',
  'All three policies (SECOND SUN heuristic, first-come, illustrative Directorate) use identical constraints.',
  'Directorate policy is fictional and illustrative — NOT actual government behavior.',
].join(' ');

/**
 * The Hollow Level 9 — 4 cohorts, 3 rooms, full 3.8 kWh budget.
 * Default launch should use 60% budget (2.28 kWh) to show a real shortage.
 */
export function hollow(): Scenario {
  return {
    id: 'hollow',
    title: 'Hollow Level 9, rotating shifts',
    description:
      'A geothermal power shortage has cut the discretionary lighting budget for Level 9. ' +
      'Four resident cohorts on different shifts compete for three bright-light rooms.',
    budgetKWh: 3.8,
    peakW: 1100,
    rooms: [
      {
        id: 'R1',
        name: 'Atrium',
        capacityPeople: 60,
        brightModeWatts: 600,
        permittedCohortIds: ['M', 'N', 'H', 'S'],
        enabled: true,
        locationLevel: 4,
      },
      {
        id: 'R2',
        name: 'Annex',
        capacityPeople: 30,
        brightModeWatts: 400,
        permittedCohortIds: ['S'],
        enabled: true,
        locationLevel: 3,
      },
      {
        id: 'R3',
        name: 'Mess East',
        capacityPeople: 40,
        brightModeWatts: 500,
        permittedCohortIds: ['M', 'N', 'H', 'S'],
        enabled: true,
        locationLevel: 7,
      },
    ],
    cohorts: [
      {
        id: 'M',
        name: 'Morning maintenance',
        populationPeople: 48,
        requestedSlots: 4,
        allowedSlots: rng(10, 20),
        quietSlots: [],
        permittedRoomIds: ['R1', 'R3'],
        shiftLabel: '05:00–13:00',
        preferredSlots: rng(10, 16),
        level: 7,
        levelName: 'Level 7 — Sub-Station Utilities',
      },
      {
        id: 'N',
        name: 'Night ventilation',
        populationPeople: 32,
        requestedSlots: 4,
        allowedSlots: rng(38, 4),
        quietSlots: [],
        permittedRoomIds: ['R1', 'R3'],
        shiftLabel: '19:00–03:00',
        preferredSlots: rng(38, 46),
        level: 9,
        levelName: 'Level 9 — Deep Air Scrubbers & Shafts',
      },
      {
        id: 'H',
        name: 'Hydroponics',
        populationPeople: 36,
        requestedSlots: 4,
        allowedSlots: rng(14, 26),
        quietSlots: rng(14, 16),
        permittedRoomIds: ['R1', 'R3'],
        shiftLabel: '07:00–15:00',
        preferredSlots: rng(16, 22),
        level: 5,
        levelName: 'Level 5 — Mid Agri-Tier',
      },
      {
        id: 'S',
        name: 'Medical support',
        populationPeople: 24,
        requestedSlots: 3,
        allowedSlots: [...rng(12, 22), ...rng(34, 40)],
        quietSlots: rng(12, 14),
        permittedRoomIds: ['R1', 'R2', 'R3'],
        shiftLabel: '06:00–18:00 / 17:00–05:00',
        preferredSlots: [...rng(14, 20), ...rng(34, 38)],
        level: 3,
        levelName: 'Level 3 — Upper Clinic & Administration',
      },
    ],
    assumptions: HOLLOW_ASSUMPTIONS,
  };
}

/**
 * Emergency Rationing — same as Hollow but budget cut to 1.2 kWh, peak 600 W,
 * and the Atrium (R1) is taken offline for maintenance.
 */
export function rationing(): Scenario {
  const s = hollow();
  s.id = 'rationing';
  s.title = 'Emergency rationing';
  s.description =
    'A second fault has halved the power budget and taken the Atrium offline. ' +
    'Only two smaller rooms remain available.';
  s.budgetKWh = 1.2;
  s.peakW = 600;
  const r1 = s.rooms.find(r => r.id === 'R1');
  if (r1) r1.enabled = false;
  return s;
}

/**
 * Toy fairness example — minimal scenario for testing scheduler behaviour.
 * Single room, two cohorts with identical requests and identical allowed windows.
 */
export function toy(): Scenario {
  return {
    id: 'toy',
    title: 'Toy fairness example',
    description: 'Two groups compete for the same single room and time window.',
    budgetKWh: 0.4,
    peakW: 400,
    rooms: [
      {
        id: 'R1',
        name: 'Single room',
        capacityPeople: 100,
        brightModeWatts: 400,
        permittedCohortIds: ['A', 'B'],
        enabled: true,
      },
    ],
    cohorts: [
      {
        id: 'A',
        name: 'Group A',
        populationPeople: 10,
        requestedSlots: 2,
        allowedSlots: rng(10, 14),
        quietSlots: [],
        permittedRoomIds: ['R1'],
        shiftLabel: '05:00–09:00',
        preferredSlots: rng(10, 14),
        level: 1,
        levelName: 'Level 1 — Upper Sector',
      },
      {
        id: 'B',
        name: 'Group B',
        populationPeople: 10,
        requestedSlots: 2,
        allowedSlots: rng(10, 14),
        quietSlots: [],
        permittedRoomIds: ['R1'],
        shiftLabel: '05:00–09:00',
        preferredSlots: rng(10, 14),
        level: 2,
        levelName: 'Level 2 — Lower Sector',
      },
    ],
    assumptions:
      'Toy scenario for algorithm verification only. ' +
      'Only one room exists so no two cohorts can share a slot. ' +
      HOLLOW_ASSUMPTIONS,
  };
}

/**
 * Hollow Multi-Level Grid — 5 cohorts across upper, mid, and deep sectors.
 * Explicitly tests Directorate upper-level favoritism vs SECOND SUN progressive filling,
 * and physical room accessibility (e.g. R2 on Level 2 is physically inaccessible to deep crews).
 */
export function multilevel(): Scenario {
  return {
    id: 'multilevel',
    title: 'Hollow Multi-Level Grid (Levels 2–9)',
    description:
      'Five cohorts from upper administrative tiers down to deep vent sumps compete for regional bright-light halls. ' +
      'Demonstrates systemic disadvantage of deep-level crews under Directorate allocation.',
    budgetKWh: 3.2,
    peakW: 1100,
    rooms: [
      {
        id: 'R1',
        name: 'Central Atrium',
        capacityPeople: 60,
        brightModeWatts: 600,
        permittedCohortIds: ['A', 'S', 'H', 'M', 'N'],
        enabled: true,
        locationLevel: 4,
      },
      {
        id: 'R2',
        name: 'Upper Sun-Lounge',
        capacityPeople: 25,
        brightModeWatts: 350,
        // Physically located on Level 2: only accessible to upper levels (A, S); deep levels M, N cannot access
        permittedCohortIds: ['A', 'S'],
        enabled: true,
        locationLevel: 2,
      },
      {
        id: 'R3',
        name: 'Sub-Station Hall',
        capacityPeople: 45,
        brightModeWatts: 500,
        permittedCohortIds: ['S', 'H', 'M', 'N'],
        enabled: true,
        locationLevel: 7,
      },
    ],
    cohorts: [
      {
        id: 'A',
        name: 'Directorate Staff',
        populationPeople: 18,
        requestedSlots: 3,
        allowedSlots: rng(16, 24),
        quietSlots: [],
        permittedRoomIds: ['R1', 'R2'],
        shiftLabel: '08:00–16:00',
        preferredSlots: rng(16, 22),
        level: 2,
        levelName: 'Level 2 — Directorate Executive Wing',
      },
      {
        id: 'S',
        name: 'Trauma & Medical',
        populationPeople: 24,
        requestedSlots: 3,
        allowedSlots: [...rng(12, 22), ...rng(34, 40)],
        quietSlots: rng(12, 14),
        permittedRoomIds: ['R1', 'R2', 'R3'],
        shiftLabel: '06:00–18:00',
        preferredSlots: [...rng(14, 20), ...rng(34, 38)],
        level: 3,
        levelName: 'Level 3 — Central Medical Ward',
      },
      {
        id: 'H',
        name: 'Hydroponics Crew',
        populationPeople: 36,
        requestedSlots: 4,
        allowedSlots: rng(14, 26),
        quietSlots: rng(14, 16),
        permittedRoomIds: ['R1', 'R3'],
        shiftLabel: '07:00–15:00',
        preferredSlots: rng(16, 22),
        level: 5,
        levelName: 'Level 5 — Primary Food Decks',
      },
      {
        id: 'M',
        name: 'Main Utility Maintenance',
        populationPeople: 42,
        requestedSlots: 4,
        allowedSlots: rng(10, 20),
        quietSlots: [],
        permittedRoomIds: ['R1', 'R3'],
        shiftLabel: '05:00–13:00',
        preferredSlots: rng(10, 16),
        level: 7,
        levelName: 'Level 7 — Main Conduit Sub-Station',
      },
      {
        id: 'N',
        name: 'Deep Ventilation & Sump',
        populationPeople: 32,
        requestedSlots: 4,
        allowedSlots: rng(38, 4),
        quietSlots: [],
        permittedRoomIds: ['R1', 'R3'],
        shiftLabel: '19:00–03:00',
        preferredSlots: rng(38, 46),
        level: 9,
        levelName: 'Level 9 — Deep Sump & Air Scrubbers',
      },
    ],
    assumptions:
      'Multi-level scenario with physical room accessibility constraints. ' +
      'R2 (Level 2) is physically unreachable from deep levels 7 and 9. ' +
      HOLLOW_ASSUMPTIONS,
  };
}
