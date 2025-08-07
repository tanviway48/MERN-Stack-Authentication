import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import '../styles/form.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/api/auth/login', { email, password });

      if (data.success) {
        setMessage(' Login successful!');
        setTimeout(() => navigate('/dashboard'), 1000); 
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch (err) {
      setMessage('❌ Something went wrong.');
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p className="link-text">
        Not registered? <Link to="/register">Register</Link>
      </p>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Login;
