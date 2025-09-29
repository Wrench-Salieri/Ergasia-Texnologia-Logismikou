import React, { useState } from 'react';
import './CustomerPortal.css';
import room101 from '../images/room101.jpg';
import room102 from '../images/room102.jpg';
import room103 from '../images/room103.jpg';

const CustomerPortal = () => {
  const [view, setView] = useState('rooms');

  const rooms = [
    { id: 1, room_number: '101', type: 'Single', status: 'available', photo: room101 },
    { id: 2, room_number: '102', type: 'Double', status: 'occupied', photo: room102 },
    { id: 3, room_number: '103', type: 'Suite', status: 'maintenance', photo: room103 }
  ];

  return (
    <div className="customer-portal">
      <h2>UNIWA Hotel</h2>
      <nav>
        <button onClick={() => setView('search')}>Search</button>
        <button onClick={() => setView('logout')}>Log-Out</button>
      </nav>
      <div className="portal-content">
        {view === 'rooms' && (
          <div>
            <h3>Hotel Rooms</h3>
            <div className="rooms-list">
              {rooms.map(room => (
                <div key={room.id} className="room-card">
                  <img src={room.photo} alt={`Room ${room.room_number}`} style={{ width: '120px', height: '80px' }} />
                  <div>Room {room.room_number} - {room.type}</div>
                  <div>Status: {room.status}</div>
                  <button>Book Now</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {view === 'search' && <div>Search screen (to be implemented)</div>}
        {view === 'logout' && <div>Log-Out screen (to be implemented)</div>}
      </div>
    </div>
  );
};

export default CustomerPortal;
