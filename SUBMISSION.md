# SECOND SUN — Submission

## Hackathon Metadata

| Field | Value |
|---|---|
| **Event** | Patriot HackFest Fall 2026 |
| **Deadline** | November 20, 2026 — 11:00 PM ET |
| **Track** | Life Underground |
| **Challenges addressed** | #2 — Unfair electricity allocation; #11 — Life without sunlight |
| **Project name** | SECOND SUN |
| **Tech stack** | Vite 6, React 19, TypeScript 5, Vitest 2 |
| **Backend** | None (pure client-side computation) |
| **Source URL** | https://github.com/PlutonicSauce/second-sun |
| **Team** | Seshank Mallireddigari |

---

## Description

SECOND SUN is a fairness-aware scheduling tool that distributes limited access to shared bright-light rooms among shift-working underground residents under a strict discretionary electricity budget. It computes transparent, constraint-satisfying allocations using a greedy progressive-filling heuristic, compares three allocation policies (fairness-aware, first-come, illustrative Directorate) under identical constraints, and shows exactly who is underserved and why. All results come from the actual scheduling engine — no hardcoded values. Built with Vite + React + TypeScript.

---

## What Makes It Distinct

- **Hard constraints, not approximations.** Energy budget, instantaneous peak power, room capacity, cohort access permissions, and time-window restrictions are all enforced simultaneously. Invalid inputs are rejected; every output passes `validate()`.
- **Policy comparison.** Three allocation strategies run against identical inputs. The gap in minimum coverage between policies is the core visual argument.
- **Transparent heuristic.** The algorithm is described exactly: a greedy progressive-filling heuristic, not a claimed optimal solver. Limitations are documented in-app and in METHODOLOGY.md.
- **No medical claims.** Preferred slots are user-entered planning assumptions. The app makes no circadian or health predictions.

---

## Submission Checklist

- [x] Replace team member placeholder with actual names
- [x] Add GitHub repository URL
- [ ] Confirm submission platform URL and form requirements
- [ ] Verify `npm run build` produces a clean production bundle
- [ ] Deploy to Vercel or Netlify for a public demo URL (see AGENT_HANDOFF.md)
- [ ] Attach demo video (60–90 s, see DEMO_SCRIPT.md)
- [ ] Attach this SUBMISSION.md or paste description into submission form

---

> _Submission platform requirements to be confirmed by the team._
