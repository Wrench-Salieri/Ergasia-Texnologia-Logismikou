
import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import ReceptionistPortal from './components/ReceptionistPortal';
import AdminPortal from './components/AdminPortal';
import CustomerPortal from './components/CustomerPortal';
import PaymentPortal from './components/PaymentManagement';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      {!user ? (
        <Login onLogin={setUser} />
      ) : user.role === 'receptionist' ? (
        <ReceptionistPortal user={user} />
      ) : user.role === 'admin' ? (
        <AdminPortal user={user} />
      ) : user.role === 'payment_manager' ? (
        <PaymentPortal user={user} />
      ) : user.role === 'customer' ? (
        <CustomerPortal user={user} />
      ) : (
        <div>Unauthorized</div>
      )}
    </div>
  );
}

export default App;
