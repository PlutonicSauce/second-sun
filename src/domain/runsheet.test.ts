import { describe, it, expect } from 'vitest';
import {
  consolidateRunSheetBookings,
  calculateOperationalMetrics,
  computeEmergencyScheduleDelta,
} from './runsheet';
import type { Scenario, ScheduleResult } from './types';
import { multilevel } from './presets';
import { solve } from './engine';

describe('RunSheet Consolidation Logic', () => {
  const dummyScenario: Scenario = {
    id: 'test-scenario',
    title: 'Test',
    description: 'Test',
    budgetKWh: 5.0,
    peakW: 2000,
    assumptions: 'none',
    rooms: [
      {
        id: 'room-a',
        name: 'Room Alpha',
        capacityPeople: 50,
        brightModeWatts: 400,
        permittedCohortIds: ['c1', 'c2'],
        enabled: true,
        locationLevel: 3,
      },
      {
        id: 'room-b',
        name: 'Room Beta',
        capacityPeople: 50,
        brightModeWatts: 300,
        permittedCohortIds: ['c1', 'c2'],
        enabled: true,
        locationLevel: 7,
      },
    ],
    cohorts: [
      {
        id: 'c1',
        name: 'Cohort 1',
        populationPeople: 20,
        requestedSlots: 4,
        allowedSlots: [0, 1, 2, 3],
        quietSlots: [],
        permittedRoomIds: ['room-a', 'room-b'],
        shiftLabel: 'Morning',
        preferredSlots: [0, 1], // Slots 0 and 1 are preferred, 2 and 3 are not
        level: 3,
      },
      {
        id: 'c2',
        name: 'Cohort 2',
        populationPeople: 15,
        requestedSlots: 2,
        allowedSlots: [0, 1],
        quietSlots: [],
        permittedRoomIds: ['room-b'],
        shiftLabel: 'Morning',
        preferredSlots: [],
        level: 7,
      },
    ],
  };

  it('merges consecutive slots for Room Alpha even when interleaved with Room Beta in the raw assignment array', () => {
    // Interleaved raw array: Room A slot 0, Room B slot 0, Room A slot 1, Room B slot 1
    const rawResult: ScheduleResult = {
      assignments: [
        { cohortId: 'c1', roomId: 'room-a', slotIndex: 0, actualPowerWatts: 400 },
        { cohortId: 'c2', roomId: 'room-b', slotIndex: 0, actualPowerWatts: 300 },
        { cohortId: 'c1', roomId: 'room-a', slotIndex: 1, actualPowerWatts: 400 },
        { cohortId: 'c2', roomId: 'room-b', slotIndex: 1, actualPowerWatts: 300 },
      ],
      got: { c1: 2, c2: 2 },
      metrics: {
        sessions: 4,
        minCov: 0.5,
        avgCov: 0.75,
        gap: 0.5,
        kwh: 0.7,
        personSlots: 70,
        peakW: 700,
        unmet: 2,
      },
      why: {},
      budgetWm: 300000,
    };

    const bookings = consolidateRunSheetBookings(dummyScenario, rawResult);

    // Should produce exactly 2 consolidated blocks (one for Room A, one for Room B)
    expect(bookings).toHaveLength(2);

    const roomABooking = bookings.find(b => b.roomId === 'room-a')!;
    expect(roomABooking).toBeDefined();
    expect(roomABooking.startSlot).toBe(0);
    expect(roomABooking.endSlot).toBe(2);
    expect(roomABooking.slotsCount).toBe(2);
    expect(roomABooking.durationMinutes).toBe(60);

    const roomBBooking = bookings.find(b => b.roomId === 'room-b')!;
    expect(roomBBooking).toBeDefined();
    expect(roomBBooking.startSlot).toBe(0);
    expect(roomBBooking.endSlot).toBe(2);
    expect(roomBBooking.slotsCount).toBe(2);
    expect(roomBBooking.durationMinutes).toBe(60);
  });

  it('accurately identifies full wake windows, partial wake windows, and off-peak sessions', () => {
    const rawResult: ScheduleResult = {
      assignments: [
        // c1: slots 0, 1 (both preferred => full)
        { cohortId: 'c1', roomId: 'room-a', slotIndex: 0, actualPowerWatts: 400 },
        { cohortId: 'c1', roomId: 'room-a', slotIndex: 1, actualPowerWatts: 400 },
        // c1: slots 3, 4 (slot 3 not preferred, slot 4 not preferred => off-peak)
        { cohortId: 'c1', roomId: 'room-a', slotIndex: 3, actualPowerWatts: 400 },
        { cohortId: 'c1', roomId: 'room-a', slotIndex: 4, actualPowerWatts: 400 },
      ],
      got: { c1: 4 },
      metrics: {
        sessions: 4,
        minCov: 1,
        avgCov: 1,
        gap: 0,
        kwh: 0.8,
        personSlots: 80,
        peakW: 400,
        unmet: 0,
      },
      why: {},
      budgetWm: 300000,
    };

    const bookings = consolidateRunSheetBookings(dummyScenario, rawResult);
    expect(bookings).toHaveLength(2);

    // First block: slots 0-2 (both preferred)
    expect(bookings[0].wakeWindowStatus).toBe('full');
    expect(bookings[0].preferredSummary).toContain('Primary Wake Window');

    // Second block: slots 3-5 (neither preferred)
    expect(bookings[1].wakeWindowStatus).toBe('off-peak');
    expect(bookings[1].preferredSummary).toBe('Off-Peak');
  });

  it('accurately reports partial wake window when only a subset of consecutive slots are preferred', () => {
    const rawResult: ScheduleResult = {
      assignments: [
        // c1: slots 1 (preferred) and 2 (not preferred) in room-a
        { cohortId: 'c1', roomId: 'room-a', slotIndex: 1, actualPowerWatts: 400 },
        { cohortId: 'c1', roomId: 'room-a', slotIndex: 2, actualPowerWatts: 400 },
      ],
      got: { c1: 2 },
      metrics: {
        sessions: 2,
        minCov: 0.5,
        avgCov: 0.5,
        gap: 0,
        kwh: 0.4,
        personSlots: 40,
        peakW: 400,
        unmet: 2,
      },
      why: {},
      budgetWm: 300000,
    };

    const bookings = consolidateRunSheetBookings(dummyScenario, rawResult);
    expect(bookings).toHaveLength(1);
    expect(bookings[0].slotsCount).toBe(2);
    expect(bookings[0].durationMinutes).toBe(60);
    expect(bookings[0].preferredSlotsCount).toBe(1);
    expect(bookings[0].wakeWindowStatus).toBe('partial');
    expect(bookings[0].preferredSummary).toBe('Partial Wake Window (30 of 60 min)');
  });
});

