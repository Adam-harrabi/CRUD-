  // Inline style for soft yellow pending badge
  const getStatusBadgeStyle = (status) => {
    if (status === 'pending') {
      return {
        background: '#FEF9C3', // soft yellow
        color: '#383735ff', // dark yellow text
        borderRadius: '6px',
        padding: '6px 14px',
        fontWeight: '500',
        fontSize: '14px',
        display: 'inline-block'
      };
    }
    return {};
  };
import React, { useState, useEffect } from 'react';
import './Incidents.css'; // Import the CSS file

const Incidents = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ type: '', description: '', date: '' });
  const [incidents, setIncidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get auth token from localStorage or context
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API base URL - adjust this to match your backend URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // New incident types with their priorities
  const incidentTypes = [
    { value: 'Login bug', label: 'Login bug', priority: 'medium' },
    { value: 'Report submission error', label: 'Report submission error', priority: 'low' },
    { value: 'Gate malfunction', label: 'Gate malfunction', priority: 'high' },
    { value: 'Electricity outage', label: 'Electricity outage', priority: 'high' },
    { value: 'Fire', label: 'Fire', priority: 'high' },
    { value: 'Car accident', label: 'Car accident', priority: 'medium' },
    { value: 'Unauthorized worker entry', label: 'Unauthorized worker entry', priority: 'medium' },
    { value: "Worker's vehicle overstaying", label: "Worker's vehicle overstaying", priority: 'low' }
  ];

  // Fetch user's incidents on component mount
  useEffect(() => {
    fetchUserIncidents();
    // Automatically open the form when the component mounts
    setShowForm(true);
  }, []);

  const fetchUserIncidents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = getAuthToken();
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/incidents/my-reports`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Route not found - set empty incidents for now
          setIncidents([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIncidents(data.incidents || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setError('Failed to load incidents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'date') {
      const today = new Date().toISOString().split('T')[0];
      if (value > today) {
        alert('Future dates are not allowed.');
        return;
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.type || !formData.description || !formData.date) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = getAuthToken();
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/incidents/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          description: formData.description.trim(),
          date: formData.date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to submit incident');
      }

      // Add the new incident to the list
      setIncidents(prevIncidents => [data.incident, ...prevIncidents]);
      
      // Reset form but keep it open
      setFormData({ type: '', description: '', date: '' });
      setSuccessMessage('Incident reported successfully!');
      // Don't close the form: setShowForm(false); <- REMOVED
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error('Error submitting incident:', error);
      alert(error.message || 'Failed to submit incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidents = incidents.filter(
    (incident) =>
      incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  // Simple icons as inline SVGs
  const AlertCircleIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );

  const PlusIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );

  const SearchIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );

  const CalendarIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );

  const FileTextIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path>
      <polyline points="14,2 14,8 20,8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10,9 9,9 8,9"></polyline>
    </svg>
  );

  const CheckCircleIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22,4 12,14.01 9,11.01"></polyline>
    </svg>
  );

  const LoadingIcon = () => (
    <svg className="animate-spin" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeDasharray="16" strokeDashoffset="0"></circle>
    </svg>
  );

  const getTypeIcon = (type) => {
    const iconMap = {
      'Login bug': '🐛',
      'Report submission error': '📝',
      'Gate malfunction': '🚪',
      'Electricity outage': '⚡',
      'Fire': '🔥',
      'Car accident': '🚗',
      'Unauthorized worker entry': '👤',
      "Worker's vehicle overstaying": '🅿️'
    };
    return iconMap[type] || '⚠️';
  };

  const getTypeBadgeClass = (type) => {
    const classMap = {
      'Login bug': 'type-badge bug',
      'Report submission error': 'type-badge report-error',
      'Gate malfunction': 'type-badge gate',
      'Electricity outage': 'type-badge electricity',
      'Fire': 'type-badge fire',
      'Car accident': 'type-badge accident',
      'Unauthorized worker entry': 'type-badge unauthorized',
      "Worker's vehicle overstaying": 'type-badge overstay'
    };
    return classMap[type] || 'type-badge default';
  };

  const getPriorityDisplay = (incident) => {
    // Don't show priority to SOS users - this is for admin use only
    return null;
  };

  return (
    <div className="incidents-container">
      {/* Header Section */}
      <div className="incidents-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <AlertCircleIcon />
            </div>
            <div className="header-text">
              <h1>Incident Management</h1>
              <p>Report and track incidents and bugs</p>
            </div>
          </div>
          {/* Removed the Report Incident button since form opens automatically */}
        </div>
      </div>

      <div className="main-content">
        {/* Error Message */}
        {error && (
          <div className="error-message" style={{ 
            background: '#fee2e2', 
            border: '1px solid #fecaca', 
            color: '#dc2626', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircleIcon />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <CheckCircleIcon />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Report Form */}
        {showForm && (
          <div className="form-container">
            <div className="form-header">
              <h2>Report New Incident</h2>
            </div>
            <div className="form-content">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Incident Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={loading}
                  >
                    <option value="">Select incident type</option>
                    {incidentTypes.map((incident) => (
                      <option key={incident.value} value={incident.value}>
                        {incident.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <div className="date-input-container">
                    <CalendarIcon />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <div className="textarea-container">
                  <FileTextIcon />
                  <textarea
                    placeholder="Please provide a detailed description of the incident..."
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="cancel-btn"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingIcon />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="search-container">
          <div className="search-input-container">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search incidents by type or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Incidents List */}
        <div className="incidents-list">
          <div className="list-header">
            <h2>
              My Reported Incidents ({filteredIncidents.length})
              {loading && <LoadingIcon style={{ marginLeft: '8px', width: '16px', height: '16px' }} />}
            </h2>
          </div>
          
          {loading && incidents.length === 0 ? (
            <div className="empty-state">
              <LoadingIcon />
              <h3>Loading incidents...</h3>
              <p>Please wait while we fetch your incidents.</p>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="empty-state">
              <AlertCircleIcon />
              <h3>No incidents found</h3>
              <p>
                {searchTerm ? 'Try adjusting your search criteria.' : 'No incidents have been reported yet.'}
              </p>
            </div>
          ) : (
            <div className="incidents-list-items">
              {filteredIncidents.map((incident) => (
                <div key={incident._id} className="incident-item">
                  <div className="incident-content">
                    <div className="incident-left">
                      <div className="incident-icon" style={{ fontSize: '24px' }}>
                        {getTypeIcon(incident.type)}
                      </div>
                      <div className="incident-details">
                        <div className="incident-meta">
                          <span className={getTypeBadgeClass(incident.type)}>
                            {incident.type}
                          </span>
                          <span className="incident-date">
                            {formatDate(incident.date)}
                          </span>
                          {incident.status && (
                            <span 
                              className={`status-badge ${incident.status.toLowerCase()}`}
                              style={getStatusBadgeStyle(incident.status)}
                            >
                              {incident.status}
                            </span>
                          )}
                          {/* Removed priority display for SOS users */}
                        </div>
                        <p className="incident-description">
                          {incident.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Incidents;