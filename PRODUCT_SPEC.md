# SECOND SUN — CODEX PRODUCT AND BUILD SPECIFICATION
**Reference document for Codex. Read alongside `CODEX_HANDOFF.md`, which overrides conflicting implementation details.**

## 0. Your role and operating instructions
You are a senior product engineer, optimization engineer, UI designer, and test engineer building a REAL, polished, working hackathon submission called **SECOND SUN** from scratch. The requester wants implementation, not a speculative plan, mockup, static landing page, or long analysis. Continue through all milestones autonomously. Plan briefly, then immediately build and test. Do not pause for approval at every step. If a dependency, API, or deployment capability is absent, choose a simpler working alternative, record the tradeoff, and continue. Never fake execution or results.

**Deadline:** Patriot HackFest Fall 2026 states **Friday, November 20, 2026, 11:00 PM Eastern** as the building/submission deadline, with no extensions. Some wording in the provided brief mislabels weekdays. Prioritize a complete, reliable, demonstrable MVP before optional features. You may use AI tools; the rules say team size 1–4 and prohibit coding during judging. Build from scratch within the event window.

**Repository safety and Git:** This is a NEW project. If working in an existing unrelated project (especially LIFELINE), DO NOT overwrite, repurpose, delete, merge into, or reset it. Create a fresh `second-sun` project folder/repository or use a fresh explicitly designated SECOND SUN repo if one is already open. Before committing, inspect `git status`, branch, remotes, and `git config user.name`/`git config user.email`. Preserve the requester's configured author identity. Do not invent a name/email. Never add `Co-authored-by` trailers naming any assistant. After each completed milestone with passing checks, commit to the appropriate feature branch and push **if an authorized remote is already configured**. Verify the SHA, author, and successful remote push. If no remote/auth exists, keep clean local commits and report exactly what is needed; do not claim a push. Do not rewrite any other repository's history.

**Instruction priority:** Hard safety and mathematical constraints > running real code > correct results > clear explanation > polish > optional features. If time is tight, cut scope, not correctness. No paid APIs, secrets, user account creation, or external services required to run the core demo. No misleading health outcomes. No fabricated benchmarks. No huge 3D environments. No LLM or chatbot feature.

## 1. Product in one sentence
**SECOND SUN is a fairness-aware scheduling app that distributes limited access to communal bright-light rooms among shift-based populations living without natural daylight, while respecting a strict discretionary electricity budget and room constraints.**

### The 20-second hook
In the fictional Hollow, families live underground without sunlight. A handful of communal lighting rooms exist, but power is rationed, and residents work different shifts. Who gets access when power is scarce? SECOND SUN produces a transparent schedule, lets residents/editors explore tradeoffs, and shows how different policies affect energy and access.

### The real-world bridge
Submarines, Antarctic research stations, isolated industrial facilities, windowless workplaces, and emergency shelters can face constrained lighting infrastructure and conflicting schedules. The hackathon demo uses synthetic Hollow data. It is a **decision-support prototype**, not a certified building controller, medical device, or a tested clinical intervention.

### The specific originality claim
Do NOT claim to have invented circadian lighting, lighting optimization, or multi-person scheduling. Existing academic and commercial work covers those areas. Our distinctive, testable product framing is **resource-constrained, transparent, fairness-aware allocation of shared lighting opportunities across differently scheduled cohorts with a clear baseline comparison**. That positioning is modest and defensible.

## 2. Scientific integrity — read before coding
- Human circadian rhythms are influenced by patterns of light and darkness; timing matters. Light is not a medicine that the app can dose accurately based on a simple color slider.
- **Correlated color temperature (CCT/Kelvin) is NOT a valid proxy for melanopic biological effect.** Do not calculate melanopic EDI from CCT alone. Do not claim that 6500 K means therapeutic sunlight.
- The International Commission on Illumination (CIE) uses spectral quantities such as melanopic equivalent daylight illuminance (melanopic EDI), which depend on spectral data and exposure geometry, not just lamp wattage. Our prototype has **no validated spectral/eye-level measurement**. Therefore it must not display calculated melanopic lux, circadian dose, predicted melatonin, predicted sleep improvements, or simulated physiological benefit.
- Instead, operationalize an honest proxy: **a scheduled, user-requested bright-light-room access slot**. Track access coverage, fairness, and electricity consumption. The UI should call these **light-access opportunities** or **requested sessions**, not “clinical circadian treatment.”
- Bright-light-room access should only be allocated in explicitly allowed time windows. They are supplied as planning assumptions by users, not inferred medically. Respect manually entered sleep/quiet periods.
- Life-safety, task-critical, exit, and emergency lighting must NEVER be part of the controllable budget or subject to optimization. The configurable budget is **discretionary room-lighting energy only**. Show this distinction clearly and never recommend shutting off exit lighting.
- Avoid individual health data and diagnoses. Use anonymous **cohorts** (morning shift, night shift, etc.), not medical records.

