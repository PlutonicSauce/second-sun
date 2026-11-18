# SECOND SUN

> **SIMULATED DATA — Hollow is a fictional underground setting. All scenarios, cohorts, and results are synthetic.**

A fairness-aware scheduler for shared bright-light room access under rationed discretionary electricity. Built for Patriot HackFest Fall 2026 — Track: Life Underground.

---

## Quick Start

```bash
npm install
npm run dev      # → http://localhost:5173
npm test         # → Vitest unit + integration suite
npm run build    # → production bundle in dist/
```

No backend. No database. All computation runs in-browser via the TypeScript domain engine.

---

## Product Thesis

Underground residents on shift schedules need access to shared rooms with tunable bright lighting. During a power shortage, demand exceeds supply. SECOND SUN answers: **who gets access to which room, in which time slots, within a hard energy budget — and is that allocation fair?**

The app computes three allocation policies under identical hard constraints and lets users compare them in real time:

| Policy | Description |
|---|---|
| **SECOND SUN (Fair)** | Greedy progressive-filling heuristic that maximises minimum cohort coverage |
| **First-Come** | Cohorts served in input order; first to request fills first |
| **Directorate** _(Illustrative)_ | Largest-population cohort is served first — fictional priority rule for comparison only |

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Bundler | Vite 6 | Fast HMR, zero-config TS |
| UI | React 19 + TypeScript 5 | Component model, type safety |
| Styling | CSS Modules | No build-time dependency on a UI framework |
| Tests | Vitest 2 | Native ESM, same config as Vite |
| Backend | **None** | Engine is pure TS; no server needed |

---

## Constraints & Assumptions

- **Synthetic data only.** No real residents, no real sensor measurements.
- **One planning day** = 48 half-hour slots (indices 0–47, midnight to midnight).
- **Energy budget** is for *discretionary* access lighting only. Emergency, exit, and essential task lighting are **excluded** from this budget and control plane.
- **Whole-cohort room booking.** A cohort books a room for a slot as a group; splitting across rooms is not modelled (documented limitation).
- **Preferred slots** are user-entered planning assumptions (shift schedules, wake/sleep times). They are **not** clinical prescriptions or circadian dose calculations.
- The fair scheduler is a **greedy heuristic**, not a provably globally optimal solver.
- CCT (colour temperature) is **not** used as a biological proxy. See citation [4] below.

---

## Interaction Summary

1. **Pick or customise a scenario** — set rooms, cohorts, energy budget, peak power cap.
2. **Run all three policies** — results appear side-by-side on the timeline.
3. **Adjust the budget slider** — watch allocations recompute live.
4. **Inspect fairness metrics** — minimum coverage, average coverage, gap, preferred-window hit rate.
5. **Export** the full schedule as JSON or CSV.
6. **Read the Methodology panel** in-app for constraint definitions and disclaimers.

---

## Further Reading

- [METHODOLOGY.md](./METHODOLOGY.md) — Algorithm details, constraint definitions, limitations
- [EVALUATION.md](./EVALUATION.md) — Tested scenario results (reproduce with `npm test`)
- [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) — 60–90 s walkthrough for the demo video
- [SUBMISSION.md](./SUBMISSION.md) — Hackathon submission metadata

---

## Scientific References

The following publications informed the framing of bright-light access as a scheduling problem for shift-working populations. **This app does not perform circadian or biological calculations.**

1. CIE Position Statement — Integrative Lighting: Recommending Proper Light at the Proper Time (3rd ed.)  
   <https://www.cie.co.at/publications/cie-position-statement-integrative-lighting-recommending-proper-light-proper-time-3rd>

2. Harding et al. (2023) — Recommendations for Daytime, Evening, and Nighttime Indoor Light Exposure to Best Support Physiology, Sleep, and Wakefulness in Healthy Adults. *PLOS Biology.*  
   <https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.3001571>

3. Blume et al. (2024) — Shift Work and Light Exposure. *PubMed* (PMID 38934353).  
   <https://pubmed.ncbi.nlm.nih.gov/38934353/>

4. Kruithof et al. (2022) — CCT is not a valid proxy for circadian stimulus. *Scientific Reports.*  
   <https://www.nature.com/articles/s41598-022-21755-7>

5. OSHA 1910.37 — Maintenance, Safeguards, and Operational Features for Exit Routes (emergency lighting context).  
   <https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.37>
