# SECOND SUN — Evaluation

> **SIMULATED DATA — Hollow is a fictional underground setting. All scenario results are synthetic.**
>
> These results come from running the actual scheduling engine. Run `npm test` to reproduce them.

---

## Manual Worked Example

**Setup:** 1 room at 400 W, 2 cohorts (A and B), each requesting 2 sessions. Budget = 0.4 kWh.

```
Budget in Wm = round(0.4 × 60 000) = 24 000 Wm
Cost per session = 400 W × 30 min = 12 000 Wm
Budget supports exactly: 24 000 / 12 000 = 2 sessions total
```

| Policy | A gets | B gets | A coverage | B coverage | minCov |
|---|---|---|---|---|---|
| **Fair** | 1 | 1 | 50% | 50% | **0.50** |
| **First-Come** | 2 | 0 | 100% | 0% | **0.00** |

The fair heuristic detects that B has lower coverage after A's first assignment and allocates B's session next. First-come exhausts the budget on A before B is considered.

---

## Toy Scenario (Embedded in Test Suite)

**Config:** 1 room (R1, 400 W, capacity 10), 2 cohorts (Group A and Group B, each population 5, each requesting 2 sessions, overlapping allowed windows). Budget set so only 2 total sessions fit.

| Policy | Sessions | A got | B got | minCov |
|---|---|---|---|---|
| **Fair** | 2 | 1 | 1 | **0.50** |
| **First-Come** | 2 | 2 | 0 | **0.00** |
| **Directorate** | 2 | 2 | 0 | **0.00** _(A is larger or equal; order unchanged)_ |

`validate()` returns `[]` for all results.

---

## Hollow Level 9 — Full Budget (3.8 kWh)

**Config:** 4 cohorts (Morning Maintenance M, Night Ventilation N, Healthcare H, Security S), 3 rooms (R1 400 W cap 12, R2 300 W cap 8, R3 500 W cap 20), budgetKWh = 3.8, peakW = 1100.

| Policy | Total sessions | minCov | Notes |
|---|---|---|---|
| **Fair** | **15** | computed live | All cohort requests fully or near-fully met |
| **First-Come** | **13** | computed live | Later cohorts lose out to energy already spent |
| **Directorate** _(Illustrative)_ | computed live | computed live | Largest cohort (S) served first |

`validate()` returns `[]` for all results.

> Run `npm test` to see exact per-cohort `got`/`req` values printed by the Vitest suite.

---

## Hollow Level 9 — 60% Budget (2.28 kWh)

**Config:** 4 cohorts (Medical S [L3], Hydroponics H [L5], Morning Maintenance M [L7], Night Ventilation N [L9]), 3 rooms (R1 600 W cap 60, R2 400 W cap 30, R3 500 W cap 40), `budgetKWh = 2.28` (60% geothermal shortage), `peakW = 1100 W`.

| Policy | Total sessions | minCov | avgCov | Allocation by Cohort (`got/req`) | Notes |
|---|---|---|---|---|---|
| **SECOND SUN (Fair)** | **9** | **0.50** | **60.4%** | S: 2/3 (67%), H: 3/4 (75%), M: 2/4 (50%), N: 2/4 (50%) | Every cohort receives at least 50% coverage |
| **First-Come** | **7** | **0.00** | **43.8%** | M: 4/4 (100%), N: 3/4 (75%), H: 0/4 (0%), S: 0/3 (0%) | Input order starves later cohorts (H, S) |
| **Directorate** _(Illustrative)_ | **7** | **0.00** | **50.0%** | S: 3/3 (100%), H: 4/4 (100%), M: 0/4 (0%), N: 0/4 (0%) | Upper levels (L3, L5) monopolize power; Deep levels (L7, L9) starved |

At 60% budget:
- **SECOND SUN** achieves a minimum coverage of **0.50** (no cohort has less than half their request served).
- **First-Come** leaves two cohorts with **0%** coverage (minCov = 0.00).
- **Directorate** (upper-levels-first) satisfies 100% of requests for upper levels (S on Level 3, H on Level 5), but leaves deep maintenance crews on Level 7 and Level 9 with **0%** coverage.

