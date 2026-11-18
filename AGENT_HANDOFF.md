# SECOND SUN — Agent Handoff

> Last updated by: docs agent, swarm session Nov 18 2026  
> For: next agent session or human reviewer

---

## Project

| Field | Value |
|---|---|
| **Name** | SECOND SUN |
| **Event** | Patriot HackFest Fall 2026 |
| **Deadline** | November 20, 2026 — 11:00 PM ET |
| **Location** | `/Users/seshank/Documents/second sun/` |

---

## Git Status

- Repository initialized locally.
- Remote: **not yet configured** _(update this if a GitHub remote is added)_.
- Commits made: _(fill in from scaffold agent's commit SHAs)_.
- Branch: _(fill in — expected `main`)_.

To verify:
```bash
cd "/Users/seshank/Documents/second sun"
git log --oneline -10
git remote -v
```

---

## Commands

```bash
# Install
npm install

# Dev server (http://localhost:5173)
npm run dev

# Tests
npm test
# or
npx vitest run

# Production build
npm run build
# output → dist/

# Typecheck only
npm run typecheck

# Lint only
npm run lint
```

---

## Reference Engine (Pre-existing, Node Only)

The original reference implementation remains in the repo root and is NOT part of the Vite/TS build:

```bash
node engine-smoke.test.cjs   # 6 smoke tests — all should PASS
```

These tests document the expected algorithm behaviour and are the source of the numbers in EVALUATION.md.

---

## Current Milestone Status

### Docs (this agent) — COMPLETE
All 6 documentation files written:
- `README.md` — quick start, thesis, stack, constraints, references
- `METHODOLOGY.md` — algorithm detail, constraints, limitations
- `EVALUATION.md` — scenario results with worked example
- `DEMO_SCRIPT.md` — 60–90 s demo walkthrough
- `SUBMISSION.md` — hackathon metadata and checklist
- `AGENT_HANDOFF.md` — this file

### Scaffold Agent — _(fill in from board once reported)_
Expected deliverables:
- `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`
- `src/domain/types.ts` — full TypeScript type definitions
- `src/domain/engine.ts` — TS port of `second-sun-engine.js`
- `src/domain/presets.ts` — `hollow()`, `toy()`, `emergency()` scenario factories
- `src/domain/engine.test.ts` — Vitest suite (all tests passing)
- Status: _(pending)_

### UI Builder Agent — _(fill in from board once reported)_
Expected deliverables:
- `src/App.tsx` and component tree
- Timeline / gantt visualization component
- Policy comparison view
- Budget slider with live recompute
- Export (JSON + CSV)
- Methodology panel
- CSS modules
- Status: _(pending)_

---

## Known Gaps / Open Issues

> _(Fill in from scaffold and ui-builder board posts once available)_

- [ ] Vitest test results not yet confirmed from TS engine (scaffold pending)
- [ ] UI build not yet confirmed (ui-builder pending)
- [ ] No public deployment URL yet

---

## Highest Priority Next Task

**Deploy to Vercel or Netlify** for a public demo URL.

Steps:
1. User pushes repo to GitHub (requires configuring git remote).
2. User connects GitHub repo to Vercel/Netlify (one-click via their dashboard).
3. Build command: `npm run build`, output dir: `dist`.
4. No environment variables needed (pure client-side).
5. Add the resulting URL to `SUBMISSION.md` before submitting.

---

## Constraints Reminder

- Do NOT schedule emergency/exit/essential lighting as discretionary.
- The fair scheduler is a **greedy heuristic** — do not describe it as globally optimal.
- All three policies must face the identical physical and energy constraints.
- Preferred slots are user-entered planning assumptions, not clinical recommendations.
- Do not add AI co-author attribution to git commits. Use only: Seshank Mallireddigari / seshank0830@gmail.com.
- Protect unrelated repos (LIFELINE, DigitalGarage).
