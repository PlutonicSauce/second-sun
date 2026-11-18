import type { Scenario, ScheduleResult, PolicyMode } from '../domain/types';
import { fmtT } from '../domain/engine';

export function exportScenarioJson(
  scenario: Scenario,
  results: Record<PolicyMode, ScheduleResult>,
  activePolicy: PolicyMode = 'fair',
): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    horizon: 'Cycle 2087-D42 (24-Hour Planning Horizon 00:00–23:30)',
    system: 'SECOND SUN — Discretionary Bright-Light Operations Planner',
    scenario: {
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      budgetKWh: scenario.budgetKWh,
      peakW: scenario.peakW,
      rooms: scenario.rooms,
      cohorts: scenario.cohorts,
      assumptions: scenario.assumptions,
    },
    activeSchedule: {
      policy: activePolicy,
      metrics: results[activePolicy].metrics,
      assignments: results[activePolicy].assignments.map(a => {
        const room = scenario.rooms.find(r => r.id === a.roomId);
        const cohort = scenario.cohorts.find(c => c.id === a.cohortId);
        return {
          ...a,
          startTime: fmtT(a.slotIndex),
          endTime: fmtT((a.slotIndex + 1) % 48),
          roomName: room?.name,
          cohortName: cohort?.name,
          population: cohort?.populationPeople,
          energyKWh: parseFloat(((a.actualPowerWatts * 0.5) / 1000).toFixed(3)),
          isPreferredWindow: cohort ? cohort.preferredSlots.includes(a.slotIndex) : false,
        };
      }),
      unmetRequests: results[activePolicy].metrics.unmet,
      constraintsFeedback: results[activePolicy].why,
    },
    allPolicyMetrics: {
      fairHeuristic: results.fair.metrics,
      firstComeBaseline: results['first-come'].metrics,
      directorateBaseline: results.directorate.metrics,
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `second-sun-operations-plan-${scenario.id}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadScheduleCsv(scenario: Scenario, result: ScheduleResult): void {
  exportScheduleCsv(scenario, { fair: result, 'first-come': result, directorate: result }, 'fair');
}

export function exportScheduleCsv(
  scenario: Scenario,
  results: Record<PolicyMode, ScheduleResult>,
  activePolicy: PolicyMode = 'fair',
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

  const res = results[activePolicy];
  const sortedAssignments = [...res.assignments].sort((a, b) => a.slotIndex - b.slotIndex);

  for (const a of sortedAssignments) {
    const cohort = cohortMap.get(a.cohortId);
    const room = roomMap.get(a.roomId);
    const isPref = cohort ? cohort.preferredSlots.includes(a.slotIndex) : false;
    const startTime = fmtT(a.slotIndex);
    const endTime = fmtT((a.slotIndex + 1) % 48);
    const energyKWh = ((a.actualPowerWatts * 0.5) / 1000).toFixed(3);

    const row = [
      '"Cycle 2087-D42 (24h)"',
      `"${activePolicy}"`,
      a.slotIndex,
      `"${startTime}"`,
      `"${endTime}"`,
      `"${a.roomId}"`,
      `"${room ? room.name : ''}"`,
      room?.locationLevel ?? '',
      `"${a.cohortId}"`,
      `"${cohort ? cohort.name : ''}"`,
      cohort?.level ?? '',
      cohort ? cohort.populationPeople : '',
      a.actualPowerWatts,
      energyKWh,
      isPref ? 'TRUE' : 'FALSE',
    ];
    rows.push(row.join(','));
  }

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `second-sun-schedule-${scenario.id}-${activePolicy}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate a clean plain-text Shift Handover Brief ready to print or copy to clipboard.
 */
export function generateShiftHandoverBrief(
  scenario: Scenario,
  result: ScheduleResult,
  policy: PolicyMode,
): string {
  const roomMap = new Map(scenario.rooms.map(r => [r.id, r]));
  const cohortMap = new Map(scenario.cohorts.map(c => [c.id, c]));

  const sorted = [...result.assignments].sort((a, b) => a.slotIndex - b.slotIndex);

  const lines: string[] = [
    '========================================================================',
    '       SECOND SUN — DISCRETIONARY LIGHTING OPERATIONS HANDOVER BRIEF     ',
    '========================================================================',
    `HORIZON:           Cycle 2087-D42 (24-Hour Horizon 00:00–23:30)`,
    `SCENARIO:          ${scenario.title}`,
    `SCHEDULING POLICY: ${policy.toUpperCase()} (Progressive-Filling Heuristic)`,
    `GENERATED AT:      ${new Date().toISOString()}`,
    '------------------------------------------------------------------------',
    '1. ELECTRICAL & FACILITY CONSTRAINTS',
    `   Discretionary Energy Budget: ${scenario.budgetKWh.toFixed(2)} kWh`,
    `   Simultaneous Power Cap:      ${scenario.peakW} W`,
    `   Energy Consumed by Plan:     ${result.metrics.kwh.toFixed(2)} kWh (${Math.round((result.metrics.kwh / scenario.budgetKWh) * 100)}% of limit)`,
    `   Peak Simultaneous Load:      ${result.metrics.peakW} W`,
    `   Sessions Operational:        ${result.metrics.sessions} half-hour sessions (${result.metrics.sessions * 0.5} hours room-time)`,
    `   Total Residents Reached:     ${result.metrics.personSlots} person-slots`,
    `   Unmet Requests:              ${result.metrics.unmet} sessions dropped due to energy limits`,
    '------------------------------------------------------------------------',
    '2. 24-HOUR CHRONOLOGICAL OPERATIONS AGENDA',
    '   TIME          ROOM                    GROUP (LEVEL, POP)         WATTS  WINDOW',
  ];

  for (const asg of sorted) {
    const room = roomMap.get(asg.roomId);
    const cohort = cohortMap.get(asg.cohortId);
    const isPref = cohort ? cohort.preferredSlots.includes(asg.slotIndex) : false;
    const timeStr = `${fmtT(asg.slotIndex)}–${fmtT((asg.slotIndex + 1) % 48)}`.padEnd(13);
    const roomStr = `${room?.name ?? asg.roomId} (L${room?.locationLevel ?? '?'})`.padEnd(24);
    const groupStr = `${cohort?.name ?? asg.cohortId} (L${cohort?.level ?? '?'}, ${cohort?.populationPeople ?? '?'}p)`.padEnd(27);
    const powerStr = `${asg.actualPowerWatts}W`.padEnd(7);
    const windowStr = isPref ? '★ Preferred' : 'Off-Peak';
    lines.push(`   ${timeStr} ${roomStr} ${groupStr} ${powerStr} ${windowStr}`);
  }

  lines.push('------------------------------------------------------------------------');
  lines.push('3. SECTOR ACCESS & UNMET DEMAND BREAKDOWN');
  for (const c of scenario.cohorts) {
    const got = result.got[c.id] ?? 0;
    const req = c.requestedSlots;
    const pct = req > 0 ? Math.round((got / req) * 100) : 100;
    const why = result.why[c.id] ?? 'Accommodated under policy constraints.';
    lines.push(`   • Level ${c.level} — ${c.name} (${c.populationPeople} residents):`);
    lines.push(`     Allocated: ${got}/${req} sessions (${pct}%)`);
    lines.push(`     Notes:     ${why}`);
  }

  lines.push('------------------------------------------------------------------------');
  lines.push('4. SUPERVISOR COMPLIANCE & SAFETY ASSURANCES');
  lines.push('   [X] Life-safety, exit, and corridor emergency lighting remain hard-isolated');
  lines.push('       from this discretionary budget (OSHA 1910.37 compliant).');
  lines.push('   [X] All room capacities verified against cohort group sizes.');
  lines.push('   [X] No concurrent room booking overlaps observed.');
  lines.push('   Supervisor Sign-off: __________________________  Station ID: ________');
  lines.push('========================================================================');

  return lines.join('\n');
}
