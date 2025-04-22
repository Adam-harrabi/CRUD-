import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import leoniLogo from '../../assets/leoni-logo.jpg';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cin: '',
    firstName: '',
    lastName: '',
    birthdate: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!Object.values(formData).every((field) => field.trim() !== '')) {
      setError('Please fill in all fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    const newRequest = {
      id: Date.now(),
      ...formData,
      requestDate: new Date().toISOString(),
      status: 'pending'
    };

    const existingRequests = JSON.parse(localStorage.getItem('signupRequests') || '[]');
    localStorage.setItem('signupRequests', JSON.stringify([...existingRequests, newRequest]));

    setSuccess(true);
    setTimeout(() => navigate('/signin'), 3000);
  };

  const handleReset = () => {
    setFormData({
      cin: '',
      firstName: '',
      lastName: '',
      birthdate: '',
      phoneNumber: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-left">
            <img src={leoniLogo} alt="Leoni Logo" />
            <h2>Welcome to Leoni!</h2>
          </div>
          <div className="auth-right">
            <div className="success-message">
              <h2>Registration Successful!</h2>
              <p>Your account has been created and is pending admin activation.</p>
              
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-left">
          <img src={leoniLogo} alt="Leoni Logo" />
          <h2>Create Your Account</h2>
        </div>
        <div className="auth-right">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="cin">CIN</label>
              <input
                type="text"
                id="cin"
                value={formData.cin}
                onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                placeholder="Enter your CIN"
              />
            </div>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter your first name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Enter your last name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="birthdate">Birthdate</label>
              <input
                type="date"
                id="birthdate"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="buttons-group">
              <button type="submit" className="auth-button">Sign Up</button>
              <button type="button" className="auth-button secondary" onClick={handleReset}>Reset</button>
            </div>
            <div className="auth-links">
              <Link to="/signin">Already have an account? Sign In</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
