import React, { useState } from 'react';
import './ReceptionistPortal.css';
import room101 from '../images/room101.jpg';
import room102 from '../images/room102.jpg';
import room103 from '../images/room103.jpg';

const rooms = [
  { id: 1, room_number: '101', type: 'Single', status: 'available', photo: room101 },
  { id: 2, room_number: '102', type: 'Double', status: 'occupied', photo: room102 },
  { id: 3, room_number: '103', type: 'Suite', status: 'maintenance', photo: room103 }
];

const ReceptionistPortal = () => {
  const [view, setView] = useState('checkin');
  const [roomsState, setRooms] = useState(rooms);

  
  const handleStatusChange = async (roomId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:3001/api/rooms/${roomId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setRooms(rooms =>
          rooms.map(room =>
            room.id === roomId ? { ...room, status: newStatus } : room
          )
        );
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="receptionist-portal">
      <h2>Receptionist Portal</h2>
      <nav>
        <button onClick={() => setView('checkin')}>Check-in/Check-out</button>
        <button onClick={() => setView('availability')}>Room Availability</button>
        <button onClick={() => setView('customers')}>Customers</button>
      </nav>
      <div className="portal-content">
        {view === 'checkin' && <div>Check-in/Check-out screen (to be implemented)</div>}
        {view === 'availability' && (
          <div>
            <h3>Room Availability</h3>
            <div className="rooms-list">
              {rooms.map(room => (
                <div key={room.id} className="room-card">
                  <img src={room.photo} alt={`Room ${room.room_number}`} style={{ width: '120px', height: '80px' }} />
                  <div>Room {room.room_number} - {room.type}</div>
                  <div>Status: {room.status}</div>
                  <button onClick={() => handleStatusChange(room.id, room.status === 'available' ? 'occupied' : 'available')}>
                    Toggle Status
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {view === 'customers' && <div>Customer management screen (to be implemented)</div>}
      </div>
    </div>
  );
};

export default ReceptionistPortal;
