import React, { useState, useEffect } from 'react';
import './ReceptionistPortal.css';
import room101 from '../images/room101.jpg';
import room102 from '../images/room102.jpg';
import room103 from '../images/room103.jpg';
import customerImg from '../images/customer.png';

const rooms = [
  { id: 1, room_number: '101', type: 'Single', photo: room101 },
  { id: 2, room_number: '102', type: 'Double', photo: room102 },
  { id: 3, room_number: '103', type: 'Suite', photo: room103 }
];

const initialCustomers = [
  { id: 1, name: 'John Doe', email: 'john.doe@email.com', photo: customerImg, status: 'left'  },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@email.com', photo: customerImg, status: 'check-out'  },
  { id: 3, name: 'Γιαννουλάκης Αθανάσιος', email: '22390033@email.com', photo: customerImg, status: 'left' },
  { id: 4, name: 'Αλέξανδρος-Μάριος Τρόφιν', email: '20390235@email.com', photo: customerImg, status: 'left' },
  { id: 5, name: 'Χριστόφορος-Σταύρος Ταντής', email: '22390219@email.com', photo: customerImg, status: 'left' },
  { id: 6, name: 'Κέβιν Ιλίρι', email: '22390282@email.com', photo: customerImg, status: 'left' },
  { id: 7, name: 'Customer One', email: 'customer1@email.com', photo: customerImg, status: 'check-in'  }
];


const ReceptionistPortal = () => {
  const [view, setView] = useState('checkin');
  const [roomsState, setRooms] = useState(
    rooms.map(r => ({ ...r, status: 'loading' }))
  );
  const [customers, setCustomers] = useState(initialCustomers);

// Log out Function
const handleReload = () => {
  window.location.reload();
};

  // Fetch statuses from backend
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/rooms/statuses');
        if (!res.ok) throw new Error('Failed to fetch statuses');
        const statuses = await res.json();

        // Merge statuses into hardcoded rooms
        const updatedRooms = rooms.map(room => {
          const match = statuses.find(s => s.id === room.id);
          return match ? { ...room, status: match.status } : { ...room, status: 'unknown' };
        });

        setRooms(updatedRooms);
      } catch (err) {
        console.error(err);
        alert('Could not load room statuses');
        // fallback to 'unknown'
        setRooms(rooms.map(r => ({ ...r, status: 'unknown' })));
      }
    };

    fetchStatuses();
  }, []);
  
  // Toggle status
  const handleStatusChange = async (roomId, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'occupied' : 'available';

    try {
      const res = await fetch(`http://localhost:3001/api/rooms/${roomId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setRooms(prevRooms =>
          prevRooms.map(room =>
            room.id === roomId ? { ...room, status: newStatus } : room
          )
        );
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  // Toggle customer status
  const toggleCustomerStatus = (customerId) => {
    setCustomers(prev =>
      prev.map(cust => {
        if (cust.id !== customerId) return cust;
        let newStatus;
        if (cust.status === 'check-in') newStatus = 'check-out';
        else if (cust.status === 'check-out') newStatus = 'left';
        else newStatus = 'check-in';
        return { ...cust, status: newStatus };
      })
    );
  };

  return (
    <div className="receptionist-portal">
      <h2>Receptionist Portal</h2>
      <nav>
        <button onClick={() => setView('checkin')}>Check-in/Check-out</button>
        <button onClick={() => setView('availability')}>Room Availability</button>
        <button onClick={() => setView('customers')}>Customers</button>
        <button onClick={handleReload}>Log-Out</button>
      </nav>
      <div className="portal-content">
        {view === 'checkin' && (
          <div>
            <h3>Check-in / Check-out</h3>
            <div className="rooms-list">
              {customers
                .slice() // create a copy to avoid mutating state
                .sort((a, b) => {
                  const order = { 'check-in': 0, 'check-out': 1, 'left': 2 };
                  return order[a.status] - order[b.status];
                })
                .map(cust => {
                  let badgeColor;
                  if (cust.status === 'check-in') badgeColor = '#4caf50'; // green
                  else if (cust.status === 'check-out') badgeColor = '#ff9800'; // orange
                  else badgeColor = '#f44336'; // red for 'left'

                  return (
                    <div key={cust.id} className="room-card">
                      <img
                        src={cust.photo}
                        alt={cust.name}
                        style={{ width: '120px', height: '120px', borderRadius: '60px', marginBottom: '10px', objectFit: 'cover' }}
                      />
                      <div>{cust.name}</div>
                      <div>
                        Status: <span style={{ color: badgeColor, fontWeight: 'bold' }}>{cust.status}</span>
                      </div>
                      <button onClick={() => toggleCustomerStatus(cust.id)}>Toggle Status</button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
        {view === 'availability' && (
          <div>
            <h3>Room Availability</h3>
            <div className="rooms-list">
              {roomsState.map(room => (
                <div key={room.id} className="room-card">
                  <img
                    src={room.photo}
                    alt={`Room ${room.room_number}`}
                    style={{ width: '120px', height: '80px' }}
                  />
                  <div>
                    Room {room.room_number} - {room.type}
                  </div>
                  <div>Status: {room.status}</div>
                  <button onClick={() => handleStatusChange(room.id, room.status)}>
                    Toggle Status
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {view === 'customers' && <div>
          <h3>Customers</h3>
          <div className="customers-list">
            {customers.map(customer => (
              <div key={customer.id} className="customer-card">
                <img
                  src={customer.photo}
                  alt={customer.name}
                  style={{ width: '80px', height: '80px', borderRadius: '40px' }}
                />
                <div>{customer.name}</div>
                <div>{customer.email}</div>
              </div>
            ))}
          </div>
        </div>}
      </div>
    </div>
  );
};

export default ReceptionistPortal;
