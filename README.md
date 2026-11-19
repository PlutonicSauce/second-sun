# SECOND SUN

SECOND SUN schedules access to shared bright-light rooms in the Hollow, a fictional underground settlement experiencing geothermal rationing. It compares allocation policies and produces a day plan for a shift lead. Built for Patriot HackFest Fall 2026, Life Underground.

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The app runs entirely in the browser.

## Use the planner

1. Start at 60% of the usual lighting budget. The overview separates residents with at least one booking from the number of half-hour requests filled.
2. Switch between **SECOND SUN**, **Directorate** and **First-come** to compare crew access under the same limits.
3. Change the budget or take rooms offline. **Simulate generator failure** applies a 0.80 kWh ceiling. The comparison uses the current room settings and policy on both sides. Ending the simulation returns to your current baseline budget.
4. Open **View run sheet** for the active room bookings and peak load. Print the schedule, download CSV or JSON, or copy a shift handover.

The app uses one bundled fictional scenario. It models one 24-hour planning day and books each crew together in a room large enough to hold it. Schedule edits live in the current browser session. Shift, quiet and preferred times are synthetic planning inputs. Emergency, exit and essential task lighting are outside the model.

## Maintain and verify

- `src/domain/presets.ts` defines the scenario inputs. Update these to model other rooms or crews.
- `src/domain/engine.ts` contains common constraints, the three scheduling policies and independent assignment validation. SECOND SUN uses a deterministic greedy heuristic.
- `src/domain/runsheet.ts` combines adjacent bookings for the display and handover. `src/utils/export.ts` handles the downloads.

```sh
npm run typecheck
npm run lint
npm test
node --test engine-smoke.test.cjs
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser checks serve the built bundle locally and write screenshots into a temporary directory. Set `SECOND_SUN_SCREENSHOTS` to choose another destination.

[Methodology](./METHODOLOGY.md) · [Evaluation](./EVALUATION.md) · [Demo script](./DEMO_SCRIPT.md) · [Submission draft](./SUBMISSION.md)
