import React, { useState } from 'react';
import type { Scenario, ScheduleResult } from '../domain/types';
import { fmtT } from '../domain/engine';

interface OperationsPlanProps {
  scenario: Scenario;
  result: ScheduleResult;
  selectedCohortId: string | null;
  onSelectCohort: (cohortId: string | null) => void;
  onOpenHandover: () => void;
}

export const OperationsPlan: React.FC<OperationsPlanProps> = ({
  scenario,
  result,
  selectedCohortId,
  onSelectCohort,
  onOpenHandover,
}) => {
  const [viewMode, setViewMode] = useState<'agenda' | 'rooms'>('agenda');

  const roomMap = new Map(scenario.rooms.map(r => [r.id, r]));
  const cohortMap = new Map(scenario.cohorts.map(c => [c.id, c]));

  // Chronologically sorted assignments
  const sortedAssignments = [...result.assignments].sort((a, b) => a.slotIndex - b.slotIndex);

  // Group by room for room-centric view
  const assignmentsByRoom = new Map<string, typeof sortedAssignments>();
  for (const r of scenario.rooms) {
    assignmentsByRoom.set(r.id, []);
  }
  for (const asg of sortedAssignments) {
    const list = assignmentsByRoom.get(asg.roomId) ?? [];
    list.push(asg);
    assignmentsByRoom.set(asg.roomId, list);
  }

  const totalSessions = result.metrics.sessions;
  const totalHours = (totalSessions * 0.5).toFixed(1);
  const totalKWh = result.metrics.kwh.toFixed(2);
  const budgetKWh = scenario.budgetKWh.toFixed(2);
  const personSlots = result.metrics.personSlots;

  return (
    <section className="operations-plan-section" aria-label="Recommended Operations Plan">
      {/* Header with Title and Mode Switch */}
      <div className="plan-header">
        <div>
          <span className="plan-eyebrow">SOLVER RECOMMENDATION · PROGRESSIVE-FILLING HEURISTIC</span>
          <h2 className="plan-title">24-Hour Recommended Lighting Operations Plan</h2>
          <p className="plan-subline">
            Concrete schedule for facility supervisors. Every slot represents a 30-minute booking under hard room capacity and integer watt-minute limits.
          </p>
        </div>

        <div className="plan-header-controls">
          <div className="view-mode-toggle" role="group" aria-label="Schedule View Format">
            <button
              type="button"
              className={`mode-btn ${viewMode === 'agenda' ? 'mode-btn-active' : ''}`}
              onClick={() => setViewMode('agenda')}
            >
              Agenda View
            </button>
            <button
              type="button"
              className={`mode-btn ${viewMode === 'rooms' ? 'mode-btn-active' : ''}`}
              onClick={() => setViewMode('rooms')}
            >
              By Room
            </button>
          </div>

          <button
            type="button"
            className="btn-export-quick"
            onClick={onOpenHandover}
            title="Download CSV/JSON or copy handover brief"
          >
            Export Plan
          </button>
        </div>
      </div>

      {/* Plan Metrics Summary Strip */}
      <div className="plan-summary-strip">
        <div className="summary-pill">
          <span className="pill-dot pill-dot-amber" />
          <span><strong>{totalSessions}</strong> Sessions Planned ({totalHours} hrs)</span>
        </div>
        <div className="summary-pill">
          <span className="pill-dot pill-dot-blue" />
          <span><strong>{totalKWh}</strong> / {budgetKWh} kWh Used</span>
        </div>
        <div className="summary-pill">
          <span className="pill-dot pill-dot-green" />
          <span><strong>{personSlots}</strong> Person-Slots Accommodated</span>
        </div>
        <div className="summary-pill">
          <span className="pill-dot pill-dot-slate" />
          <span>Peak Simultaneous Load: <strong>{result.metrics.peakW}W</strong> (Cap: {scenario.peakW}W)</span>
        </div>
      </div>

      {/* View Mode 1: Chronological Operations Agenda */}
      {viewMode === 'agenda' && (
        <div className="agenda-container" role="feed" aria-label="Chronological Operations Agenda">
          {sortedAssignments.length === 0 ? (
            <div className="empty-schedule-card">
              <span className="empty-icon">🌙</span>
              <h3>No Sessions Scheduled</h3>
              <p>The current power budget or room availability cannot support any bright-light sessions. Increase available power above to generate a schedule.</p>
            </div>
          ) : (
            <div className="agenda-timeline-list">
              {sortedAssignments.map((asg, index) => {
                const room = roomMap.get(asg.roomId);
                const cohort = cohortMap.get(asg.cohortId);
                const isPref = cohort ? cohort.preferredSlots.includes(asg.slotIndex) : false;
                const isHighlighted = selectedCohortId === asg.cohortId;
                const energyKWh = (asg.actualPowerWatts / 2000).toFixed(2);

                const startTime = fmtT(asg.slotIndex);
                const endTime = fmtT((asg.slotIndex + 1) % 48);

                return (
                  <article
                    key={`${asg.roomId}-${asg.slotIndex}-${index}`}
                    className={`agenda-card ${isHighlighted ? 'agenda-card-highlighted' : ''}`}
                    onClick={() => onSelectCohort(selectedCohortId === asg.cohortId ? null : asg.cohortId)}
                  >
                    {/* Time Pillar */}
                    <div className="agenda-time-col">
                      <span className="time-clock">{startTime} – {endTime}</span>
                      <span className="slot-num">Slot #{asg.slotIndex}</span>
                    </div>

                    {/* Room & Facility Meta */}
                    <div className="agenda-room-col">
                      <span className="agenda-room-name">🏛 {room?.name ?? asg.roomId}</span>
                      <span className="agenda-room-sub">
                        Level {room?.locationLevel ?? '?'} · Cap {room?.capacityPeople}
                      </span>
                    </div>

                    {/* Assigned Cohort Meta */}
                    <div className="agenda-cohort-col">
                      <div className="cohort-name-line">
                        <span className="agenda-cohort-name">{cohort?.name ?? asg.cohortId}</span>
                        <span className="agenda-level-tag">Level {cohort?.level ?? '?'}</span>
                      </div>
                      <div className="cohort-sub-line">
                        <span>{cohort?.populationPeople} residents</span>
                        <span className="agenda-sep">•</span>
                        <span>Shift: {cohort?.shiftLabel}</span>
                      </div>
                    </div>

                    {/* Power Consumption */}
                    <div className="agenda-power-col">
                      <span className="power-watts">⚡ {asg.actualPowerWatts}W</span>
                      <span className="power-kwh">{energyKWh} kWh</span>
                    </div>

                    {/* Shift Window Fit Tag */}
                    <div className="agenda-status-col">
                      {isPref ? (
                        <span className="badge-window badge-preferred" title="Falls within resident declared wake/shift window">
                          ★ In Preferred Window
                        </span>
                      ) : (
                        <span className="badge-window badge-offpeak" title="Scheduled outside declared preferred window but within shift limits">
                          Off-Peak Opportunity
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View Mode 2: Room by Room Occupancy */}
      {viewMode === 'rooms' && (
        <div className="rooms-occupancy-grid">
          {scenario.rooms.map(room => {
            const roomAssignments = assignmentsByRoom.get(room.id) ?? [];
            const roomKWh = roomAssignments.reduce((acc, a) => acc + (a.actualPowerWatts / 2000), 0);

            return (
              <div key={room.id} className={`room-schedule-card ${!room.enabled ? 'room-card-offline' : ''}`}>
                <div className="room-card-header">
                  <div>
                    <h3 className="room-card-title">
                      {room.name}
                      {!room.enabled && <span className="offline-badge">OFFLINE</span>}
                    </h3>
                    <span className="room-card-sub">
                      Level {room.locationLevel ?? '?'} · {room.capacityPeople} Capacity · {room.brightModeWatts}W
                    </span>
                  </div>
                  <div className="room-card-metrics">
                    <span>{roomAssignments.length} sessions</span>
                    <span>{roomKWh.toFixed(2)} kWh</span>
                  </div>
                </div>

                {roomAssignments.length === 0 ? (
                  <div className="room-card-empty">
                    {room.enabled ? 'No sessions placed in this facility.' : 'Facility offline for maintenance.'}
                  </div>
                ) : (
                  <div className="room-sessions-list">
                    {roomAssignments.map((asg, i) => {
                      const cohort = cohortMap.get(asg.cohortId);
                      const isPref = cohort ? cohort.preferredSlots.includes(asg.slotIndex) : false;

                      return (
                        <div key={i} className="room-session-item">
                          <span className="session-time">
                            {fmtT(asg.slotIndex)}–{fmtT((asg.slotIndex + 1) % 48)}
                          </span>
                          <span className="session-cohort">
                            <strong>{cohort?.name}</strong> (L{cohort?.level}, {cohort?.populationPeople}p)
                          </span>
                          <span className="session-window">
                            {isPref ? '★ Preferred' : 'Off-Peak'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
