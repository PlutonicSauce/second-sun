# SECOND SUN — Methodology

> **SIMULATED DATA — Hollow is a fictional underground setting.**

This document describes the scheduling model, algorithms, fairness metrics, hard constraints, and explicit limitations of the SECOND SUN engine.

---

## 1. Time Representation

One planning day is divided into **48 half-hour slots**, indexed 0–47:

| Slot index | Wall time |
|---|---|
| 0 | 00:00 |
| 1 | 00:30 |
| … | … |
| 23 | 11:30 |
| 24 | 12:00 |
| … | … |
| 47 | 23:30 |

Overnight windows (e.g. slot 44 → slot 4) are expressed using the `rng(a, b)` helper, which wraps around 47→0. When `a === b` the range is empty.

---

## 2. Energy Accounting

Energy is tracked as **integer watt-minutes (Wm)** to avoid floating-point boundary errors.

```
One slot at P watts  = P × 30  Wm
kWh → Wm             = Math.round(kWh × 60 000)
Wm → kWh             = Wm / 60 000
```

The total assigned energy is the sum of `actualPowerWatts × 30` over all assignments. At every candidate-evaluation step, a proposed assignment is rejected if `usedWm + (P × 30) > budgetWm`.

---

## 3. Peak Power Constraint

For each slot index the engine tracks `slotW[slot]` — the sum of watts for all rooms active in that slot simultaneously. A candidate assignment is rejected if `slotW[slot] + roomWatts > peakW`. This prevents tripping the grid's instantaneous power cap.

---

## 4. Allocation Algorithms

### 4.1 SECOND SUN — Fair Heuristic

> **This is a greedy progressive-filling heuristic. It is NOT a provably globally optimal solver.**

**Outer loop:** Repeat until no feasible assignment can be made:

1. Among all cohorts with `requestedSlots > 0` and remaining need (`got < req`), compute `ratio = got / req` for each.
2. Select the cohort with the **lowest ratio** (most underserved). Ties broken by cohort `id` (lexicographic, deterministic).
3. Among all feasible candidate `(room, slot)` pairs for that cohort, sort by:
   - **Lowest room watts first** (conserve energy)
   - Then **lowest slot contention** (fewest other cohorts also wanting that slot — leaves flexible slots for others)
   - Then **earliest slot index** (predictable, deterministic)
   - Then **room id** (deterministic tie-break)
4. Assign the top candidate if and only if all hard constraints are satisfied.
5. If no feasible candidate exists for the selected cohort, mark it exhausted and retry with the next-lowest-ratio cohort.

**Termination:** Loop exits when every cohort is either satisfied (`got = req`) or exhausted (no feasible slots remain without violating a constraint).

### 4.2 First-Come

Cohorts are served in **input order**. For each cohort, the engine iterates through all feasible candidates (sorted by slot index, then room id) and assigns greedily until the cohort's request is met or no feasible options remain. Later cohorts receive only what energy and room capacity is left.

### 4.3 Directorate _(Illustrative — Fictional)_

> **CLEARLY LABELLED: "Illustrative Directorate Policy (Simulated) — fictional priority rule for comparison only. This does not represent actual government policy or behavior."**

Identical to First-Come, except cohorts are **pre-sorted by habitat `level` ascending** (upper levels like Level 2–4 get served first; deep subterranean infrastructure crews on Level 7–9 are placed at the back of the queue), then by `id` for ties. Same energy, same rooms, same hard physical constraints — only the service order changes. This directly models how administrative hierarchy advantages upper levels while starving deep shaft workers under rationed power.

---

## 5. Feasibility Check

Before any assignment is recorded, all of the following must hold:

