
import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import ReceptionistPortal from './components/ReceptionistPortal';

function App() {
  const [user, setUser] = useState(null);

  // For demo: only receptionist portal after login
  return (
    <div className="App">
      {!user ? (
        <Login onLogin={setUser} />
      ) : (
        <ReceptionistPortal />
      )}
    </div>
  );
}

export default App;
