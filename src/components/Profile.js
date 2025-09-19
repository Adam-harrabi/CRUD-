import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    cin: '',
    birthdate: '',
    phoneNumber: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // API base URL - adjust this to match your backend
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // API headers with authorization
  const getHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setFormData({
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        cin: data.user.cin,
        birthdate: data.user.birthdate.split('T')[0], // Format date for input
        phoneNumber: data.user.phoneNumber
      });
      setError('');
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to update profile');
      }

      alert('Profile updated successfully!');
      setIsEditing(false);
      setError('');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    // Reset form data to original values
    fetchUserProfile();
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate new password confirmation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    // Validate new password length
    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long!');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to change password');
      }

      alert('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.message);
      alert('Failed to change password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordCancel = () => {
    setIsChangingPassword(false);
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setError('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'profile_data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !isEditing && !isChangingPassword) {
    return (
      <div className="profile-main-container">
        <div className="loading-container">
          <div>Loading profile...</div>
        </div>
      </div>
    );
  }

  // Password Change Modal
  if (isChangingPassword) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Change Password</h2>
            <button 
              onClick={handlePasswordCancel}
              className="modal-close"
              disabled={loading}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-container">
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-fields">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    className="form-input"
                    placeholder="Enter your current password"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="form-input"
                    placeholder="Enter your new password"
                    minLength="6"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="form-input"
                    placeholder="Confirm your new password"
                    minLength="6"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={handlePasswordCancel}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Edit Profile</h2>
            <button 
              onClick={handleCancel}
              className="modal-close"
              disabled={loading}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-container">
            <div className="form-fields">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="form-input"
                  placeholder="Enter your first name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="form-input"
                  placeholder="Enter your last name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">National ID (CIN)</label>
                <input
                  type="text"
                  value={formData.cin}
                  onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                  className="form-input"
                  placeholder="Enter your CIN"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,8}$/.test(value)) {
                      setFormData({ ...formData, phoneNumber: value });
                    }
                  }}
                  className="form-input"
                  placeholder="12345678"
                  minLength="8"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={loading}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-main-container">
      <div className="profile-wrapper">
        {/* Header matching dashboard style */}
        <div className="profile-header">
          <div className="profile-header-left">
            <div className="profile-avatar">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="profile-header-info">
              <h1>Profile Information</h1>
              <p>Manage your account details and personal information</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-card-content">
            <div className="profile-grid">
              <div className="profile-field">
                <div className="profile-field-label">FULL NAME</div>
                <div className="profile-field-value">{formData.firstName} {formData.lastName}</div>
              </div>

              <div className="profile-field">
                <div className="profile-field-label">DATE OF BIRTH</div>
                <div className="profile-field-value regular">{formatDate(formData.birthdate)}</div>
              </div>

              <div className="profile-field">
                <div className="profile-field-label">EMAIL ADDRESS</div>
                <div className="profile-field-value regular">{formData.email}</div>
              </div>

              <div className="profile-field">
                <div className="profile-field-label">PHONE NUMBER</div>
                <div className="profile-field-value mono">+216 {formData.phoneNumber}</div>
              </div>

              <div className="profile-field">
                <div className="profile-field-label">NATIONAL ID</div>
                <div className="profile-field-value mono">{formData.cin}</div>
              </div>

              <div className="profile-field">
                <div className="profile-field-label">ACCOUNT STATUS</div>
                <div className="status-badge">
                  <div className="status-dot"></div>
                  Active
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="profile-actions">
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
              disabled={loading}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>

            <button
              onClick={() => setIsChangingPassword(true)}
              className="btn btn-secondary"
              disabled={loading}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2 2 2 0 00-2-2m-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2h1m4-6a2 2 0 104 0 2 2 0 00-4 0z" />
              </svg>
              Change Password
            </button>
            
            <button 
              onClick={handleExportData}
              className="btn btn-secondary"
              disabled={loading}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;