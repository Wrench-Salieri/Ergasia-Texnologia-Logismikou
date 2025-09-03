import React, { useState } from 'react';
import './Login.css';
import logo from '../images/hotel-icon-logo.svg'

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username);
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
