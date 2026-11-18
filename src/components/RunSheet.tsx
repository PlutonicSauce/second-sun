import React from 'react';
import type { Scenario, ScheduleResult } from '../domain/types';
import { fmtT } from '../domain/engine';
import { consolidateRunSheetBookings } from '../domain/runsheet';

interface RunSheetProps {
  scenario: Scenario;
  result: ScheduleResult;
  onPrint: () => void;
  onDownloadCsv: () => void;
}

export const RunSheet: React.FC<RunSheetProps> = ({
  scenario,
  result,
  onPrint,
  onDownloadCsv,
}) => {
  // Use tested consolidation logic that groups by (room, cohort) first
  const consolidatedBookings = consolidateRunSheetBookings(scenario, result);

  // Identify idle and offline rooms accurately
  const activeRoomIds = new Set(result.assignments.map(a => a.roomId));
  const idleRooms = scenario.rooms.filter(r => r.enabled && !activeRoomIds.has(r.id));
  const offlineRooms = scenario.rooms.filter(r => !r.enabled);

  return (
    <section className="runsheet-section" aria-label="Operations Run Sheet">
      {/* Run Sheet Header */}
      <div className="runsheet-header">
        <div className="runsheet-title-group">
          <span className="runsheet-eyebrow">FACILITY DISPATCH TIMETABLE</span>
          <h2 className="runsheet-title">Tomorrow's Lighting Run Sheet</h2>
          <p className="runsheet-subline">
            Unlock rooms and energize bright-mode fixtures according to the verified schedule below.
          </p>
        </div>

        <div className="runsheet-actions no-print">
          <button type="button" className="btn-apple-secondary" onClick={onDownloadCsv}>
            Download CSV
          </button>
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
            const endTime = fmtT(booking.endSlot % 48);

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
                    Action: Unlock room & energize to {booking.powerWatts}W
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
                    {booking.powerWatts}W draw · {booking.energyKWh.toFixed(2)} kWh
                  </span>

                  {booking.wakeWindowStatus === 'full' && (
                    <span className="window-pill window-wake" title="All slots in this block fall within the crew's planned wake window">
                      ★ Primary Wake Window
                    </span>
                  )}

                  {booking.wakeWindowStatus === 'partial' && (
                    <span className="window-pill window-partial" title="A portion of this block falls within the crew's planned wake window">
                      {booking.preferredSummary}
                    </span>
                  )}

                  {booking.wakeWindowStatus === 'off-peak' && (
                    <span className="window-pill window-offpeak" title="Scheduled during crew's off-peak active window">
                      Off-Peak Window
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
                <strong>{r.name} (Level {r.locationLevel ?? '?'})</strong> — Offline for maintenance. Taken offline by facility operator.
              </li>
            ))}
            {idleRooms.map(r => (
              <li key={r.id}>
                <strong>{r.name} (Level {r.locationLevel ?? '?'})</strong> — Unscheduled tomorrow. Remained idle under current electrical budget, room capacity, or access constraints.
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
