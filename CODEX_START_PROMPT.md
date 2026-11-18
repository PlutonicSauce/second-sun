# CODEX START PROMPT — SECOND SUN

Build the complete SECOND SUN hackathon app in THIS local workspace. The project is transitioning from a Claude Artifact prototype to Codex. Do not use the artifact URL as source code; the actual reference implementation and tests are already in this folder.

## First actions, in order
1. Read `AGENTS.md`, `CODEX_HANDOFF.md`, and `PRODUCT_SPEC.md` completely. The handoff overrides conflicts in the older spec.
2. Inspect the present workspace before changing files (`pwd`, top-level listing, `git status`, branch/remotes if git exists, and user.name/email). Do not touch unrelated projects. Do not invent Git identity.
3. Run `node --test engine-smoke.test.cjs` on the reference JS engine. Report the actual outcome. Read `second-sun-engine.js` as a baseline, not as certified correct software.
4. Set up Vite + React + TypeScript in this workspace, separating a pure `src/domain` scheduling engine from UI. Port the reference implementation and add strict input / independent output validation and Vitest tests.
5. Implement the usable interactive application; test, inspect, and fix it. Do not stop after planning, produce another Claude artifact, or ask for unnecessary approvals.

## Product priorities and guardrails
- P0: working scheduler, valid constraints, reliable fair heuristic and independent validator, cohort shift/sleep/preferred exposure planning windows, three comparable allocation policies (SECOND SUN / first-come / *illustrative* Directorate), a real default shortage scenario, functional timeline and power controls, reproducible tests.
- P1: excellent readable UI, group inspection and plain-language allocation reasons, fair comparison under **identical** constraints, responsive/keyboard-accessible flow, actual JSON/CSV exports, docs (`README`, `METHODOLOGY`, `EVALUATION`, `DEMO_SCRIPT`, `SUBMISSION`).
- P2: optional aggregate wellness self-reports and extra polish only if P0/P1 are done and tested.

**Crucial:** No health-effect predictions. Energy watts cannot be converted to circadian biological dose. `allowed` slots are availability only, not evidence of biologically appropriate timing. Add explicit preferred windows as configurable assumptions, not clinical recommendations. Preserve safety/exit/task lighting separately from any discretionary budget. Whole cohorts cannot fit in rooms smaller than their population. The prototype 'fair' solver is a greedy heuristic, not mathematically optimal; either improve its guarantee with proof/tests or honestly label it.

The launch scenario MUST show a meaningful shortage, not 15/15 booked. For the original Hollow reference fixture, 2.28 kWh represents 60% of 3.8 kWh; the reference engine schedules 9/15 vs 7/15 under first-come. These are reference fixture expectations only, never hardcode results in the UI or assume they remain true after model changes.

## Runtime and Git requirements
- Keep the app runnable without secrets or paid APIs.
- Run and report `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` when available; run a browser smoke check if possible.
- Once a complete milestone passes tests, commit it using **only the configured user's Git identity**. No AI coauthor trailer. Push to an appropriate authorized remote only if already present or explicitly established; verify the remote commit. No remote? Complete local implementation and report that, don't stall.
- Keep a concise `AGENT_HANDOFF.md` with repo status, implemented scope, commands verified, known gaps, and next action so work can continue in a new context window.
- Avoid overly broad changes or extra agent runs: prioritize the smallest reliable release before deadline.

When you finish, tell me exactly what exists, how to run it, what was tested, actual SHA/push/deploy status, known limitations, and the single highest-priority remaining task. Start implementing now.
