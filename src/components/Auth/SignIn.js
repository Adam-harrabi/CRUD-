import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import leoniLogo from '../../assets/leoni-logo.jpg';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Check for admin credentials
    if (formData.email === 'admin@leoni.com' && formData.password === 'admin') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'admin');
      navigate('/suppliers');
      return;
    }

    // Check for SOS user credentials
    if (formData.email === 'sos@leoni.com' && formData.password === 'sos123') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'sos');
      navigate('/sos/suppliers');
      return;
    }

    setError('Invalid email or password');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-left">
          <div className="auth-logo">
            <img src={leoniLogo} alt="Leoni Logo" />
          </div>
          <h1>Welcome Back!</h1>
        </div>
        <div className="auth-right">
          <form onSubmit={handleSubmit} className="auth-form">
            <h2>Sign In</h2>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter your password"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="auth-button">Sign In</button>
            <div className="auth-links">
              <Link to="/signup">Don't have an account? Sign Up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;