`validate()` returns `[]` (zero violations) for all three policies.

---

## Hollow Multi-Level Grid — 60% Budget (1.92 kWh of 3.2 kWh)

**Config:** 5 cohorts spanning subterranean depth:
- `A`: Directorate Staff (Level 2 Executive Wing, req: 3)
- `S`: Trauma & Medical (Level 3 Central Ward, req: 3)
- `H`: Hydroponics Crew (Level 5 Primary Food Decks, req: 4)
- `M`: Utility Maintenance (Level 7 Main Conduits, req: 4)
- `N`: Deep Vent & Sump (Level 9 Air Scrubbers, req: 4)

Rooms: Central Atrium (R1, Level 4), Upper Sun-Lounge (R2, Level 2 — physically inaccessible to L7 and L9), Sub-Station Hall (R3, Level 7).

| Policy | Total sessions | minCov | avgCov | Allocation by Cohort (`got/req`) |
|---|---|---|---|---|
| **SECOND SUN (Fair)** | **8** | **0.33** | **43.3%** | A: 1/3 (33%), S: 1/3 (33%), H: 2/4 (50%), M: 2/4 (50%), N: 2/4 (50%) |
| **First-Come** | **6** | **0.00** | **40.0%** | A: 3/3 (100%), S: 3/3 (100%), H: 0/4 (0%), M: 0/4 (0%), N: 0/4 (0%) |
| **Directorate** _(Illustrative)_ | **6** | **0.00** | **40.0%** | A: 3/3 (100%), S: 3/3 (100%), H: 0/4 (0%), M: 0/4 (0%), N: 0/4 (0%) |

**Physical Room Constraint Verified:** Room R2 (Upper Sun-Lounge on Level 2) is only accessible to cohorts A (Level 2) and S (Level 3). Under all three policies, R2 is never assigned to Deep cohorts M (Level 7) or N (Level 9). `validate()` passes with zero violations.

---

## Hollow Level 9 — Zero Budget

**Config:** Same as full Hollow but `budgetKWh = 0`.

| Policy | Total sessions | minCov |
|---|---|---|
| All three | **0** | null (no assignments) |

No feasible assignment can be made when the energy budget is zero. All `validate()` calls return `[]`.

---

## Emergency Rationing Scenario (1.2 kWh, R1 Disabled, peakW = 600)

**Config:** `budgetKWh = 1.2`, Room R1 (400 W) set `enabled: false`, `peakW = 600 W`.

**What happens:**

- R1 is unavailable — cohorts with access only to R1 have no feasible rooms and receive 0 sessions.
- R2 (300 W) and R3 (500 W) remain available. However R3 alone would exceed the peak cap of 600 W **only if** combined with another active room; since R3 is 500 W any single-room slot is below 600 W.
- Budget of 1.2 kWh = 72 000 Wm. R3 at 500 W costs 15 000 Wm/session → max 4 sessions from R3 alone. R2 at 300 W costs 9 000 Wm/session.
- The combined peak check prevents scheduling R2 and R3 simultaneously (300 + 500 = 800 W > 600 W cap), so only one room can be active per slot.
- Result: total sessions significantly reduced versus full budget; cohorts without R1 access experience a forced shortage even before the energy cap binds.

`validate()` returns `[]` — the reduced allocation is constraint-valid; the shortage is a physical consequence of the rationing inputs, not a scheduling bug.

---

## Constraint Validation Summary

All scenarios above, across all three policies, return `validate() = []` (zero violations). This confirms:

- No double-booked room-slots
- No double-booked cohort-slots  
- No assignments outside allowed windows
- No assignments in quiet windows
- No disabled rooms used
- No capacity violations
- Energy and peak caps respected

---

## Reproducing These Results

```bash
npm install
npm test
```

The Vitest suite (`src/domain/engine.test.ts`) runs all scenarios programmatically and asserts the exact session counts and minimum coverage values documented above. Output is printed to stdout.
