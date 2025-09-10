import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import leoniLogo from '../../assets/leoni-logo.jpg';
import axios from 'axios';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', { email: formData.email }); // Debug log
      
      // Make POST request to backend login with explicit headers
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email.trim(), // Remove any whitespace
        password: formData.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('Login response:', res.data); // Debug log

      // Check if we got the expected response structure
      if (res.data && res.data.token) {
        // Save token and user info in localStorage
        localStorage.setItem('token', res.data.token);
        
        // Save user info if available
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
          localStorage.setItem('userRole', res.data.user.role); // or derive from res.data.user if you have role field
        }

        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err); // Better error logging
      
      if (err.code === 'ECONNABORTED') {
        setError('Connection timeout. Please try again.');
      } else if (err.response) {
        // Server responded with error status
        const message = err.response.data?.msg || err.response.data?.message || 'Login failed';
        setError(message);
      } else if (err.request) {
        // Request was made but no response received
        setError('Unable to connect to server. Please check your connection.');
      } else {
        // Something else happened
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
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
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button 
              type="submit" 
              className="auth-button" 
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
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