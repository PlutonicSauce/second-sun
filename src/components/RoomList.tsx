import React from 'react';
import type { Room } from '../domain/types';

interface RoomListProps {
  rooms: Room[];
  onToggleRoom: (roomId: string) => void;
}

export const RoomList: React.FC<RoomListProps> = ({ rooms, onToggleRoom }) => {
  return (
    <div className="control-card" role="region" aria-label="Shared Bright-Light Rooms">
      <div className="card-header">
        <h3 className="card-title">Shared Bright-Light Rooms</h3>
        <span className="badge badge-neutral">{rooms.filter(r => r.enabled).length} Active</span>
      </div>

      <div className="rooms-grid">
        {rooms.map(room => (
          <div key={room.id} className={`room-card ${!room.enabled ? 'room-card-offline' : ''}`}>
            <div className="room-card-header">
              <div>
                <span className="room-card-name">{room.name}</span>
                <span className="room-card-id">({room.id})</span>
              </div>
              <button
                type="button"
                className={`btn-toggle ${room.enabled ? 'btn-toggle-on' : 'btn-toggle-off'}`}
                onClick={() => onToggleRoom(room.id)}
                aria-pressed={room.enabled}
                title={room.enabled ? 'Click to take offline' : 'Click to enable'}
              >
                {room.enabled ? 'Online' : 'Offline'}
              </button>
            </div>
            <div className="room-card-specs">
              <span>👥 Max {room.capacityPeople} people</span>
              <span>⚡ {room.brightModeWatts}W bright mode</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
