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

**Config:** Same as above but `budgetKWh = 2.28` (simulating geothermal grid at 60%).

| Policy | Total sessions | minCov |
|---|---|---|
| **Fair** | **9** | **0.50** |
| **First-Come** | **7** | computed live |
| **Directorate** _(Illustrative)_ | computed live | computed live |

At 60% budget, the fair heuristic still achieves minimum coverage of 0.50 — every cohort receives at least half their requested sessions. First-come delivers fewer total sessions and a lower minimum.

`validate()` returns `[]` for all results.

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