| Check | Rule |
|---|---|
| Room not double-booked | `roomUse` set does not contain `"roomId\|slotIndex"` |
| Cohort not double-booked | `cohUse` set does not contain `"cohortId\|slotIndex"` |
| Energy cap | `usedWm + wm(watts) ≤ budgetWm` |
| Peak cap | `slotW[slot] + watts ≤ peakW` |
| Slot in allowed window | `slot ∈ cohort.allowedSlots` |
| Slot not in quiet window | `slot ∉ cohort.quietSlots` |
| Room enabled | `room.enabled === true` |
| Room access | `cohort.id ∈ room.permittedCohortIds` AND `room.id ∈ cohort.permittedRoomIds` |
| Room capacity | `room.capacityPeople ≥ cohort.populationPeople` |

---

## 6. Validation

`validate(scenario, result)` re-checks every hard constraint after the fact and returns an array of violation strings (empty = fully valid). It independently verifies:

- Unknown cohort or room references
- Disabled rooms used
- Assignments outside `allowedSlots`
- Assignments inside `quietSlots`
- Room capacity violated
- Cohort lacks room access
- Room double-booked (`roomId|slotIndex`)
- Cohort double-booked (`cohortId|slotIndex`)
- Assigned slots exceed requested
- Peak power cap exceeded for any slot
- Total energy cap exceeded

---

## 7. Fairness Metrics

| Metric | Definition |
|---|---|
| **minCov** | `min(got / req)` across cohorts with `req > 0` — the worst-served cohort's coverage fraction |
| **avgCov** | `mean(got / req)` across cohorts with `req > 0` |
| **gap** | `maxCov − minCov` — spread of coverage |
| **sessions** | Total assignments made |
| **unmet** | Total requested sessions not fulfilled |
| **kwh** | Total energy used |
| **peakW** | Maximum simultaneous watts observed |
| **personSlots** | Σ (populationPeople × assignedSlots) across all cohorts |

**Preferred-window coverage** is reported separately: the fraction of a cohort's assignments that fall within their `preferredSlots`. These slots are **user-entered planning assumptions** (shift schedules, estimated wake/sleep times) — they are **not** clinical recommendations and do not encode circadian dose targets.

---

## 8. Hard Constraints Enforced (Summary)

- No assignment outside a cohort's `allowedSlots`.
- No assignment in a cohort's `quietSlots`.
- Room must be `enabled`.
- Cohort must have access to the room (bilateral permission check).
- Room capacity must be ≥ cohort population (whole-cohort booking — see §10).
- Each `(room, slot)` pair used at most once.
- Each `(cohort, slot)` pair used at most once.
- Total energy ≤ `budgetWm`.
- Simultaneous watts in any slot ≤ `peakW`.

---

## 9. What This App Does NOT Do

- **No health predictions.** Results are scheduling outcomes, not medical recommendations.
- **No circadian dose calculations.** No melanopic EDI, no CSER, no biological metrics.
- **No CCT-as-proxy.** CCT is not a valid biological proxy for circadian stimulus (see citation [4] in README).
- **No safety/emergency lighting.** Exit routes, emergency egress, and essential task lighting are explicitly excluded from this budget and control plane (see OSHA 1910.37).
- **Preferred slots are planning assumptions, not prescriptions.** Users enter shift and wake/sleep times; the app uses them to report preferred-window hit rate, not to make health claims.

---

## 10. Limitations

| Limitation | Detail |
|---|---|
| **Whole-cohort booking** | A cohort occupies a room for a full slot as a group. Splitting a cohort across multiple rooms in one slot is not modelled. This is a simplification that may underutilise rooms. |
| **One-day horizon** | The scheduler optimises a single planning day. No multi-day carry-over. |
| **No live data** | All inputs are user-entered or preset. No sensor feeds, occupancy sensors, or real-time grid telemetry. |
| **Heuristic, not optimal** | The fair algorithm may not find the globally optimal allocation for every input. A different ordering could occasionally yield a higher minimum coverage. |
| **Deterministic** | Same input always produces the same output. No randomisation or stochastic search. |
| **Integer energy only** | Fractional watt-minute values are rounded at scenario load; this introduces negligible (< 1 Wm) rounding. |