**Credible reference reading (include links in app methodology and README):**
1. CIE, *Position Statement on Integrative Lighting: Recommending Proper Light at the Proper Time*, 3rd edition (2024): https://www.cie.co.at/publications/cie-position-statement-integrative-lighting-recommending-proper-light-proper-time-3rd
2. Brown et al., *Recommendations for daytime, evening, and nighttime indoor light exposure...*, PLOS Biology (2022): https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.3001571
3. *A circadian-informed lighting intervention accelerates circadian adjustment to a night work schedule in a submarine lighting environment* (2024): https://pubmed.ncbi.nlm.nih.gov/38934353/
4. *Correlated color temperature is not a suitable proxy for the biological potency of light* (2022): https://www.nature.com/articles/s41598-022-21755-7
5. U.S. OSHA, exit-route lighting safeguards (real-world precedent for separating safety lighting): https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.37
6. Prior art / limitation: *Personalized Office Lighting for Circadian Health and Improved Sleep* (2020): https://pubmed.ncbi.nlm.nih.gov/32824032/
7. Prior art / limitation: *A simulation-based framework for multi-individual circadian re-entrainment using a single light schedule* (2023): https://www.sciencedirect.com/science/article/abs/pii/S0360132322011738

Do not quote numeric scientific thresholds as individualized clinical prescriptions. You may discuss research in a clearly labeled educational info panel, separately from the algorithm.

## 3. Precisely what the app does
The app opens directly into an interactive **operations workspace**. A judge should understand the problem in <=15 seconds without reading documentation:

**Top message:** “Light is limited. Access shouldn't be arbitrary.”
**Subline:** “Plan shared bright-light access for residents on different shifts under a strict power budget.”
**Visible interaction:** Change the discretionary energy budget (e.g. 100% / 60% / 25%) and instantly see the schedule, unmet requests, and fairness change. The results MUST come from the real computation engine, not hardcoded breakpoints or visual-only animations.

### Required user journeys
1. Load a realistic, reproducible **Hollow Level 9** synthetic scenario (4 anonymous cohorts, 2–3 shared rooms, contrasting availability/quiet hours, deliberately scarce power). Show initial feasible schedule.
2. Change the daily discretionary lighting energy with slider and exact numeric entry. Recompute and explain constrained tradeoffs.
3. Select a group to inspect its request, assigned sessions, unmet slots, and reason. Select a room to see its 24-hour allocation and power use.
4. Change a group's requested slots, available window, or allowed rooms; recompute and see changed results.
5. Compare **SECOND SUN** versus a plainly described, deterministic **fixed/first-come scheduling baseline** under exactly the SAME constraints and budgets. Show actual output metrics for both and never promise SECOND SUN wins every metric on every input.
6. Reset the scenario; switch to at least one alternate preset: **Mixed shifts** / **Emergency rationing** (or a similar grounded story).
7. Export the actual schedule and assumptions as JSON and CSV (CSV may include per-slot/group assignments); persist editable demo scenarios in browser local storage when feasible. No cloud account.
8. View an approachable “How it works” disclosure that explains its limits. Make every number traceable to real data and the engine.

### Non-negotiable constraints
- No group receives access while its window is unavailable or marked sleep/quiet.
- No group gets more slots than requested.
- No group is booked into two rooms simultaneously.
- No room hosts more than one cohort in a slot.
- A room must be accessible to that cohort and have sufficient capacity.
- The sum of active room power in any slot <= discretionary peak-power cap.
- Total scheduled discretionary room-lighting energy <= the configured daily discretionary energy budget.
- Disabled rooms cannot be allocated.
- Zero budget / no feasible requests yields a clear and accurate empty schedule with explanation, not a crash.
- SAFETY LIGHTING IS UNTOUCHABLE AND EXCLUDED FROM THE APP'S ROOM CONTROL PLANE.

## 4. Data model and time units
Implement with clear, typed, validated domain functions, not UI-level ad hoc calculations. Prefer TypeScript types + Zod (or equivalent) validation.

