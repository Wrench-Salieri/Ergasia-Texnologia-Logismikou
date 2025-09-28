import React, { useState } from 'react';
import './ReceptionistPortal.css';

const ReceptionistPortal = () => {
  const [view, setView] = useState('checkin');

  const rooms = [
    { id: 1, room_number: '101', type: 'Single', status: 'available', photo: '/images/room101.jpg' },
    { id: 2, room_number: '102', type: 'Double', status: 'occupied', photo: '/images/room102.jpg' },
    { id: 3, room_number: '103', type: 'Suite', status: 'maintenance', photo: '/images/room103.jpg' }
  ];
  
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
