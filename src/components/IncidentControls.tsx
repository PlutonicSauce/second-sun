import React, { useMemo } from 'react';
import type { Room, ScheduleResult } from '../domain/types';

interface IncidentControlsProps {
  budgetKWh: number;
  baseBudgetKWh: number;
  onBudgetChange: (kwh: number) => void;
  rooms: Room[];
  onToggleRoom: (roomId: string) => void;
  result: ScheduleResult;
}

export const IncidentControls: React.FC<IncidentControlsProps> = ({
  budgetKWh,
  baseBudgetKWh,
  onBudgetChange,
  rooms,
  onToggleRoom,
  result,
}) => {
  const currentPct = baseBudgetKWh > 0 ? Math.round((budgetKWh / baseBudgetKWh) * 100) : 100;
  const offlineRooms = rooms.filter(r => !r.enabled);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseInt(e.target.value, 10);
    const newKWh = parseFloat(((pct / 100) * baseBudgetKWh).toFixed(2));
    onBudgetChange(newKWh);
  };

  const setPresetPct = (pct: number) => {
    const newKWh = parseFloat(((pct / 100) * baseBudgetKWh).toFixed(2));
    onBudgetChange(newKWh);
  };

  // Generate plain-language operational consequence based on real computed metrics
  const impactNarrative = useMemo(() => {
    const sessionCount = result.metrics.sessions;
    const unmet = result.metrics.unmet;
    const kwhUsed = result.metrics.kwh;
    const personSlots = result.metrics.personSlots;

    if (offlineRooms.length > 0) {
      const roomNames = offlineRooms.map(r => r.name).join(', ');
      return `Operating with ${roomNames} offline: ${sessionCount} sessions scheduled (${kwhUsed.toFixed(2)} kWh used). ${unmet} requested sessions could not be placed due to room capacity or energy limits.`;
    }

    if (currentPct <= 25) {
      return `Critical power rationing (25% available): Grid scaled down to ${sessionCount} sessions (${personSlots} person-slots). ${unmet} requests canceled to preserve emergency safety buffers.`;
    }

    if (currentPct <= 60) {
      return `Geothermal shortage (60% available): SECOND SUN schedules ${sessionCount} sessions (${personSlots} person-slots accommodated). ${unmet} requests unserved due to the ${budgetKWh.toFixed(2)} kWh cap.`;
    }

    return `Normal power grid (100% available): All available capacity utilized (${sessionCount} sessions scheduled, ${personSlots} person-slots).`;
  }, [result, offlineRooms, currentPct, budgetKWh]);

  return (
    <section className="incident-controls-card" aria-label="Incident Adjustment Controls">
      <div className="controls-header">
        <div>
          <span className="controls-eyebrow">FACILITY OPERATIONAL CONTROLS</span>
          <h2 className="controls-title">Adjust Available Energy & Facility Status</h2>
        </div>
        <div className="controls-readout">
          <span className="controls-pct">{currentPct}%</span>
          <span className="controls-kwh">({budgetKWh.toFixed(2)} kWh available)</span>
        </div>
      </div>

      <div className="controls-grid">
        {/* Power Slider */}
        <div className="control-box">
          <div className="control-box-header">
            <span className="box-label">Discretionary Power Budget</span>
            <span className="box-val">{budgetKWh.toFixed(2)} / {baseBudgetKWh.toFixed(2)} kWh</span>
          </div>

          <div className="slider-container">
            <input
              type="range"
              min={15}
              max={100}
              step={5}
              value={currentPct}
              onChange={handleSliderChange}
              aria-label="Adjust Available Lighting Power"
              className="operator-range-slider"
            />
          </div>

          <div className="preset-pill-row">
            <button
              type="button"
              className={`preset-btn ${currentPct === 100 ? 'preset-btn-active' : ''}`}
              onClick={() => setPresetPct(100)}
            >
              100% Normal
            </button>
            <button
              type="button"
              className={`preset-btn ${currentPct === 60 ? 'preset-btn-active' : ''}`}
              onClick={() => setPresetPct(60)}
            >
              60% Shortage
            </button>
            <button
              type="button"
              className={`preset-btn ${currentPct === 25 ? 'preset-btn-active' : ''}`}
              onClick={() => setPresetPct(25)}
            >
              25% Crisis
            </button>
          </div>
        </div>

        {/* Room Facility Toggles */}
        <div className="control-box">
          <div className="control-box-header">
            <span className="box-label">Room Operational Status</span>
            <span className="box-val">{rooms.length - offlineRooms.length} of {rooms.length} Active</span>
          </div>

          <div className="room-toggle-list">
            {rooms.map(room => {
              return (
                <div key={room.id} className="room-toggle-item">
                  <div className="room-toggle-meta">
                    <span className="room-toggle-name">{room.name}</span>
                    <span className="room-toggle-sub">
                      Level {room.locationLevel ?? '?'} · {room.capacityPeople} cap · {room.brightModeWatts}W
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`btn-room-status ${room.enabled ? 'room-online' : 'room-offline'}`}
                    onClick={() => onToggleRoom(room.id)}
                    aria-label={`Toggle ${room.name} status`}
                  >
                    {room.enabled ? 'ONLINE' : 'OFFLINE'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Operational Consequence Banner */}
      <div className="impact-feedback-banner">
        <span className="feedback-icon">⚡</span>
        <span className="feedback-text">{impactNarrative}</span>
      </div>
    </section>
  );
};
