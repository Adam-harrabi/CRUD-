import React, { useState } from 'react';
import './UserDropdown.css';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData')) || {
    name: 'John Doe',
    email: 'user@example.com',
    CIN: '12345678',
    birthdate: '1990-01-01',
    phone: '+1234567890'
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = '/signin';
  };

  return (
    <div className="user-dropdown">
      <div className="user-avatar" onClick={toggleDropdown}>
        <img src={require('../assets/default-avatar.png')} alt="User Avatar" />
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          <div className="user-info">
            <strong>{userData.name}</strong>
          </div>
          <ul>
            <li onClick={() => window.location.href = '/profile'}>Your Profile</li>
            <li onClick={() => window.location.href = '/password'}>Password</li>
            <li onClick={handleSignOut}>Sign Out</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;