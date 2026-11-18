# AGENTS.md — SECOND SUN

## Mission
Build a real, testable hackathon application, not another standalone artifact or speculative proposal. SECOND SUN schedules **discretionary access to shared bright-light rooms** in the fictional underground Hollow under rationed power. The core is fair, transparent, hard-constrained scheduling, not a chatbot or a city simulator.

## Read first
1. `CODEX_HANDOFF.md` (current priorities, technical corrections)
2. `PRODUCT_SPEC.md` (full product requirements)
3. `second-sun-engine.js` + `engine-smoke.test.cjs` (working *reference* code, not certified)

If instructions conflict, follow `CODEX_HANDOFF.md` over `PRODUCT_SPEC.md`, unless a higher-priority safety requirement applies.

## Operating principles
- Work inside the SECOND SUN project only. Protect unrelated repos, especially LIFELINE and DigitalGarage.
- Prioritize P0 core functionality and tests. Keep changes small enough to verify; avoid spending the time budget on speculative features.
- Explicitly distinguish measured metrics from synthetic assumptions. No claims of medical outcomes, circadian dose, or actual sensor measurements.
- Never schedule emergency, exit, or essential task lighting as discretionary energy.
- The existing fair scheduler is a **greedy heuristic**, not a provably optimal solver. Do not describe it as globally optimal.
- All three policies, SECOND SUN, first-come, illustrative Directorate, must face the exact same physical and energy constraints.
- Treat the 48 half-hour slots and integer watt-minute accounting carefully; reject invalid input and test overnight windows.
- The provided example has whole-cohort single-room allocation. Respect actual room capacities or explicitly introduce and test splitting.
- Opening scenario must demonstrate a power shortage and a clear human consequence; show cohort shift/wake/sleep and preferred exposure windows as **planning assumptions**, not clinical recommendations.
- Prefer reusable pure TypeScript domain logic, accessible React UI, Vitest tests, and reproducible evidence.
- Report what you actually ran. Do not claim success for unrun tests, deploys, or pushes.

## Git rules
- Inspect `pwd`, `git status`, `git branch --show-current`, `git remote -v`, `git config user.name`, `git config user.email` before writing commits.
- If starting a new project, initialize git; do not alter an unrelated existing repo.
- Use only the owner's already configured Git identity. Never invent or replace name/email and never add AI `Co-authored-by` or other assistant attribution.
- When a milestone is implemented and verified, commit with a clear message. If a *user-authorized* remote is configured, push the correct branch and verify remote SHA. If not, complete local work, and state what's missing, without blocking implementation.
- Do not force-push, reset destructively, or erase an uncommitted change to make the workspace look clean.

## End-of-milestone report
Briefly provide: files/features changed; exact commands and results; tests and limitations; commit SHA and verified push status (or 'no remote'); and the single next highest-value task. Keep `AGENT_HANDOFF.md` updated for the next session.