- One planning day = **48 half-hour slots**, indices 0..47, local wall clock HH:mm. No claim that this models daylight savings transitions. A one-day illustrative planning horizon is adequate.
- `Scenario`: id, title, description, `budgetKWh` (discretionary), `peakKW` (discretionary), `rooms[]`, `cohorts[]`, and assumptions.
- `Room`: id, name, capacityPeople, brightModeWatts (nonnegative), accessibleCohortIds (or cohort permittedRoomIds), enabled. Room power is assumed constant when assigned in the demo, explicitly labeled as a fixture assumption.
- `Cohort`: id, name, populationPeople, `requestedSlots` (integer), `allowedSlots` (set of indices or booleans), `quietSlots` (set), `permittedRoomIds` (set). Optionally include explanatory shift label and location/depth. Do not store personal medical profiles.
- `Assignment`: cohortId, roomId, slotIndex, actualPowerWatts; scheduler output includes validation, total energy, coverage and explanations.
- Model peak load and energy rigorously. One half-hour slot at `P` watts uses `P * 30` watt-minutes; total kWh = total watt-minutes / 60,000. Use integer watt-minutes for accounting to reduce floating-point boundary problems; convert the user budget carefully and compare within documented rounding tolerance. Peak watts are summed across simultaneous active rooms.
- Cohort coverage = `allocatedSlots / requestedSlots` for requestedSlots > 0, capped at 1. Cohorts with zero requested slots should be excluded from fairness denominators and transparently labeled “no request”.
- Fairness metric = **minimum cohort coverage** among cohorts with >0 request. Also show average coverage and the gap between most- and least-served cohorts. If fairness is not definable (no requests), display N/A, not 100%.
- Consider group population explicitly in a separate `personSlotsCovered` metric, not as an excuse to erase small cohorts' minimum access. A session accommodates the entire group only if the room has capacity.

### Example that must make mathematical sense
One room draws 400 W in bright mode, and each session lasts 30 minutes. Therefore **each session costs 0.2 kWh**. Two cohorts each request two sessions (4 sessions total). The available daily budget is **0.4 kWh**, enough for exactly two sessions. A fair assignment gives one to each cohort: 50% request coverage for each. A first-come baseline might give both to the first cohort: 100% vs 0%. This is a toy example for explaining fairness, not an evidence-backed clinical light prescription.

## 5. Scheduler: real algorithm and honest descriptions
Avoid black-box AI suggestions and hardcoded scenario lookup tables. Implement a deterministic, unit-testable **fairness-aware scheduling heuristic** in `src/domain/scheduler` or similar. A heuristic is fine for the hackathon: do NOT call it mathematically globally optimal unless you actually implement and verify an exact solver.

Suggested bounded implementation:
1. Validate and normalize input; compute eligible (cohort, room, slot) candidates; reject invalid/wrong-capacity/quiet/out-of-window options.
2. Maintain live resource occupancy (room-slot, cohort-slot), energy used, and watts in each time slot.
3. **Progressive filling / max-min-fair-inspired assignment:** repeatedly prioritize feasible cohorts with lowest `allocated/requested` coverage; try one additional session using the currently feasible candidate that best matches a transparent tie-breaking policy (e.g. least energy, preferred/earliest eligible slot, stable room/group IDs). Handle empty/infeasible cohorts explicitly. Continue until no request can be served within caps.
4. Optionally implement a bounded local repair/swap pass (only if you have time) to improve minimum coverage without violating hard constraints. It must be tested, deterministic and documented.
5. Compute explanations from actual binding constraints. E.g., “Only 1 of 3 requested sessions could be placed because the remaining eligible slots conflict with room occupancy and the energy cap.” Never invent a single causal explanation if several constraints coexist; express overlapping reasons honestly.
6. Implement a **fixed first-come baseline** with a published deterministic order and the exact same eligibility, capacity, energy, and peak-power constraints. The baseline should genuinely try to fill requests, not be intentionally sabotaged. Show algorithm labels.
7. Instrument fairness, energy kWh, unmet requests, and person-slots for each algorithm. No fictional percentage improvements. Differences come from actual output and should display negative/equal results too.
8. If you later choose an exact small-instance solver and have verified it, that may enhance results; it is NOT required. Prioritize the working heuristic + robust evaluation.

**IMPORTANT:** The words “fair” and “best” are context-sensitive. The UI should say “fairness-aware schedule” or “minimum access coverage” with a definition; do not make moral/legal guarantees. Equal fractions of requested access are a transparent policy choice, not a universal ethical optimum.