describe('Scenario Operational Metrics', () => {
  it('correctly calculates residents affected vs residents served, person-sessions, and Level 2 to Level 9 range', () => {
    const s = multilevel();
    // Default 60% shortage
    s.budgetKWh = 1.92;
    const result = solve(s, 'fair');

    const metrics = calculateOperationalMetrics(s, result);

    // Total requesting population is 152
    expect(metrics.residentsAffected).toBe(152);

    // Under 60% fair heuristic, all 5 cohorts get at least 1 session
    expect(metrics.residentsServed).toBe(152);

    // Person-sessions should match result.metrics.personSlots
    expect(metrics.personSessions).toBe(result.metrics.personSlots);
    expect(metrics.totalSessions).toBe(result.assignments.length);

    // Spans from Level 2 to Level 9!
    expect(metrics.minLevel).toBe(2);
    expect(metrics.maxLevel).toBe(9);
    expect(metrics.levelSpanText).toBe('Levels 2 through 9');
  });

  it('accurately reports residents served when a cohort receives zero sessions (e.g. at severe 0.40 kWh rationing)', () => {
    const s = multilevel();
    s.budgetKWh = 0.40; // Very small budget where deep cohorts may be dropped
    const result = solve(s, 'fair');

    const metrics = calculateOperationalMetrics(s, result);
    expect(metrics.residentsAffected).toBe(152);

    // Verify residentsServed strictly counts only cohorts where got[c.id] > 0
    const manualSum = s.cohorts
      .filter(c => (result.got[c.id] ?? 0) > 0)
      .reduce((acc, c) => acc + c.populationPeople, 0);

    expect(metrics.residentsServed).toBe(manualSum);
    if (metrics.residentsServed < metrics.residentsAffected) {
      expect(metrics.residentsServed).toBeLessThan(152);
    }
  });
});

describe('Emergency Generator Failure Delta', () => {
  it('computes exact delta between normal 60% shortage and 25% emergency grid collapse', () => {
    const sBase = multilevel();
    sBase.budgetKWh = 1.92; // 60%
    const baseResult = solve(sBase, 'fair');

    const sEmergency = multilevel();
    sEmergency.budgetKWh = 0.80; // 25% emergency
    const emergencyResult = solve(sEmergency, 'fair');

    const delta = computeEmergencyScheduleDelta(sBase, baseResult, emergencyResult);

    expect(delta.previousKWh).toBe(baseResult.metrics.kwh);
    expect(delta.newKWh).toBe(emergencyResult.metrics.kwh);
    expect(delta.lostSessions).toBe(baseResult.assignments.length - emergencyResult.assignments.length);
    expect(delta.lostSessions).toBeGreaterThan(0);
    expect(delta.lostPersonSessions).toBe(baseResult.metrics.personSlots - emergencyResult.metrics.personSlots);
    expect(delta.cohortDeltas.length).toBeGreaterThan(0);
  });
});
