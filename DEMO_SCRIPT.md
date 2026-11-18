# SECOND SUN — Demo Script

> 60–90 second walkthrough. Narrate while screen-sharing the running app at http://localhost:5173.

---

## Setup (before recording)

1. `npm install && npm run dev`
2. Open http://localhost:5173 in a browser (full screen, no dev-tools visible).
3. Load the **Hollow Level 9** preset.
4. Set policy to **SECOND SUN (Fair)** and budget slider to **60%** (2.28 kWh).
5. Have the **Policy Comparison** view ready to switch to.

---

## Script

### (0 – 15 s) — The Crisis

> *"In the Hollow, Level 9 lost discretionary lighting. The geothermal grid is at 60% — that's 2.28 kilowatt-hours for the day. Four shift groups need access to three shared bright-light rooms. SECOND SUN shows who gets what, and whether the allocation is fair."*

**Action:** Point to the scenario header showing "2.28 kWh / 60%" and the four cohort rows.

---

### (15 – 30 s) — Reading the Timeline

> *"The timeline shows today's allocation. Night Ventilation gets 2 of their 4 requested sessions. Medical Support gets 2 of 3. Some groups have unmet demand — that's the crisis in numbers."*

**Action:** Hover over two or three timeline blocks to show room, slot time, and wattage. Point to the unmet demand column.

---

### (30 – 50 s) — Sliding the Budget

> *"Watch what happens when we change the budget. At 100% — 3.8 kilowatt-hours — all 15 sessions are schedulable. Every group is fully covered. Drop it to 25% — only 3 sessions total. Watch minimum coverage collapse."*

**Action:** 
1. Drag budget slider to **100%** — pause, let results recompute, point to "15 sessions / minCov 1.0".  
2. Drag to **25%** — pause, point to collapsed minCov and the red unmet-demand indicators.

---

### (50 – 70 s) — Comparing Policies

> *"Now compare the three policies side by side: same energy, same rooms, same physical constraints. SECOND SUN — the progressive fair heuristic — achieves 50% minimum coverage, ensuring every shift gets light. First-come lets early requesters grab power. The Directorate policy, an illustrative simulated rule, favors upper administrative levels first (Level 3 Medical gets 100%), leaving Deep Level 9 vent crews with zero light. Same kilowatt-hours, different fairness outcomes. The difference is the algorithm, not the physics."*

**Action:** Switch to the **Policy Comparison** view. Point to the three columns: Minimum Group Coverage, Worst-Served Group, and Level Inequality Gap. Highlight that SECOND SUN guarantees 50% minimum coverage, while Directorate has a +100% inequality gap favoring upper tiers.

> *(Briefly gesture at the Directorate label)* *"The Directorate column is clearly labelled — it's a simulated, illustrative policy for comparison. Not a recommendation."*

---

### (70 – 90 s) — Live Engine & Export

> *"Every number here is computed live by the scheduling engine. Nothing is hardcoded. You can export the full schedule as JSON or CSV, and open the Methodology panel to read the exact constraint definitions and what this app does not claim to do."*

**Action:**
1. Click **Export → CSV** (download triggers).
2. Click **Methodology** tab — scroll past the algorithm section to the "What This App Does NOT Do" heading.
3. End on the app header: *"SECOND SUN — fair access under rationed power."*

---

## Timing Checklist

| Segment | Target |
|---|---|
| Crisis intro | ≤ 15 s |
| Timeline read | 15 s |
| Budget slider | 20 s |
| Policy comparison | 20 s |
| Engine + export close | 20 s |
| **Total** | **≤ 90 s** |