## 6. UI / design charter — polished but human
Framework: **Vite + React + TypeScript**, with simple modern CSS or Tailwind if it is correctly configured. Charts: custom accessible SVG or lightweight React primitives, no heavyweight 3D. Validation/test: **Vitest**; add **Playwright** for one or two browser flows if available. Prefer a client-side, locally executed engine so the demo works without a backend or API keys. Deploy to Vercel/Netlify/Cloudflare Pages only if environment already supports it; otherwise provide reproducible build commands.

The product should look like a restrained Apple/Linear-quality utility, not a generic AI-designed hackathon template:
- Clean typography; restrained dark slate / warm amber / neutral daylight palette; consistent spacing; very high contrast and readable charts; avoid neon gradients, floating glass cards, stock photos, giant illustrations, random emojis.
- The initial view must be useful immediately. No splash screen, 3D cave, character/avatar, or “AI powered” marketing page.
- Information hierarchy: problem and available energy -> actual time allocations -> underserved groups -> reasons and comparison.
- Use clear language instead of abstract “circadian optimization score”.
- Core view: 24-hour horizontal half-hour timeline with room rows, labeled cohort assignments and tooltips accessible by keyboard; a compact cohort-coverage panel; a real before/after comparator against baseline; visible editable budget.
- Make night-shift/overnight windows understandable (time wraps at midnight); use 24h labeling as default, optional AM/PM if convenient.
- Slider changes must update calculations; buttons must function; no placebo UI. Do not imply that decorative colors represent a validated spectral distribution.
- Controls editable by keyboard; semantic buttons/labels; proper focus states; contrast; respect reduced-motion; no color-only indicators; meaningful empty states; responsive down to 375 px.
- Provide optional very subtle interaction to communicate lights turning on/off in the timetable, but functionality matters more.
- Keep the product name SECOND SUN and a single restrained identity mark (simple sun/horizon geometry). Do not copy a familiar brand's exact visuals.

Suggested visual layout:
`Header: SECOND SUN | Level 9 Demo | Reset | How it works`
`Headline: Light is limited. Access shouldn't be arbitrary.`
`Top 3 metrics: Scheduled sessions / Lowest group coverage / Energy used vs cap`
`Left: power budget slider + selectable scenario + cohort/room controls`
`Right: 24h room timeline + unmet-access inspection + baseline comparison`
`Footer: Synthetic scenario / research basis / limits / export`.

## 7. Default test scenarios
Create deterministic synthetic fixtures. Explicitly tag **SIMULATED** in UI and README, and avoid presenting it as a real census of the Hollow. Make sure the default has meaningful scheduling competition.

Default: `Hollow Level 9 | rotating shifts`:
- 4 cohorts with clear labels, e.g. Morning maintenance (48 people), Night ventilation (32), Hydroponics (36), Medical support (24). Total example = 140, not necessarily 200; don't promise exactly 200 unless data sums to 200.
- At least 2 rooms; capacities and peak power such that some groups cannot use every room and some time slots conflict.
- Each group has explicit eligible half-hour slots and a simple requested slot count, with some shared prime windows and quiet periods.
- At full power all or most requests can be scheduled if feasible; at lower power, tradeoffs appear visibly.
- Budget defaults must be selected by running the scheduler, not guessed from a visual mockup.
- Additional preset: Emergency rationing (one room disabled and a severely reduced budget) with honest infeasibility explanations.
- Include `Toy fairness example` exactly like Section 4 for teaching/demo.

## 8. Quality gates: tests and evaluation
Add proper unit tests (not placeholders) for:
- Energy conversion 400 W for 30 min = 0.2 kWh; simultaneous peak watt summing.
- No more energy than budget, no more simultaneous watts than peak cap.
- No room/cohort double booking; no quiet-time or unavailable-time scheduling.
- Cohort's requested slot ceiling; room capacity and allowed-room restrictions.
- No allocation to disabled room; zero budget; zero requests; no available slots; insufficient capacity; all rooms disabled.
- Overnight windows/wraparound and exact 48-slot indexing.
- Determinism: identical inputs -> identical output.
- Compare both schedulers under same constraints; ensure results are computed (not constants).
- Toy fairness example: a deterministic scenario where fair method gives both cohorts coverage while baseline can favor first cohort.
- Randomized seeded invariant checks over 100+ feasible/infeasible synthetic scenarios. Assert safety constraints always hold, not that the fair scheduler always beats baseline.
- Test UI flows: opening app, budget change affecting computed metrics, export action, reset action; validate keyboard access if possible.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; fix all failures. If Playwright installed, run e2e. Use a single GitHub Actions CI for lint/typecheck/unit/build when repo is connected.
- Avoid fake green checks. Add at least one independent manual worked example to `EVALUATION.md`.

