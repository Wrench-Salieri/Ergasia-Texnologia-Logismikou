import React, { useState } from 'react';
import './PaymentPortal.css';

const PaymentPortal = () => {
  const [view, setView] = useState('checkin');

  return (
    <div className="payment-portal">
      <h2>Payment Portal</h2>
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

export default PaymentPortal;
