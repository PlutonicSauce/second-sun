# SECOND SUN — Evaluation

The figures below come from the scheduling engine and describe synthetic scenarios. The same scenario inputs and physical constraints apply to every policy in each comparison.

## Opening scenario

The fictional Hollow has five crews, 152 residents requesting 18 half-hour sessions, and three rooms. The default lighting budget is 1.92 kWh, or 60% of the usual 3.20 kWh. The total peak cap is 1,100 W.

| Policy | Sessions booked | Requests unfilled | Residents with at least one booking | Least-served crew |
|---|---:|---:|---:|---:|
| SECOND SUN | 8 | 10 | 152 | 1 of 3 (33%) |
| Directorate | 6 | 12 | 42 | 0% |
| First-come | 6 | 12 | 42 | 0% |

Directorate and first-come produce the same sequence here because the preset input order already lists upper levels first. They produce different allocations in the separate Hollow fixture in the engine tests.

At 60%, SECOND SUN gives the two deepest crews two sessions each. Directorate gives them zero. Under the generator failure simulation, SECOND SUN goes from 8 to 3 sessions and from 152 to 96 residents with a booking. Trauma & Medical and Deep Ventilation & Sump lose all room time. The budget is 0.80 kWh and the schedule uses 0.675 kWh at a 500 W peak.

The 100% setting means the usual budget is available. With the same 18 requests, SECOND SUN books 14 sessions at that budget.

## Small, reproducible example

One 400 W room and two ten-person crews request two half-hour sessions each. A 0.40 kWh budget supports exactly two sessions. SECOND SUN gives one to each crew. First-come and Directorate give both to the first crew. All plans meet the energy, peak, capacity and occupancy limits.

## Other engine fixtures

| Fixture | SECOND SUN booked | Directorate booked | First-come booked |
|---|---:|---:|---:|
| Hollow Level 9, 3.80 kWh | 15 | 13 | 13 |
| Hollow Level 9, 2.28 kWh | 9 | 7 | 7 |
| Hollow Level 9, 0 kWh | 0 | 0 | 0 |
| Rationing, 1.20 kWh, Central Atrium offline, 600 W peak | 5 | 5 | 5 |

At 2.28 kWh in Hollow Level 9, both baselines book seven sessions, but they reach different crews. Directorate reaches 60 residents in the medical and hydroponics groups. First-come reaches 80 residents in the maintenance and ventilation groups. SECOND SUN reaches all 140 requesting residents, and the least-served crew gets half its requested time. The independent validator returns zero violations for the figures in both tables.

## Verification

- `npm test` covers all three policies, budgets from zero to normal, offline rooms, overnight windows, incorrect room wattage, two-way room permissions and run-sheet consolidation.
- `node --test engine-smoke.test.cjs` checks the JavaScript reference separately.
- `npm run build && npm run test:e2e` exercises the production bundle in Chromium. It checks the opening figures, policy changes, outages, room switches, keyboard and dialog flows, CSV and JSON contents, clipboard text, print layout and 390px mobile layout.

The coverage figures measure scheduled access in the model. Preferred-window counts measure fit to the supplied times. The model has no sensor readings or health outcomes.
