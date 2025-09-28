import React, { useState } from 'react';
import './Login.css';
import logo from '../images/hotel-icon-logo.svg'

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (username && password) {
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data); // data should include token and role
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Server error');
    }
  } else {
    setError('Please enter both username and password.');
  }
};

  return (
    <div className="login-container">
      <img src={logo} alt="Hotel Logo" className="login-logo" />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <div className="error">{error}</div>}
        <button type="registration">Register</button>
      </form>
    </div>
  );
};

export default Login;
