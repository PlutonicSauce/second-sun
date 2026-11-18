# SECOND SUN — Handoff to Codex

## Task
Build a **real, runnable, tested SECOND SUN hackathon app** from the attached source. Work directly in the current local filesystem, not in a Claude.ai artifact. Do not stop after planning.

Inputs in this handoff:
- `second-sun-engine.js`: extraction of the user's current JavaScript scheduling engine; treat as reference implementation, not independently certified software.
- `engine-smoke.test.cjs`: runnable smoke tests that establish expected prototype behaviors. Run `node --test engine-smoke.test.cjs` before porting.
- `PRODUCT_SPEC.md`: full product and implementation requirements. Treat this handoff's corrections as overriding any conflict.

## Environment: do not block implementation on GitHub or hosting
1. Inspect the current directory. Create a fresh `second-sun/` Vite + React + TypeScript app if necessary. Do not touch unrelated repos.
2. A git remote and deploy target are **optional**, not prerequisites for coding. Initialize git locally if needed; never invent git name/email. Commit only if git identity exists and is the user's configured identity. Push only if an authorized remote exists and authentication works. If unavailable, finish the local app and report the missing external step without claiming success.
3. Implement, run, test, and create a production build in the current workspace.

## The product we actually want
This is NOT just a booking calendar. In the Hollow, electricity is rationed and people have no natural daylight. SECOND SUN gives communities a way to **allocate limited access to shared artificial-daylight rooms** across groups on conflicting work/sleep schedules. It connects directly to Life Underground challenge #11 (life without sunlight) and #2 (unfair electricity allocations), and responds to a power shortage. Do not claim blackout prediction.

The opening screen must say, in everyday language:
- What happened: geothermal power shortage; discretionary lighting budget cut.
- Who is affected: named resident groups, shifts, levels, and access needs.
- What SECOND SUN did: compute a feasible proposed allocation.
- What changed: compare the same physical constraints to a clearly defined illustrative Directorate policy and a first-come baseline.

Default launch should show a **real shortage**, not 100% coverage. For the supplied Hollow preset, 60% of the 3.8-kWh full-demand budget is 2.28 kWh. This prototype yields 9/15 sessions for the fair heuristic versus 7/15 for first-come; recompute these in the port, don't hardcode them.

## Essential engineering corrections
1. **Do not call the existing scheduler mathematically optimal.** Its `fair` mode is a deterministic greedy progressive-filling heuristic, not a proved global max-min solver. Either honestly label it a heuristic or implement and verify a bounded optimizer. Never assert fairness superiority for every possible scenario.
2. **Fix input validation.** Reject invalid slot indices, noninteger/negative requests, nonpositive room sizes/watts, duplicate IDs, negative/NaN budgets, invalid peak caps, and malformed allowed/quiet windows before calling the engine. `rng(a,b)` currently can loop forever for invalid endpoints. Do not trust unvalidated user input.
3. **Strengthen independent output validation.** Ensure assignment wattage equals the actual room wattage; each assigned slot is an integer in `[0,47]`; keys have an unambiguous separator; all room/time, group/time, budget, peak, access, and capacity constraints hold. Add failure tests that intentionally corrupt assignments and verify they are rejected.
4. **Model cohort capacity honestly.** The prototype books a whole cohort in one room and rejects rooms smaller than the cohort. Document this simplification prominently. Never imply a 48-person cohort fits into a 30-person room. Optional cohort splitting only if fully implemented and tested.
5. **Do not confuse available hours with beneficial timing.** A group may be physically available during its `allowed` window, but that does not prove the slot is useful for its daily rhythm. Add separate user-editable preferred exposure windows based on shift/wake-time planning assumptions. Show preferred-window coverage as a planning metric, not measured biological impact. Do not infer clinical recommendations from clock time alone.
6. **Design an honest Directorate baseline.** Clearly document a deterministic illustrative priority rule, e.g. upper levels first, then fixed order; keep exactly the same energy budget, rooms, allowed hours, capacity, and requested sessions for ALL policies. Do not rig constraints or invent secret government behavior. Mark fictional policy assumptions as simulated.
7. **Keep safety lighting separate.** The engine schedules only discretionary bright-light-room power. Never reduce exit/task/emergency lighting to make the numerical result look good.
8. **Use the actual solver for every displayed figure.** Do not invent impact/sleep improvements, calculate 'circadian dose' from watts, or label a booking as therapy.
9. **Make it accessible and genuinely usable.** Interactive 48-slot timeline; adjustable power; edit cohorts' shifts, preferred windows, eligibility, and room settings; inspect allocation explanations; clearly compare policies; export JSON/CSV; all controls keyboard accessible, responsive, understandable on first view.

## Scope and build priorities
P0: TypeScript domain model, reliable validation + tests, working scheduling, real shortage, baseline comparison, human-readable scenario, running app.
P1: excellent UI hierarchy, interactivity, explanatory details, evidence/evaluation page, exports, keyboard support, docs, production build.
P2: aggregate optional wellness self-reports, extra scenarios, decorative polish. Skip P2 if deadline pressure.

Do not build user accounts, network services, chatbots, fake health-risk numbers, speculative 3D city, or an elaborate backend.

## Suggested acceptance checks
- Smoke tests run before changes; TypeScript port agrees with reference outputs on the three preset fixtures, or differences are explicitly explained.
- At 60% budget the default scenario has unsatisfied demand; recomputation is live.
- No assignments violate room/peak/daily energy/occupancy/quiet-time/eligible-slot constraints.
- All three policies use identical scenario inputs and constraints.
- No misleading '100% fair' claim when some group has zero coverage.
- Export exactly matches the displayed schedule.
- `npm test`, `npm run build` pass; document what ran and what remains unverified.
- Create README, METHODOLOGY, EVALUATION, DEMO_SCRIPT, SUBMISSION with working commands and candid limitations.
- Inspect `git config user.name`, `git config user.email`, `git status`, branches and remotes. Keep user-only attribution; no `Co-authored-by` trailers. Commit/push only where safely configured; provide SHA and verification.

## Deliverable
A functioning local app and the checks above, not another explanation of why coding is impossible. The hackathon brief states a no-extension deadline of Friday, Nov 20, 2026 at 11:00 PM ET. Confirm submission details on the organizer portal; do not interpret the mistaken Saturday label as extra time. Focus on delivering a working, trustworthy, judge-friendly experience in the remaining time.
