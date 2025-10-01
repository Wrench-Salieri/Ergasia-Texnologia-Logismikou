import React, { useState } from 'react';
import CustomerPortal from './CustomerPortal';
import PaymentManagement from './PaymentManagement';
import ReceptionistPortal from './ReceptionistPortal';
import './AdminPortal.css';

const AdminPortal = ({ token }) => {
  const [activePortal, setActivePortal] = useState('dashboard');

  const renderPortal = () => {
    switch (activePortal) {
      case 'customers':
        return <CustomerPortal token={token} />;
      case 'payments':
        return <PaymentManagement token={token} />;
      case 'rooms':
        return <ReceptionistPortal token={token} />;
      default:
        return (
          <div className="dashboard">
            <h2>Welcome, Admin!</h2>
            <p>Select a portal to manage:</p>
            <div className="portal-buttons">
              <button
                className={activePortal === 'customers' ? 'active' : ''}
                onClick={() => setActivePortal('customers')}
              >
                Customer Management
              </button>
              <button
                className={activePortal === 'payments' ? 'active' : ''}
                onClick={() => setActivePortal('payments')}
              >
                Payment Management
              </button>
              <button
                className={activePortal === 'rooms' ? 'active' : ''}
                onClick={() => setActivePortal('rooms')}
              >
                Receptionist Management
              </button>
            </div>
          </div>
        );
    }
  };

  const handleLogout = () => {
    window.location.reload();
  };

  return (
    <div className="admin-portal">
      <nav className="admin-nav">
        <button
          className={activePortal === 'dashboard' ? 'active' : ''}
          onClick={() => setActivePortal('dashboard')}
        >
          Dashboard
        </button>
        <button onClick={handleLogout}>Log Out</button>
      </nav>
      <div className="portal-container">{renderPortal()}</div>
    </div>
  );
};

export default AdminPortal;
