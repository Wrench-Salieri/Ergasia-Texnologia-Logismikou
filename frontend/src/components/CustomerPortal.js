import React, { useState } from 'react';
import './CustomerPortal.css';

const CustomerPortal = () => {
  const [view, setView] = useState('checkin');

  return (
    <div className="customer-portal">
      <h2>Customer Portal</h2>
      <nav>
        <button onClick={() => setView('checkin')}>Check-in/Check-out</button>
        <button onClick={() => setView('availability')}>Room Availability</button>
        <button onClick={() => setView('customers')}>Customers</button>
      </nav>
      <div className="portal-content">
        {view === 'checkin' && <div>Check-in/Check-out screen (to be implemented)</div>}
        {view === 'availability' && <div>Room availability screen (to be implemented)</div>}
        {view === 'customers' && <div>Customer management screen (to be implemented)</div>}
      </div>
    </div>
  );
};

export default CustomerPortal;
