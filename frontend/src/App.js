
import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import ReceptionistPortal from './components/ReceptionistPortal';
import AdminPortal from './components/AdminPortal';
import CustomerPortal from './components/CustomerPortal';
import PaymentPortal from './components/PaymentManagement';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  // Load user from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Save user to localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Function to handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Function to handle portal switching from admin
  const handlePortalSwitch = (portalType) => {
    const newUser = { ...user, role: portalType };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <div className="App">
      {showLogin ? (
        <Login onLogin={setUser} onCancel={() => setShowLogin(false)} />
      ) : user && user.role === 'receptionist' ? (
        <ReceptionistPortal user={user} onLogout={handleLogout} />
      ) : user && user.role === 'admin' ? (
        <AdminPortal user={user} onLogout={handleLogout} onSwitchPortal={handlePortalSwitch} />
      ) : user && user.role === 'payment_manager' ? (
        <PaymentPortal user={user} onLogout={handleLogout} />
      ) : (
        <CustomerPortal 
          user={user} 
          onLogout={handleLogout} 
          onShowLogin={() => setShowLogin(true)}
        />
      )}
    </div>
  );
}

export default App;
