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
      },
      {
        id: 'R2',
        name: 'Annex',
        capacityPeople: 30,
        brightModeWatts: 400,
        permittedCohortIds: ['S'],
        enabled: true,
      },
      {
        id: 'R3',
        name: 'Mess East',
        capacityPeople: 40,
        brightModeWatts: 500,
        permittedCohortIds: ['M', 'N', 'H', 'S'],
        enabled: true,
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
        // Planning assumption: mid-morning preferred (not a clinical recommendation)
        preferredSlots: rng(10, 16),
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
        // Planning assumption: early-evening preferred (not a clinical recommendation)
        preferredSlots: rng(38, 46),
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
        // Planning assumption: afternoon preferred (not a clinical recommendation)
        preferredSlots: rng(16, 22),
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
        // Planning assumption: midday + evening preferred (not a clinical recommendation)
        preferredSlots: [...rng(14, 20), ...rng(34, 38)],
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
      },
    ],
    assumptions:
      'Toy scenario for algorithm verification only. ' +
      'Only one room exists so no two cohorts can share a slot. ' +
      HOLLOW_ASSUMPTIONS,
  };
}
