import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import '../styles/form.css';

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
    const { data: regData } = await API.post('/api/auth/register', { name, email, password });

    if (regData.success) {
      const { data: otpData } = await API.post('/api/auth/send-otp', { email, name });

      if (otpData.success) {
        setMessage(' Registered successfully! OTP sent to your email.');
        // ✅ Navigate after showing message, with email state
        setTimeout(() => navigate('/verify-otp', { state: { email } }), 1500);
      } else {
        setMessage('⚠️ Registered but failed to send OTP.');
      }
    } else {
      setMessage(regData.message);
    }
    } catch (err) {
      setMessage('❌ Something went wrong.');
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
      <p className="link-text">Already have an account? <Link to="/login">Login</Link></p>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Register;
