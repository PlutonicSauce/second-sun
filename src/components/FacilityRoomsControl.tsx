import React from 'react';
import type { Room } from '../domain/types';

interface FacilityRoomsControlProps {
  rooms: Room[];
  onToggleRoom: (roomId: string) => void;
  activeRoomIds: Set<string>;
}

export const FacilityRoomsControl: React.FC<FacilityRoomsControlProps> = ({
  rooms,
  onToggleRoom,
  activeRoomIds,
}) => {
  return (
    <div className="rooms-control-section no-print" aria-label="Facility Room Availability Controls">
      <div className="rooms-control-header">
        <div className="rooms-control-title-group">
          <h2 className="rooms-control-title">Room availability</h2>
          <p className="rooms-control-desc">
            Take a room offline to recalculate the plan.
          </p>
        </div>
      </div>

      <div className="rooms-control-grid">
        {rooms.map(room => {
          const isAssigned = activeRoomIds.has(room.id);
          return (
            <div
              key={room.id}
              className={`room-control-card ${room.enabled ? 'room-card-enabled' : 'room-card-disabled'}`}
            >
              <div className="room-card-info">
                <div className="room-card-top">
                  <span className="room-card-name">{room.name}</span>
                  <span className={`room-status-badge ${room.enabled ? 'status-online' : 'status-offline'}`}>
                    {room.enabled ? (isAssigned ? 'Booked' : 'Available') : 'Offline'}
                  </span>
                </div>
                <div className="room-card-specs">
                  Level {room.locationLevel ?? '?'} · {room.brightModeWatts} W · {room.capacityPeople} people
                </div>
              </div>

              <button
                type="button"
                className={`btn-room-toggle ${room.enabled ? 'btn-toggle-active' : 'btn-toggle-offline'}`}
                onClick={() => onToggleRoom(room.id)}
                title={room.enabled ? `Take ${room.name} offline for maintenance` : `Bring ${room.name} back online`}
              >
                {room.enabled ? 'Take Offline' : 'Bring Online'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
