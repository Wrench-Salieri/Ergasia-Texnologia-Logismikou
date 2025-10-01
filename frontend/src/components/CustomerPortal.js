import React, { useState, useEffect } from 'react';
import './CustomerPortal.css';
import room101 from '../images/room101.jpg';
import room102 from '../images/room102.jpg';
import room103 from '../images/room103.jpg';

const CustomerPortal = () => {
  const [view, setView] = useState('rooms');
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rooms, setRooms] = useState([
    { id: 1, room_number: '101', type: 'Single', photo: room101, status: 'unknown' },
    { id: 2, room_number: '102', type: 'Double', photo: room102, status: 'unknown' },
    { id: 3, room_number: '103', type: 'Suite', photo: room103, status: 'unknown' },
  ]);

// Log out Function
const handleReload = () => {
  window.location.reload();
};  

// Fetch room statuses dynamically
useEffect(() => {
  const fetchStatuses = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/rooms/statuses');
      const data = await res.json();

      // Merge statuses into rooms
      setRooms(prevRooms =>
        prevRooms.map(room => {
          const match = data.find(s => s.id === room.id);
          return match ? { ...room, status: match.status } : room;
        })
      );
    } catch (err) {
      console.error('Failed to fetch room statuses:', err);
      alert('Could not load room statuses');
    }
  };
  fetchStatuses();
}, []);

// Filter room
const filteredRooms = rooms.filter(room => {
    const matchesQuery =
      !query ||
      room.room_number.includes(query) ||
      room.type.toLowerCase().includes(query.toLowerCase()) ||
      room.status.toLowerCase().includes(query.toLowerCase());
    const matchesType = !typeFilter || room.type === typeFilter;
    const matchesStatus = !statusFilter || room.status === statusFilter;
    return matchesQuery && matchesType && matchesStatus;
  });


  return (
    <div className="customer-portal">
      <h2>UNIWA Hotel</h2>
      <nav>
        <button onClick={() => setShowSearch(!showSearch)}>Search</button>
        <button onClick={handleReload}>Log-Out</button>
      </nav>
      {showSearch && (
        <div className="search-popup">
          <input
            type="text"
            placeholder="Search rooms..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={() => setShowSearch(false)}>Close</button>
        </div>
      )}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="Single">Single</option>
          <option value="Double">Double</option>
          <option value="Suite">Suite</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="available">Available</option>
        </select>
        <button onClick={() => { setTypeFilter(''); setStatusFilter(''); }}>Clear Filters</button>
      </div>
      <div className="portal-content">
        {view === 'rooms' && (
          <div>
            <h3>Hotel Rooms</h3>
            <div className="rooms-list">
              {filteredRooms.map(room => (
                <div key={room.id} className="room-card">
                  <img
                    src={room.photo}
                    alt={`Room ${room.room_number}`}
                    style={{ width: '120px', height: '80px' }}
                 />
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
