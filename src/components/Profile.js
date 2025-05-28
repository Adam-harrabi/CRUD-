import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    CIN: '',
    birthdate: '',
    phone: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Simulate fetching user data from localStorage or API
    const userData = JSON.parse(localStorage.getItem('userData')) || {
      email: 'user@example.com',
      name: 'John Doe',
      password: 'password123',
      CIN: '12345678',
      birthdate: '1990-01-01',
      phone: '4567890'
    };
    setFormData(userData);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate saving user data to localStorage or API
    localStorage.setItem('userData', JSON.stringify(formData));
    alert('Profile updated successfully!');
    setIsEditing(false);
    setShowForm(false);
  };

  return (
    <div className="profile-container">
      {isEditing ? (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="CIN"
                value={formData.CIN}
                onChange={(e) => setFormData({ ...formData, CIN: e.target.value })}
                required
              />
              <input
                type="date"
                placeholder="Birthdate"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,8}$/.test(value)) {
                    setFormData({ ...formData, phone: value });
                  }
                }}
                minLength="8"
                required
              />
              <div className="modal-buttons">
                <button type="submit" className="update-button">Update</button>
                <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '30px', width: '100%', backgroundColor: '#f9f9f9', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <p style={{ fontSize: '30px', color: '#333', textAlign: 'center', margin: '10px 0' }}><strong style={{ fontSize: '32px', color: '#000' }}>Name:</strong> {formData.name}</p>
          <p style={{ fontSize: '30px', color: '#333', textAlign: 'center', margin: '10px 0' }}><strong style={{ fontSize: '32px', color: '#000' }}>Email:</strong> {formData.email}</p>
          <p style={{ fontSize: '30px', color: '#333', textAlign: 'center', margin: '10px 0' }}><strong style={{ fontSize: '32px', color: '#000' }}>CIN:</strong> {formData.CIN}</p>
          <p style={{ fontSize: '30px', color: '#333', textAlign: 'center', margin: '10px 0' }}><strong style={{ fontSize: '32px', color: '#000' }}>Birthdate:</strong> {formData.birthdate}</p>
          <p style={{ fontSize: '30px', color: '#333', textAlign: 'center', margin: '10px 0' }}><strong style={{ fontSize: '32px', color: '#000' }}>Phone:</strong> {formData.phone}</p>
          <button className="edit-profile-button" style={{ padding: '15px 30px', fontSize: '22px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.3s ease', marginTop: '20px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }} onClick={() => { setIsEditing(true); setShowForm(true); }}>
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;