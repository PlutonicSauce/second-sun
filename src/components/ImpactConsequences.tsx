import React from 'react';
import type { Scenario, ScheduleResult } from '../domain/types';

interface ImpactConsequencesProps {
  scenario: Scenario;
  result: ScheduleResult;
  selectedCohortId: string | null;
  onSelectCohort: (cohortId: string | null) => void;
}

export const ImpactConsequences: React.FC<ImpactConsequencesProps> = ({
  scenario,
  result,
  selectedCohortId,
  onSelectCohort,
}) => {
  const cohortsWithStats = scenario.cohorts.map(c => {
    const got = result.got[c.id] ?? 0;
    const req = c.requestedSlots;
    const pct = req > 0 ? Math.round((got / req) * 100) : 100;
    const personSlots = got * c.populationPeople;
    const why = result.why[c.id] ?? 'Accommodated under policy constraints.';
    return { ...c, got, req, pct, personSlots, why };
  });

  const fullyAccommodated = cohortsWithStats.filter(c => c.got >= c.req && c.req > 0);
  const partiallyAccommodated = cohortsWithStats.filter(c => c.got > 0 && c.got < c.req);
  const unserved = cohortsWithStats.filter(c => c.got === 0 && c.req > 0);

  // Upper vs Deep
  const upper = cohortsWithStats.filter(c => c.level <= 4);
  const deep = cohortsWithStats.filter(c => c.level >= 7);

  const upperReq = upper.reduce((a, c) => a + c.req, 0);
  const upperGot = upper.reduce((a, c) => a + c.got, 0);
  const upperPct = upperReq > 0 ? Math.round((upperGot / upperReq) * 100) : 100;

  const deepReq = deep.reduce((a, c) => a + c.req, 0);
  const deepGot = deep.reduce((a, c) => a + c.got, 0);
  const deepPct = deepReq > 0 ? Math.round((deepGot / deepReq) * 100) : 0;

  const gap = upperPct - deepPct;
  const formattedGap = gap > 0 ? `+${gap}%` : `${gap}%`;

  return (
    <section className="impact-consequences-section" aria-label="Access Consequences and Unmet Demand">
      <div className="section-header-block">
        <span className="section-eyebrow">EQUITY AUDIT & UNMET DEMAND ANALYSIS</span>
        <h2 className="section-title">Who Received Artificial Daylight, and Who Did Not?</h2>
        <p className="section-subline">
          Under energy rationing, every dropped session represents real people deprived of artificial sunlight. Review accommodating status and binding solver constraints below.
        </p>
      </div>

      {/* Level Inequality Banner */}
      <div className="tier-equity-card">
        <div className="tier-col">
          <span className="tier-name">Upper Sectors (Levels 2–4)</span>
          <span className="tier-val">{upperPct}% Accommodated</span>
          <span className="tier-sub">{upperGot} of {upperReq} sessions placed</span>
        </div>

        <div className="tier-divider" />

        <div className="tier-col">
          <span className="tier-name">Deep Infrastructure (Levels 7–9)</span>
          <span className="tier-val">{deepPct}% Accommodated</span>
          <span className="tier-sub">{deepGot} of {deepReq} sessions placed</span>
        </div>

        <div className="tier-divider" />

        <div className="tier-col">
          <span className="tier-name">Level Inequality Gap</span>
          <span className="tier-val">{formattedGap}</span>
          <span className="tier-sub">Upper vs Deep tier variance</span>
        </div>
      </div>

      {/* Grouped Cohort Status Cards */}
      <div className="consequences-grid">
        {/* Partially Accommodated */}
        <div className="consequence-group-card">
          <div className="group-card-header header-partial">
            <span className="group-card-title">Partially Accommodated ({partiallyAccommodated.length})</span>
            <span className="group-card-badge badge-partial">Rationed Access</span>
          </div>

          <div className="group-list">
            {partiallyAccommodated.map(c => (
              <div
                key={c.id}
                className={`cohort-impact-item ${selectedCohortId === c.id ? 'impact-item-selected' : ''}`}
                onClick={() => onSelectCohort(selectedCohortId === c.id ? null : c.id)}
              >
                <div className="impact-item-top">
                  <div>
                    <span className="impact-cohort-name">{c.name}</span>
                    <span className="impact-level-tag">Level {c.level}</span>
                  </div>
                  <span className="impact-ratio">{c.got} of {c.req} sessions ({c.pct}%)</span>
                </div>
                <div className="impact-progress-track">
                  <div className="impact-progress-fill fill-partial" style={{ width: `${c.pct}%` }} />
                </div>
                <p className="impact-reason">
                  <strong>Constraint:</strong> {c.why}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Fully Accommodated */}
        <div className="consequence-group-card">
          <div className="group-card-header header-full">
            <span className="group-card-title">Fully Accommodated ({fullyAccommodated.length})</span>
            <span className="group-card-badge badge-full">100% Demand Met</span>
          </div>

          <div className="group-list">
            {fullyAccommodated.length === 0 ? (
              <div className="empty-group-text">No cohorts could be fully accommodated under the current energy shortage.</div>
            ) : (
              fullyAccommodated.map(c => (
                <div
                  key={c.id}
                  className={`cohort-impact-item ${selectedCohortId === c.id ? 'impact-item-selected' : ''}`}
                  onClick={() => onSelectCohort(selectedCohortId === c.id ? null : c.id)}
                >
                  <div className="impact-item-top">
                    <div>
                      <span className="impact-cohort-name">{c.name}</span>
                      <span className="impact-level-tag">Level {c.level}</span>
                    </div>
                    <span className="impact-ratio text-success">{c.got} of {c.req} sessions (100%)</span>
                  </div>
                  <div className="impact-progress-track">
                    <div className="impact-progress-fill fill-full" style={{ width: `100%` }} />
                  </div>
                  <p className="impact-reason">
                    <strong>Status:</strong> {c.why}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unserved in Darkness */}
        <div className="consequence-group-card">
          <div className="group-card-header header-unserved">
            <span className="group-card-title">Unserved / In Darkness ({unserved.length})</span>
            <span className="group-card-badge badge-unserved">0% Allocated</span>
          </div>

          <div className="group-list">
            {unserved.length === 0 ? (
              <div className="empty-group-text text-success">
                ✓ No cohorts left completely in the dark under SECOND SUN's progressive filling.
              </div>
            ) : (
              unserved.map(c => (
                <div
                  key={c.id}
                  className={`cohort-impact-item ${selectedCohortId === c.id ? 'impact-item-selected' : ''}`}
                  onClick={() => onSelectCohort(selectedCohortId === c.id ? null : c.id)}
                >
                  <div className="impact-item-top">
                    <div>
                      <span className="impact-cohort-name">{c.name}</span>
                      <span className="impact-level-tag">Level {c.level}</span>
                    </div>
                    <span className="impact-ratio text-danger">0 of {c.req} sessions (0%)</span>
                  </div>
                  <p className="impact-reason text-danger">
                    <strong>Reason:</strong> {c.why}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
