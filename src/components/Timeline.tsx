import React, { useState } from 'react';
import type { Scenario, ScheduleResult, Assignment } from '../domain/types';
import { fmtT, SLOTS } from '../domain/engine';

interface TimelineProps {
  scenario: Scenario;
  result: ScheduleResult;
  selectedCohortId: string | null;
  onSelectCohort: (id: string | null) => void;
}

export const COHORT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  M: { bg: '#0284c7', border: '#38bdf8', text: '#ffffff' }, // Morning maintenance (Sky)
  N: { bg: '#7c3aed', border: '#a78bfa', text: '#ffffff' }, // Night ventilation (Violet)
  H: { bg: '#059669', border: '#34d399', text: '#ffffff' }, // Hydroponics (Emerald)
  S: { bg: '#db2777', border: '#f472b6', text: '#ffffff' }, // Medical support (Rose)
  A: { bg: '#0284c7', border: '#38bdf8', text: '#ffffff' }, // Group A (Toy)
  B: { bg: '#ea580c', border: '#fb923c', text: '#ffffff' }, // Group B (Toy)
};

export const Timeline: React.FC<TimelineProps> = ({
  scenario,
  result,
  selectedCohortId,
  onSelectCohort,
}) => {
  const [activeSlotInfo, setActiveSlotInfo] = useState<{
    roomName: string;
    slot: number;
    assignment?: Assignment;
    cohortName?: string;
    isPreferred?: boolean;
  } | null>(null);

  // Map assignments by "roomId|slotIndex"
  const asgMap = new Map<string, Assignment>();
  for (const a of result.assignments) {
    asgMap.set(`${a.roomId}|${a.slotIndex}`, a);
  }

  // Calculate power per slot
  const slotWatts = new Array<number>(SLOTS).fill(0);
  for (const a of result.assignments) {
    slotWatts[a.slotIndex] += a.actualPowerWatts;
  }

  const cohortMap = new Map(scenario.cohorts.map(c => [c.id, c]));

  // Major hour markers (every 4 half-hour slots = 2 hours)
  const hourMarkers: { slot: number; label: string }[] = [];
  for (let s = 0; s < SLOTS; s += 4) {
    hourMarkers.push({ slot: s, label: fmtT(s) });
  }

  return (
    <div className="timeline-container" role="region" aria-label="24-Hour Schedule Timeline">
      <div className="timeline-header">
        <div>
          <h3 className="timeline-title">24-Hour Room Allocation Timeline (48 Half-Hour Slots)</h3>
          <p className="timeline-subtitle">
            Horizontally spans 00:00 to 23:30. Shaded sections indicate underground quiet/rest hours.
          </p>
        </div>
        <div className="timeline-legend">
          {scenario.cohorts.map(c => {
            const style = COHORT_COLORS[c.id] || { bg: '#475569', border: '#94a3b8', text: '#fff' };
            const isSelected = selectedCohortId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                className={`legend-item ${isSelected ? 'legend-item-selected' : ''}`}
                onClick={() => onSelectCohort(isSelected ? null : c.id)}
                title={`Click to highlight ${c.name}`}
              >
                <span className="legend-chip" style={{ backgroundColor: style.bg, borderColor: style.border }} />
                <span className="legend-label">{c.name}</span>
                <span className="legend-pop">({c.populationPeople}p)</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="timeline-scroll-wrap">
        <div className="timeline-grid">
          {/* Time axis header */}
          <div className="timeline-row timeline-time-header">
            <div className="timeline-room-label-cell">Room / Slot</div>
            <div className="timeline-slots-header">
              {hourMarkers.map(m => (
                <div
                  key={m.slot}
                  className="time-tick"
                  style={{ left: `${(m.slot / SLOTS) * 100}%` }}
                >
                  <span className="time-tick-label">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Room rows */}
          {scenario.rooms.map(room => {
            return (
              <div key={room.id} className={`timeline-row ${!room.enabled ? 'room-disabled' : ''}`}>
                <div className="timeline-room-label-cell">
                  <div className="room-title-line">
                    <span className="room-name">{room.name}</span>
                    {!room.enabled && <span className="room-offline-badge">OFFLINE</span>}
                  </div>
                  <div className="room-sub-line">
                    {room.capacityPeople} cap • {room.brightModeWatts}W
                  </div>
                </div>

                <div className="timeline-slots-cell">
                  {Array.from({ length: SLOTS }).map((_, slotIndex) => {
                    const asg = asgMap.get(`${room.id}|${slotIndex}`);
                    const cohort = asg ? cohortMap.get(asg.cohortId) : undefined;
                    const isPref = cohort ? cohort.preferredSlots.includes(slotIndex) : false;
                    const style = asg ? COHORT_COLORS[asg.cohortId] : undefined;
                    const isDimmed = selectedCohortId !== null && asg?.cohortId !== selectedCohortId;
                    const isSelected = selectedCohortId !== null && asg?.cohortId === selectedCohortId;

                    return (
                      <div
                        key={slotIndex}
                        tabIndex={room.enabled ? 0 : -1}
                        className={`slot-cell ${!room.enabled ? 'slot-disabled' : ''} ${
                          asg ? 'slot-assigned' : 'slot-empty'
                        } ${isDimmed ? 'slot-dimmed' : ''} ${isSelected ? 'slot-highlighted' : ''}`}
                        style={
                          asg && style && room.enabled
                            ? {
                                backgroundColor: style.bg,
                                borderColor: isSelected ? '#ffffff' : style.border,
                                color: style.text,
                              }
                            : undefined
                        }
                        onMouseEnter={() =>
                          setActiveSlotInfo({
                            roomName: room.name,
                            slot: slotIndex,
                            assignment: asg,
                            cohortName: cohort?.name,
                            isPreferred: isPref,
                          })
                        }
                        onMouseLeave={() => setActiveSlotInfo(null)}
                        onFocus={() =>
                          setActiveSlotInfo({
                            roomName: room.name,
                            slot: slotIndex,
                            assignment: asg,
                            cohortName: cohort?.name,
                            isPreferred: isPref,
                          })
                        }
                        onBlur={() => setActiveSlotInfo(null)}
                        aria-label={`${room.name} at ${fmtT(slotIndex)}: ${
                          asg ? `${cohort?.name} (${asg.actualPowerWatts}W)` : 'Available'
                        }`}
                      >
                        {asg && (
                          <span className="slot-badge">
                            {cohort?.id || asg.cohortId}
                            {isPref && <span className="star-dot" title="In preferred exposure window">★</span>}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Simultaneous Power Load Row */}
          <div className="timeline-row timeline-power-row">
            <div className="timeline-room-label-cell">
              <span className="room-name">Simultaneous Load</span>
              <span className="room-sub-line">Cap: {scenario.peakW}W</span>
            </div>
            <div className="timeline-slots-cell power-meter-strip">
              {Array.from({ length: SLOTS }).map((_, slotIndex) => {
                const w = slotWatts[slotIndex];
                const pct = Math.min(100, Math.round((w / scenario.peakW) * 100));
                const isOver = w > scenario.peakW;
                return (
                  <div
                    key={slotIndex}
                    className={`power-slot ${isOver ? 'power-over' : ''}`}
                    title={`${fmtT(slotIndex)}: ${w}W (${pct}% of peak cap)`}
                  >
                    <div
                      className={`power-slot-bar ${w > 0 ? (pct > 75 ? 'bar-warn' : 'bar-good') : ''}`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip Display Bar */}
      <div className="timeline-inspector-bar" aria-live="polite">
        {activeSlotInfo ? (
          <div className="inspector-content">
            <span className="inspector-time">
              ⏱ {fmtT(activeSlotInfo.slot)} – {fmtT((activeSlotInfo.slot + 1) % 48)} (Slot #{activeSlotInfo.slot})
            </span>
            <span className="inspector-room">🏛 {activeSlotInfo.roomName}</span>
            {activeSlotInfo.assignment ? (
              <>
                <span className="inspector-cohort">
                  👤 <strong>{activeSlotInfo.cohortName}</strong>
                </span>
                <span className="inspector-power">
                  ⚡ {activeSlotInfo.assignment.actualPowerWatts}W ({(activeSlotInfo.assignment.actualPowerWatts / 2000).toFixed(2)} kWh)
                </span>
                {activeSlotInfo.isPreferred ? (
                  <span className="badge badge-success">★ In Preferred Planning Window</span>
                ) : (
                  <span className="badge badge-neutral">Off-Peak Window</span>
                )}
              </>
            ) : (
              <span className="inspector-idle">Unassigned / Available Slot</span>
            )}
          </div>
        ) : (
          <div className="inspector-idle-prompt">
            Hover or keyboard-focus any slot on the timeline to inspect room draw, assigned group, and window timing.
          </div>
        )}
      </div>
    </div>
  );
};
