import React from 'react';
import type { Scenario, ScheduleResult, PolicyMode } from '../domain/types';
import { policies } from '../domain/policies';
import { fmtT } from '../domain/engine';
import { consolidateRunSheetBookings } from '../domain/runsheet';

interface RunSheetProps {
  scenario: Scenario;
  result: ScheduleResult;
  activePolicy: PolicyMode;
  onPrint: () => void;
  onDownloadCsv: () => void;
  onOpenHandover: () => void;
}

export const RunSheet: React.FC<RunSheetProps> = ({
  scenario,
  result,
  activePolicy,
  onPrint,
  onDownloadCsv,
  onOpenHandover,
}) => {
  // Use tested consolidation logic that groups by (room, cohort) first
  const consolidatedBookings = consolidateRunSheetBookings(scenario, result);

  // Identify idle and offline rooms accurately
  const activeRoomIds = new Set(result.assignments.map(a => a.roomId));
  const idleRooms = scenario.rooms.filter(r => r.enabled && !activeRoomIds.has(r.id));
  const offlineRooms = scenario.rooms.filter(r => !r.enabled);

  return (
    <section className="runsheet-section" id="run-sheet" aria-labelledby="run-sheet-title">
      {/* Run Sheet Header */}
      <div className="runsheet-header">
        <div className="runsheet-title-group">
          <span className="runsheet-eyebrow">THE HOLLOW · SYNTHETIC PLAN</span>
          <h2 className="runsheet-title" id="run-sheet-title" tabIndex={-1}>Tomorrow’s lighting run sheet</h2>
          <p className="runsheet-subline">
            <strong>{policies[activePolicy].name}</strong> · 00:00–24:00 · {result.metrics.sessions} half-hour sessions
          </p>
          <p className="runsheet-subline">
            {result.metrics.kwh.toFixed(2)} of {scenario.budgetKWh.toFixed(2)} kWh used · {result.metrics.peakW} of {scenario.peakW} W peak load
          </p>
        </div>

        <div className="runsheet-actions no-print">
          <a href="#allocation" className="btn-header-ghost">Back to allocation ↑</a>
          <button type="button" className="btn-apple-secondary" onClick={onDownloadCsv}>
            Download CSV
          </button>
          <button type="button" className="btn-apple-secondary" onClick={onOpenHandover}>Handover & JSON</button>
          <button type="button" className="btn-apple-primary" onClick={onPrint}>
            Print Run Sheet
          </button>
        </div>
      </div>

      {/* Timetable List */}
      {consolidatedBookings.length === 0 ? (
        <div className="runsheet-empty">
          <h3>No Operational Hours Scheduled</h3>
          <p>
            Under the current electrical and room constraints, no bright-light rooms can run tomorrow.
            Increase available power or bring facilities online above to generate an actionable schedule.
          </p>
        </div>
      ) : (
        <div className="runsheet-list" role="list">
          {consolidatedBookings.map(booking => {
            const startTime = fmtT(booking.startSlot);
            const endTime = fmtT(booking.endSlot);

            return (
              <div key={booking.id} className="runsheet-row" role="listitem">
                {/* 1. Time Column */}
                <div className="runsheet-time">
                  <span className="time-primary">{startTime} – {endTime}</span>
                  <span className="time-duration">
                    {booking.durationMinutes} min ({booking.slotsCount} {booking.slotsCount === 1 ? 'half-hour session' : 'sessions'})
                  </span>
                </div>

                {/* 2. Room Location & Operational Action */}
                <div className="runsheet-room">
                  <span className="room-primary">{booking.roomName}</span>
                  <span className="room-meta">
                    Level {booking.roomLevel ?? '?'} · Max Capacity {booking.roomCapacity}
                  </span>
                  <span className="room-action-instruction">
                    Set bright mode to {booking.powerWatts} W
                  </span>
                </div>

                {/* 3. Assigned Cohort Crew */}
                <div className="runsheet-crew">
                  <span className="crew-primary">{booking.cohortName}</span>
                  <span className="crew-meta">
                    Level {booking.cohortLevel} · {booking.cohortPopulation} crew · Shift: {booking.cohortShiftLabel}
                  </span>
                </div>

                {/* 4. Power & Timing Fit */}
                <div className="runsheet-energy">
                  <span className="energy-val">
                    {booking.powerWatts}W draw · {booking.energyKWh} kWh
                  </span>

                  {booking.wakeWindowStatus === 'full' && (
                    <span className="window-pill window-wake" title="All slots in this block fall within the crew's preferred window">
                      Preferred window
                    </span>
                  )}

                  {booking.wakeWindowStatus === 'partial' && (
                    <span className="window-pill window-partial" title="Part of this block falls within the crew's preferred window">
                      {booking.preferredSummary}
                    </span>
                  )}

                  {booking.wakeWindowStatus === 'off-peak' && (
                    <span className="window-pill window-offpeak" title="Scheduled outside the crew's preferred window">
                      Outside preferred window
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Idle / Offline Facilities Notice with Strictly Truthful Grounding */}
      {(idleRooms.length > 0 || offlineRooms.length > 0) && (
        <div className="runsheet-idle-box">
          <span className="idle-title">Facility Status Notices for Tomorrow:</span>
          <ul className="idle-list">
            {offlineRooms.map(r => (
              <li key={r.id}>
                <strong>{r.name} (Level {r.locationLevel ?? '?'})</strong> — Offline in this scenario.
              </li>
            ))}
            {idleRooms.map(r => (
              <li key={r.id}>
                <strong>{r.name} (Level {r.locationLevel ?? '?'})</strong> — Available with no bookings in this plan.
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
