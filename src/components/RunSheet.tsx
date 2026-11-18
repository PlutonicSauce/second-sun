import React from 'react';
import type { Scenario, ScheduleResult } from '../domain/types';
import { fmtT } from '../domain/engine';

interface RunSheetProps {
  scenario: Scenario;
  result: ScheduleResult;
  onPrint: () => void;
  onDownloadCsv: () => void;
}

interface MergedBooking {
  roomId: string;
  cohortId: string;
  startSlot: number;
  endSlot: number;
  slotsCount: number;
  powerWatts: number;
  isPreferred: boolean;
}

export const RunSheet: React.FC<RunSheetProps> = ({
  scenario,
  result,
  onPrint,
  onDownloadCsv,
}) => {
  const roomMap = new Map(scenario.rooms.map(r => [r.id, r]));
  const cohortMap = new Map(scenario.cohorts.map(c => [c.id, c]));

  // Sort assignments chronologically
  const sorted = [...result.assignments].sort((a, b) => a.slotIndex - b.slotIndex);

  // Consolidate consecutive half-hour slots for the same cohort in the same room
  const mergedBookings: MergedBooking[] = [];
  for (const asg of sorted) {
    const last = mergedBookings[mergedBookings.length - 1];
    const cohort = cohortMap.get(asg.cohortId);
    const isPref = cohort ? cohort.preferredSlots.includes(asg.slotIndex) : false;

    if (
      last &&
      last.roomId === asg.roomId &&
      last.cohortId === asg.cohortId &&
      last.endSlot === asg.slotIndex
    ) {
      last.endSlot = asg.slotIndex + 1;
      last.slotsCount += 1;
      if (isPref) last.isPreferred = true;
    } else {
      mergedBookings.push({
        roomId: asg.roomId,
        cohortId: asg.cohortId,
        startSlot: asg.slotIndex,
        endSlot: asg.slotIndex + 1,
        slotsCount: 1,
        powerWatts: asg.actualPowerWatts,
        isPreferred: isPref,
      });
    }
  }

  // Identify idle rooms (rooms with zero scheduled sessions tomorrow)
  const activeRoomIds = new Set(result.assignments.map(a => a.roomId));
  const idleRooms = scenario.rooms.filter(r => r.enabled && !activeRoomIds.has(r.id));
  const offlineRooms = scenario.rooms.filter(r => !r.enabled);

  return (
    <section className="runsheet-section" aria-label="Operations Run Sheet">
      {/* Run Sheet Header */}
      <div className="runsheet-header">
        <div className="runsheet-title-group">
          <span className="runsheet-eyebrow">FACILITY DISPATCH SCHEDULE</span>
          <h2 className="runsheet-title">Tomorrow's Lighting Run Sheet</h2>
          <p className="runsheet-subline">
            Unlock rooms and energize bright-mode fixtures according to the timetable below.
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
      {mergedBookings.length === 0 ? (
        <div className="runsheet-empty">
          <h3>No Operational Hours Scheduled</h3>
          <p>
            Under the current electrical cap, no bright-light rooms can run tomorrow.
            Increase available power above to generate a schedule.
          </p>
        </div>
      ) : (
        <div className="runsheet-list" role="list">
          {mergedBookings.map((booking, idx) => {
            const room = roomMap.get(booking.roomId);
            const cohort = cohortMap.get(booking.cohortId);
            const startTime = fmtT(booking.startSlot);
            const endTime = fmtT(booking.endSlot % 48);
            const durationMin = booking.slotsCount * 30;
            const energyKWh = ((booking.powerWatts * 0.5 * booking.slotsCount) / 1000).toFixed(2);

            return (
              <div key={idx} className="runsheet-row" role="listitem">
                {/* Time Column */}
                <div className="runsheet-time">
                  <span className="time-primary">{startTime} – {endTime}</span>
                  <span className="time-duration">{durationMin} min ({booking.slotsCount} {booking.slotsCount === 1 ? 'session' : 'sessions'})</span>
                </div>

                {/* Room Location Column */}
                <div className="runsheet-room">
                  <span className="room-primary">{room?.name ?? booking.roomId}</span>
                  <span className="room-meta">Level {room?.locationLevel ?? '?'} · Capacity {room?.capacityPeople}</span>
                </div>

                {/* Cohort Crew Column */}
                <div className="runsheet-crew">
                  <span className="crew-primary">{cohort?.name ?? booking.cohortId}</span>
                  <span className="crew-meta">{cohort?.populationPeople} crew · Shift: {cohort?.shiftLabel}</span>
                </div>

                {/* Energy & Status Column */}
                <div className="runsheet-energy">
                  <span className="energy-val">{booking.powerWatts}W · {energyKWh} kWh</span>
                  {booking.isPreferred ? (
                    <span className="window-pill window-wake">★ Wake Window</span>
                  ) : (
                    <span className="window-pill window-offpeak">Off-Peak</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Idle / Offline Facilities Notice */}
      {(idleRooms.length > 0 || offlineRooms.length > 0) && (
        <div className="runsheet-idle-box">
          <span className="idle-title">Facilities Remaining Locked Tomorrow:</span>
          <ul className="idle-list">
            {idleRooms.map(r => (
              <li key={r.id}>
                <strong>{r.name} (Level {r.locationLevel ?? '?'})</strong> — Locked all day to preserve the rationed power budget.
              </li>
            ))}
            {offlineRooms.map(r => (
              <li key={r.id}>
                <strong>{r.name} (Level {r.locationLevel ?? '?'})</strong> — Offline for mechanical maintenance.
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
