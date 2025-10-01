import React, { useState, useEffect } from 'react';
import './CustomerPortal.css';
import room101 from '../images/room101.jpg';
import room102 from '../images/room102.jpg';
import room103 from '../images/room103.jpg';

const CustomerPortal = ({ onLogout, onShowLogin, user }) => {
  const [rooms, setRooms] = useState([
    { id: 1, room_number: '101', type: 'Single', photo: room101, status: 'available', price: 80, amenities: ['WiFi', 'TV', 'AC'] },
    { id: 2, room_number: '102', type: 'Double', photo: room102, status: 'available', price: 120, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'] },
    { id: 3, room_number: '103', type: 'Suite', photo: room103, status: 'available', price: 200, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Jacuzzi'] },
    { id: 4, room_number: '201', type: 'Single', photo: room101, status: 'available', price: 80, amenities: ['WiFi', 'TV', 'AC'] },
    { id: 5, room_number: '202', type: 'Double', photo: room102, status: 'available', price: 120, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'] },
    { id: 6, room_number: '301', type: 'Suite', photo: room103, status: 'available', price: 200, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Jacuzzi'] },
  ]);
  
  const [searchFilters, setSearchFilters] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomType: ''
  });
  
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Fetch room statuses dynamically
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/rooms/statuses');
        const data = await res.json();

        setRooms(prevRooms =>
          prevRooms.map(room => {
            const match = data.find(s => s.id === room.id);
            return match ? { ...room, status: match.status } : room;
          })
        );
      } catch (err) {
        console.error('Failed to fetch room statuses:', err);
      }
    };
    fetchStatuses();
  }, []);

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleBookingSubmit = (bookingData) => {
    console.log('Booking submitted:', bookingData);
    setShowBookingModal(false);
    setShowSuccessMessage(true);
    
    // Auto hide after 4 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 4000);
  };

  const filteredRooms = rooms.filter(room => {
    if (searchFilters.roomType && room.type !== searchFilters.roomType) return false;
    return room.status === 'available';
  });

  return (
    <div className="hotel-booking-app">
      {/* Header */}
      <header className="hotel-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-container">
              <img src="/icons8-3-star-hotel-96.png" alt="Uniwa Hotel Logo" className="hotel-logo" />
              <h1>UNIWA Hotel</h1>
            </div>
            <p>Καλώς ήρθατε στο ξενοδοχείο μας</p>
          </div>
          <div className="header-actions">
            {user ? (
              <div className="user-info">
                <span>Καλώς ήρθατε, {user.role}</span>
                <button className="btn-secondary" onClick={onLogout}>Αποσύνδεση</button>
              </div>
            ) : (
              <button className="btn-primary" onClick={onShowLogin}>Σύνδεση</button>
            )}
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <h2>Βρείτε το ιδανικό δωμάτιο για εσάς</h2>
          <div className="search-form">
            <div className="search-field">
              <label>Άφιξη</label>
              <input 
                type="date" 
                value={searchFilters.checkIn}
                onChange={(e) => setSearchFilters({...searchFilters, checkIn: e.target.value})}
              />
            </div>
            <div className="search-field">
              <label>Αναχώρηση</label>
              <input 
                type="date" 
                value={searchFilters.checkOut}
                onChange={(e) => setSearchFilters({...searchFilters, checkOut: e.target.value})}
              />
            </div>
            <div className="search-field">
              <label>Ένοικοι</label>
              <select 
                value={searchFilters.guests}
                onChange={(e) => setSearchFilters({...searchFilters, guests: e.target.value})}
              >
                <option value={1}>1 Ένοικος</option>
                <option value={2}>2 Ένοικοι</option>
                <option value={3}>3 Ένοικοι</option>
                <option value={4}>4 Ένοικοι</option>
              </select>
            </div>
            <div className="search-field">
              <label>Τύπος Δωματίου</label>
              <select 
                value={searchFilters.roomType}
                onChange={(e) => setSearchFilters({...searchFilters, roomType: e.target.value})}
              >
                <option value="">Όλοι οι τύποι</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Suite">Suite</option>
              </select>
            </div>
            <button className="btn-primary search-btn">Αναζήτηση</button>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="rooms-section">
        <div className="rooms-container">
          <h2>Διαθέσιμα Δωμάτια</h2>
          <div className="rooms-list">
            {filteredRooms.map(room => (
              <div key={room.id} className="room-card">
                <img
                  src={room.photo}
                  alt={`Room ${room.room_number}`}
                />
                <div>Room {room.room_number} - {room.type}</div>
                <div>Status: {room.status}</div>
                <div>Price: €{room.price}/night</div>
                <button 
                  className="btn-primary"
                  onClick={() => handleBookRoom(room)}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && selectedRoom && (
        <BookingModal 
          room={selectedRoom}
          onClose={() => setShowBookingModal(false)}
          onSubmit={handleBookingSubmit}
        />
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="success-notification">
          <div className="success-content">
            <div className="success-icon">✓</div>
            <div className="success-text">
              <h3>Κράτηση Επιτυχής!</h3>
              <p>Θα λάβετε email επιβεβαίωσης σύντομα.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Booking Modal Component
const BookingModal = ({ room, onClose, onSubmit }) => {
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...bookingData, room });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content booking-modal">
        <div className="modal-header">
          <h3>Κράτηση Δωματίου {room.room_number}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-row">
            <div className="form-group">
              <label>Άφιξη</label>
              <input 
                type="date" 
                required
                value={bookingData.checkIn}
                onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Αναχώρηση</label>
              <input 
                type="date" 
                required
                value={bookingData.checkOut}
                onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Αριθμός Ενοίκων</label>
            <select 
              value={bookingData.guests}
              onChange={(e) => setBookingData({...bookingData, guests: e.target.value})}
            >
              <option value={1}>1 Ένοικος</option>
              <option value={2}>2 Ένοικοι</option>
              <option value={3}>3 Ένοικοι</option>
              <option value={4}>4 Ένοικοι</option>
            </select>
          </div>
          <div className="form-group">
            <label>Όνομα</label>
            <input 
              type="text" 
              required
              value={bookingData.name}
              onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              required
              value={bookingData.email}
              onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Τηλέφωνο</label>
            <input 
              type="tel" 
              required
              value={bookingData.phone}
              onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
            />
          </div>
          <div className="booking-summary">
            <h4>Σύνοψη Κράτησης</h4>
            <div className="summary-item">
              <span>Δωμάτιο {room.room_number} - {room.type}</span>
              <span>€{room.price}/βράδυ</span>
            </div>
            <div className="summary-total">
              <span>Σύνολο</span>
              <span>€{room.price}</span>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Ακύρωση
            </button>
            <button type="submit" className="btn-primary">
              Επιβεβαίωση Κράτησης
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerPortal;