## 9. Explicit non-goals / scope cuts
DO NOT build sign-in, cloud sync, biosensors, health diagnosis, individual tracking, “optimizing melatonin”, real fixture controls, a full IoT/BACnet/DALI integration, medical thresholds derived from CCT, a digital twin of an underground city, agentic AI, live external data ingestion, or an overly broad humanitarian system.

Stretch goals ONLY after core functionality and tests pass: import scenario JSON with schema validation; shareable URL-encoded scenario; alternate fairness policy toggle with identical caps and carefully explained implications; PWA support; optional validated fixture spectral metadata. Never trade the MVP or time budget for a stretch goal.

## 10. Deliverable structure
Build a complete repo. At minimum:
- `package.json` runnable `dev`, `build`, `preview`, `lint`, `typecheck`, `test` scripts.
- `src/` for UI, domain scheduler, data, metrics, and explanatory components.
- `src/domain/` tests with rich invariant coverage.
- `public/` needed assets only (no wasteful generated stock media).
- `README.md`: quick start, product thesis, synthetic assumptions, tech choices, constraints, demo interaction.
- `METHODOLOGY.md`: model definitions, objective, algorithm, why it is a heuristic, energy math, fairness tradeoff, limitations, scientific sources, no safety-lighting control.
- `EVALUATION.md`: actual tested scenario/baseline results, reproducible commands, tests, failure cases; no invented benchmark.
- `DEMO_SCRIPT.md`: 60–90 second accurate walkthrough.
- `SUBMISSION.md`: 1-paragraph submission description, track problems addressed (#2 power distribution, #11 lack of sunlight), impact, team members placeholder, source/code URL placeholders if unknown; note submission-platform requirements are not yet given in provided brief.
- `AGENT_HANDOFF.md`: what exists, current branch and SHA, tests run, limitations, next practical steps, exactly which commands to start.
- Screenshot(s) from actual rendered product if browser automation is available, with no fake UI-only screenshots.

## 11. Execution plan (DO THIS, don't just recommend it)
### Milestone 0 — Scaffold and actual running app
Initialize fresh React/TS app in new safe location; write synthetic fixture, domain types and validation. Confirm it renders. Commit.

### Milestone 1 — Real decision engine (highest priority)
Build pure, deterministic fairness-aware scheduler and deterministic baseline. Add tested metrics and strict hard constraints. Run invariant tests until green. Commit.

### Milestone 2 — Fully interactive operations UI
Create human-readable, polished workspace. Hook every control to real scenario state and scheduler. Interactive time chart, budget, group inspection, reasons. Ensure mobile layout and keyboard access. Commit.

### Milestone 3 — Comparative evidence and deliverables
Real baseline, policy tradeoffs, export, reset, presets, methodology, evaluation, README, demo script. Test the full experience. Commit.

### Milestone 4 — Final QA and publishing
Run all required checks; do browser smoke test and screenshots if tools are available; evaluate the default vs rationing and toy examples. Fix errors. If configured remote is authorized, push and verify SHA/authorship; if authorized deployment credentials are available, deploy and smoke test live URL. Otherwise report exact remaining steps. Do not claim deployment that did not occur.

**At the end, report only factual outcomes:** what built, how to run, URL if actually deployed, tests with counts/commands, last SHA, whether push succeeded, honest limitations, and one line recommending the next most valuable fix if any.

## 12. Definition of done (acceptance checklist)
- [ ] Launches and builds with no proprietary keys.
- [ ] Judge grasps the dilemma from the first screen.
- [ ] 100% of visible schedules come from algorithm output.
- [ ] Budget and scenario edits demonstrably change allocation and metrics.
- [ ] No safety, capacity, room, timing, peak-power or daily-energy violations.
- [ ] Baseline has same hard caps and is independently reproducible.
- [ ] Every chart number is derived from domain data; no fictional results.
- [ ] Clear simulated-data badge, explanations and scientific limitations.
- [ ] Accessibility and responsive behavior verified.
- [ ] Automated tests, typecheck and build pass.
- [ ] README, methodology, evaluation, demo script, and submission draft included.
- [ ] Git author has only requester's configured identity; no assistant co-authors.
- [ ] Commit(s) created, pushed only if real authorized remote is available, and SHA reported.

**Start building now. Do not return just a plan or ask me what to do next.**
