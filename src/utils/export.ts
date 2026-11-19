import type { Scenario, ScheduleResult, PolicyMode } from '../domain/types';
import { fmtT, wm } from '../domain/engine';
import { policies } from '../domain/policies';
import { calculateOperationalMetrics, consolidateRunSheetBookings } from '../domain/runsheet';

const planningDay = 'Cycle 2087-D42 (00:00–24:00)';

function download(content: string, type: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvField(value: string | number): string {
  if (typeof value === 'number') return String(value);
  const text = /^[\s]*[=+@-]|^[\t\r\n]/.test(value) ? "'" + value : value;
  return '"' + text.replace(/"/g, '""') + '"';
}

export function exportScenarioJson(
  scenario: Scenario,
  results: Record<PolicyMode, ScheduleResult>,
  activePolicy: PolicyMode,
): void {
  const result = results[activePolicy];
  const roomMap = new Map(scenario.rooms.map(room => [room.id, room]));
  const cohortMap = new Map(scenario.cohorts.map(cohort => [cohort.id, cohort]));
  const payload = {
    exportedAt: new Date().toISOString(),
    horizon: planningDay,
    system: 'SECOND SUN',
    scenario,
    activeSchedule: {
      policy: activePolicy,
      metrics: result.metrics,
      bookings: consolidateRunSheetBookings(scenario, result),
      assignments: [...result.assignments].sort((a, b) => a.slotIndex - b.slotIndex).map(a => ({
        ...a,
        startTime: fmtT(a.slotIndex),
        endTime: fmtT(a.slotIndex + 1),
        roomName: roomMap.get(a.roomId)?.name,
        cohortName: cohortMap.get(a.cohortId)?.name,
        population: cohortMap.get(a.cohortId)?.populationPeople,
        energyKWh: wm(a.actualPowerWatts) / 60_000,
        isPreferredWindow: cohortMap.get(a.cohortId)?.preferredSlots.includes(a.slotIndex) ?? false,
      })),
      unmetRequests: result.metrics.unmet,
      constraintsFeedback: result.why,
    },
    allPolicyMetrics: {
      fairHeuristic: results.fair.metrics,
      firstComeBaseline: results['first-come'].metrics,
      directorateBaseline: results.directorate.metrics,
    },
  };
  download(JSON.stringify(payload, null, 2), 'application/json', `second-sun-${scenario.id}-${activePolicy}.json`);
}

export function exportScheduleCsv(
  scenario: Scenario,
  result: ScheduleResult,
  activePolicy: PolicyMode,
): void {
  const cohortMap = new Map(scenario.cohorts.map(c => [c.id, c]));
  const roomMap = new Map(scenario.rooms.map(r => [r.id, r]));

  const headers = [
    'planning_horizon',
    'policy',
    'slot_index',
    'start_time',
    'end_time',
    'room_id',
    'room_name',
    'room_location_level',
    'cohort_id',
    'cohort_name',
    'cohort_level',
    'cohort_population',
    'power_watts',
    'energy_kwh',
    'is_preferred_wake_window',
  ];

  const rows: string[] = [headers.join(',')];

  const sortedAssignments = [...result.assignments].sort((a, b) => a.slotIndex - b.slotIndex);

  for (const a of sortedAssignments) {
    const cohort = cohortMap.get(a.cohortId);
    const room = roomMap.get(a.roomId);
    const isPref = cohort ? cohort.preferredSlots.includes(a.slotIndex) : false;
    const startTime = fmtT(a.slotIndex);
    const endTime = fmtT(a.slotIndex + 1);
    const energyKWh = wm(a.actualPowerWatts) / 60_000;

    const row = [
      planningDay,
      activePolicy,
      a.slotIndex,
      startTime,
      endTime,
      a.roomId,
      room?.name ?? '',
      room?.locationLevel ?? '',
      a.cohortId,
      cohort?.name ?? '',
      cohort?.level ?? '',
      cohort?.populationPeople ?? '',
      a.actualPowerWatts,
      energyKWh,
      isPref ? 'TRUE' : 'FALSE',
    ];
    rows.push(row.map(csvField).join(','));
  }
  download(rows.join('\r\n'), 'text/csv;charset=utf-8;', `second-sun-${scenario.id}-${activePolicy}.csv`);
}

/**
 * Generate a clean plain-text Shift Handover Brief ready to print or copy to clipboard.
 */
export function generateShiftHandoverBrief(
  scenario: Scenario,
  result: ScheduleResult,
  policy: PolicyMode,
): string {
  const { residentsAffected, residentsServed } = calculateOperationalMetrics(scenario, result);
  const bookings = consolidateRunSheetBookings(scenario, result);
  const { sessions, unmet, peakW, kwh } = result.metrics;
  const lines = [
    'SECOND SUN — SHIFT HANDOVER',
    `Fictional scenario · ${planningDay}`,
    scenario.title,
    `Policy: ${policies[policy].name}. ${policies[policy].rule}`,
    '',
    `Sessions: ${sessions} of ${sessions + unmet} half-hour requests booked · ${unmet} unmet`,
    `Residents with at least one session: ${residentsServed} of ${residentsAffected}`,
    `Energy: ${kwh.toFixed(2)} of ${scenario.budgetKWh.toFixed(2)} kWh`,
    `Peak load: ${peakW} of ${scenario.peakW} W`,
    '',
    'ROOM BOOKINGS',
  ];

  if (bookings.length === 0) lines.push('No sessions scheduled.');
  for (const booking of bookings) {
    lines.push(
      `${fmtT(booking.startSlot)}–${fmtT(booking.endSlot)} · ${booking.roomName} (Level ${booking.roomLevel ?? '?'})`,
      `  ${booking.cohortName} · ${booking.cohortPopulation}/${booking.roomCapacity} people · ${booking.powerWatts} W · ${booking.preferredSummary}`,
    );
  }
  for (const room of scenario.rooms) {
    if (!room.enabled) lines.push(`Offline: ${room.name}`);
    else if (!bookings.some(booking => booking.roomId === room.id)) lines.push(`Unscheduled: ${room.name}`);
  }

  lines.push('', 'REQUESTS BY CREW');
  for (const cohort of scenario.cohorts) {
    lines.push(`Level ${cohort.level} · ${cohort.name}: ${result.got[cohort.id]}/${cohort.requestedSlots} sessions`);
    if (result.got[cohort.id] < cohort.requestedSlots) lines.push(`  ${result.why[cohort.id]}`);
  }

  lines.push('', 'Emergency, exit and essential task lighting are outside this plan.');
  return lines.join('\n');
}
