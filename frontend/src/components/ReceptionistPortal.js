import React, { useState } from 'react';
import './ReceptionistPortal.css';

const ReceptionistPortal = () => {
  const [view, setView] = useState('checkin');

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
        {view === 'availability' && <div>Room availability screen (to be implemented)</div>}
        {view === 'customers' && <div>Customer management screen (to be implemented)</div>}
      </div>
    </div>
  );
};

export default ReceptionistPortal;
