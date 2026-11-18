# SECOND SUN — Start here in Codex

**Hackathon:** Patriot HackFest Fall 2026, Life Underground track. **Deadline:** Friday, November 20, 2026, 11:00 PM Eastern, no extensions (the event document accidentally describes November 20 as Saturday elsewhere). Coding during the judging period is prohibited.

## What you're building
A real application that fairly distributes access to shared artificial-daylight rooms between groups of underground residents with different work and sleep schedules, under a strict power budget. The major constraints are room capacity, 48 half-hour time slots, quiet hours, room eligibility, daily discretionary energy, and peak power. It must be useful and inspectable, not just a dashboard.

## Files
- `CODEX_START_PROMPT.md`: copy the prompt into Codex to begin.
- `AGENTS.md`: project-wide directions Codex can read on subsequent turns.
- `CODEX_HANDOFF.md`: technical gaps and the priorities that supersede the product spec.
- `PRODUCT_SPEC.md`: detailed scope, architecture, science cautions, design, evaluation, and build plan.
- `second-sun-engine.js`: reference JS solver extracted from the Claude Artifact.
- `engine-smoke.test.cjs`: reference behavior tests, run with `node --test engine-smoke.test.cjs`.

## How to use
1. Extract this archive into a **new empty `second-sun` folder**, not into the unrelated LIFELINE repo.
2. Open the extracted folder as the workspace in the Codex app, CLI, or IDE extension.
3. Paste `CODEX_START_PROMPT.md` into Codex.
4. The agent should first run the reference smoke tests, then scaffold the TypeScript app. It can code locally before any GitHub remote or deployment credentials exist.
5. When it has a working application, create/connect an authorized GitHub repository and deployment target, then have Codex push/deploy and verify. Do not introduce a brand new host if it puts the deadline at risk.

## Acceptance before calling it done
- You can run `npm install`, `npm run dev`, `npm test`, `npm run build`.
- The first view explains why Level 9 lost discretionary light and shows **unmet demand**.
- Changing the energy cap re-computes real schedules and accurate metrics.
- The three comparison policies obey identical constraints. Scores and conclusions are drawn from executed code, not hand-entered values.
- Groups have meaningful shift/sleep/preferred exposure planning windows; no fake clinical benefits or unsafe lighting control.
- Exports, tests, accessibility basics, documentation, and honest limits are present.
