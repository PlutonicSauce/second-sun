import React from 'react';
import type { Scenario, ScheduleResult, Cohort, PolicyMode } from '../domain/types';
import { fmtT } from '../domain/engine';

interface HollowLevelsViewProps {
  scenario: Scenario;
  result: ScheduleResult;
  activePolicy: PolicyMode;
  preferredCov: Record<string, number>;
  selectedCohortId: string | null;
  onSelectCohort: (cohortId: string | null) => void;
}

// Approximate subterranean depth for visual cross-section
const DEPTH_MAP: Record<number, { depthM: number; sectorType: string }> = {
  2: { depthM: 80, sectorType: 'Executive & Administration' },
  3: { depthM: 140, sectorType: 'Central Medical & Trauma' },
  4: { depthM: 180, sectorType: 'Regional Atrium Concourse' },
  5: { depthM: 220, sectorType: 'Agri-Tier & Hydroponics' },
  7: { depthM: 310, sectorType: 'Sub-Station Utilities' },
  9: { depthM: 400, sectorType: 'Deep Scrubbers & Bedrock Sump' },
};

export const HollowLevelsView: React.FC<HollowLevelsViewProps> = ({
  scenario,
  result,
  activePolicy,
  preferredCov,
  selectedCohortId,
  onSelectCohort,
}) => {
  // Sort cohorts top-to-bottom by habitat level (Level 2 upper down to Level 9 deep)
  const sortedCohorts = [...scenario.cohorts].sort((a, b) => a.level - b.level);

  // Group assignments by cohort for inspecting scheduled slots
  const cohortAssignments = new Map<string, typeof result.assignments>();
  for (const asg of result.assignments) {
    const list = cohortAssignments.get(asg.cohortId) ?? [];
    list.push(asg);
    cohortAssignments.set(asg.cohortId, list);
  }

  // Room lookup
  const roomMap = new Map(scenario.rooms.map(r => [r.id, r]));

  return (
    <div className="hollow-visualization-card">
      <div className="hollow-vis-header">
        <div>
          <span className="vis-eyebrow">SUBTERRANEAN HABITAT CROSS-SECTION</span>
          <h2 className="vis-title">Artificial Daylight Distribution by Depth</h2>
        </div>
        <div className="vis-legend">
          <div className="legend-item">
            <span className="legend-block legend-block-allocated" />
            <span>Allocated Session (30 min)</span>
          </div>
          <div className="legend-item">
            <span className="legend-block legend-block-unmet" />
            <span>Unmet Demand (Darkness)</span>
          </div>
        </div>
      </div>

      {/* Surface Ground Level Indicator */}
      <div className="surface-boundary">
        <div className="surface-line" />
        <span className="surface-label">SURFACE · 0 METERS · UNINHABITABLE EXTERIOR (SEALED)</span>
        <div className="surface-line" />
      </div>

      {/* Vertical Levels List */}
      <div className="levels-shaft" role="list" aria-label="Subterranean Habitat Levels">
        {sortedCohorts.map((cohort: Cohort) => {
          const allocated = result.got[cohort.id] ?? 0;
          const requested = cohort.requestedSlots;
          const coveragePct = requested > 0 ? Math.round((allocated / requested) * 100) : 100;
          const isSelected = selectedCohortId === cohort.id;
          const assignments = cohortAssignments.get(cohort.id) ?? [];
          const prefHitRate = preferredCov[cohort.id] ?? 0;
          const depthInfo = DEPTH_MAP[cohort.level] ?? {
            depthM: cohort.level * 45,
            sectorType: 'Residential Sector',
          };

          const isSeverelyUnderserved = coveragePct === 0;
          const isFullyServed = coveragePct === 100;

          return (
            <div
              key={cohort.id}
              role="listitem"
              className={`level-row ${isSelected ? 'level-row-selected' : ''} ${
                isSeverelyUnderserved ? 'level-row-dark' : ''
              }`}
              onClick={() => onSelectCohort(isSelected ? null : cohort.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCohort(isSelected ? null : cohort.id);
                }
              }}
              tabIndex={0}
              aria-expanded={isSelected}
            >
              {/* Depth indicator pill */}
              <div className="level-depth-col">
                <span className="level-number">L{cohort.level}</span>
                <span className="level-depth-meters">-{depthInfo.depthM}m</span>
              </div>

              {/* Main Community Info */}
              <div className="level-info-col">
                <div className="level-name-line">
                  <span className="level-cohort-name">{cohort.name}</span>
                  <span className="level-sector-tag">{depthInfo.sectorType}</span>
                </div>
                <div className="level-meta-line">
                  <span>{cohort.populationPeople} residents</span>
                  <span className="meta-sep">•</span>
                  <span>Shift: {cohort.shiftLabel}</span>
                </div>
              </div>

              {/* Visual Daylight Gauge (The Centerpiece of each level) */}
              <div className="level-gauge-col">
                <div className="daylight-blocks" aria-label={`${allocated} of ${requested} sessions allocated`}>
                  {Array.from({ length: requested }).map((_, slotIdx) => {
                    const isAllocated = slotIdx < allocated;
                    const asg = isAllocated ? assignments[slotIdx] : undefined;
                    const room = asg ? roomMap.get(asg.roomId) : undefined;
                    const isPref = asg ? cohort.preferredSlots.includes(asg.slotIndex) : false;

                    return (
                      <div
                        key={slotIdx}
                        className={`daylight-block ${
                          isAllocated ? 'daylight-block-lit' : 'daylight-block-unlit'
                        }`}
                        title={
                          asg
                            ? `Session ${slotIdx + 1}: ${fmtT(asg.slotIndex)} in ${room?.name ?? asg.roomId}${
                                isPref ? ' (In Preferred Window)' : ''
                              }`
                            : `Session ${slotIdx + 1}: Unallocated (Denied due to power cut)`
                        }
                      >
                        {isAllocated && isPref && <span className="pref-star">★</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="level-coverage-badge">
                  <span
                    className={`coverage-pct ${
                      isSeverelyUnderserved
                        ? 'coverage-zero'
                        : isFullyServed
                        ? 'coverage-full'
                        : 'coverage-partial'
                    }`}
                  >
                    {coveragePct}%
                  </span>
                  <span className="coverage-fraction">
                    {allocated}/{requested} sessions
                  </span>
                </div>
              </div>

              {/* Expandable Details for Selected Level */}
              {isSelected && (
                <div
                  className="level-expanded-drawer"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="drawer-grid">
                    <div className="drawer-stat">
                      <span className="drawer-label">Preferred Window Fit</span>
                      <span className="drawer-val">
                        {prefHitRate}% in wake/shift window
                      </span>
                    </div>
                    <div className="drawer-stat">
                      <span className="drawer-label">Accessible Facilities</span>
                      <span className="drawer-val">
                        {cohort.permittedRoomIds
                          .map(rid => roomMap.get(rid)?.name ?? rid)
                          .join(', ')}
                      </span>
                    </div>
                    <div className="drawer-stat drawer-stat-wide">
                      <span className="drawer-label">Scheduling Outcome</span>
                      <span className="drawer-val drawer-val-explanation">
                        {result.why[cohort.id] ?? 'Allocation determined by policy priority.'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="hollow-vis-footer">
        <span className="vis-hint">
          Click any level to inspect shift windows and accessible rooms. All sessions represent 30 minutes of shared bright light under strict room capacity.
        </span>
        <span className="policy-badge-current">
          Current: <strong>{activePolicy === 'fair' ? 'SECOND SUN (Fair Share)' : activePolicy === 'directorate' ? 'Directorate Priority' : 'First-Come'}</strong>
        </span>
      </div>
    </div>
  );
};
