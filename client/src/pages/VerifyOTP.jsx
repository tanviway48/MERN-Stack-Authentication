// src/pages/VerifyOtp.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from route state
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      setMessage('Email not found. Please register again.');
    }
  }, [location.state]);

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await axios.post(
        'http://localhost:4000/api/auth/verify-otp',
        { email, otp }, // include email here
        { withCredentials: true }
      );

      if (res.data.success) {
        setMessage('OTP Verified! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setMessage(res.data.message || 'Verification failed.');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Server error');
    }
  };

  return (
    <div className="box">
      <h2>Verify OTP</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          required
        />
        <button type="submit">Verify</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default VerifyOtp;
