import type { Scenario, ScheduleResult, PolicyMode } from '../domain/types';
import { fmtT } from '../domain/engine';

export function exportScenarioJson(
  scenario: Scenario,
  results: Record<PolicyMode, ScheduleResult>,
): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    generator: 'SECOND SUN — Discretionary Bright-Light Room Scheduler',
    scenario,
    policies: {
      fairHeuristic: {
        description: 'Greedy progressive-filling max-min heuristic (not mathematically optimal)',
        metrics: results.fair.metrics,
        assignments: results.fair.assignments,
        why: results.fair.why,
      },
      firstCome: {
        description: 'First-come baseline in cohort input order under identical constraints',
        metrics: results['first-come'].metrics,
        assignments: results['first-come'].assignments,
        why: results['first-come'].why,
      },
      directorate: {
        description: 'Illustrative Directorate policy: simulated priority by population descending (fictional)',
        metrics: results.directorate.metrics,
        assignments: results.directorate.assignments,
        why: results.directorate.why,
      },
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `second-sun-schedule-${scenario.id}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportScheduleCsv(
  scenario: Scenario,
  results: Record<PolicyMode, ScheduleResult>,
): void {
  const cohortMap = new Map(scenario.cohorts.map(c => [c.id, c]));
  const roomMap = new Map(scenario.rooms.map(r => [r.id, r]));

  const headers = [
    'policy',
    'cohort_id',
    'cohort_name',
    'cohort_population',
    'room_id',
    'room_name',
    'slot_index',
    'start_time',
    'end_time',
    'power_watts',
    'is_preferred_slot',
  ];

  const rows: string[] = [headers.join(',')];

  const policies: PolicyMode[] = ['fair', 'first-come', 'directorate'];
  for (const pol of policies) {
    const res = results[pol];
    for (const a of res.assignments) {
      const cohort = cohortMap.get(a.cohortId);
      const room = roomMap.get(a.roomId);
      const isPref = cohort ? cohort.preferredSlots.includes(a.slotIndex) : false;
      const startTime = fmtT(a.slotIndex);
      const endTime = fmtT((a.slotIndex + 1) % 48);

      const row = [
        pol,
        `"${a.cohortId}"`,
        `"${cohort ? cohort.name : ''}"`,
        cohort ? cohort.populationPeople : '',
        `"${a.roomId}"`,
        `"${room ? room.name : ''}"`,
        a.slotIndex,
        startTime,
        endTime,
        a.actualPowerWatts,
        isPref ? 'true' : 'false',
      ];
      rows.push(row.join(','));
    }
  }

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `second-sun-schedule-${scenario.id}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
