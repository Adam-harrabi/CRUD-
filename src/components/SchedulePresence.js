import React, { useState, useEffect } from 'react';
import './SharedStyles.css';

const SchedulePresence = () => {
  const [schedules, setSchedules] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [formData, setFormData] = useState({
    supplierName: '',
    date: '',
    time: '',
    reason: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Get auth token from localStorage
  const getAuthToken = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token;
  };

  // API headers with authentication
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  });

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/suppliers', {
        headers: getHeaders()
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSuppliers(result.data);
        } else if (result.suppliers) {
          setSuppliers(result.suppliers);
        }
      } else {
        setError('Failed to fetch suppliers');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/schedule-presence', {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const result = await response.json();
      if (result.success) {
        setSchedules(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch schedules');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchSuppliers();
  }, []);

  const handleSupplierNameChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, supplierName: value });

    if (value.length > 0) {
      const filtered = suppliers.filter(supplier =>
        supplier.name && supplier.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuppliers(filtered);
      setShowSupplierDropdown(filtered.length > 0);
    } else {
      setShowSupplierDropdown(false);
      setFilteredSuppliers([]);
    }
  };

  const handleSupplierSelect = (supplier) => {
    setFormData({ ...formData, supplierName: supplier.name });
    setShowSupplierDropdown(false);
    setFilteredSuppliers([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    // ✅ Validation: ensure supplier exists
    const matchedSupplier = suppliers.find(
      supplier => supplier.name.toLowerCase() === formData.supplierName.toLowerCase()
    );

    if (!matchedSupplier) {
      setValidationError('⚠️ Please select a valid supplier from the list.');
      return;
    }

    try {
      const url = isEditing
        ? `http://localhost:5000/api/schedule-presence/${editId}`
        : 'http://localhost:5000/api/schedule-presence';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({
          supplierName: matchedSupplier.name,
          date: formData.date,
          time: formData.time,
          reason: formData.reason
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to save schedule');

      if (result.success) {
        if (isEditing) {
          setSchedules(schedules.map(schedule =>
            schedule._id === editId ? result.data : schedule
          ));
          alert('Schedule updated successfully!');
        } else {
          setSchedules([...schedules, result.data]);
          alert('Schedule presence added successfully!');
        }
        resetForm();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (schedule) => {
    setIsEditing(true);
    setEditId(schedule._id);
    setFormData({
      supplierName: schedule.supplierName,
      date: schedule.date.split('T')[0],
      time: schedule.time,
      reason: schedule.reason
    });
    setShowForm(true);
  };

  const handleDeleteClick = (schedule) => {
    setScheduleToDelete(schedule);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/schedule-presence/${scheduleToDelete._id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to delete schedule');
      if (result.success) {
        setSchedules(schedules.filter(s => s._id !== scheduleToDelete._id));
        alert('Schedule deleted successfully!');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setShowDeleteConfirm(false);
      setScheduleToDelete(null);
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert('You cannot select a past date.');
      setFormData({ ...formData, date: '' });
    } else {
      setFormData({ ...formData, date: e.target.value });
    }
  };

  const resetForm = () => {
    setFormData({
      supplierName: '',
      date: '',
      time: '',
      reason: ''
    });
    setShowForm(false);
    setIsEditing(false);
    setEditId(null);
    setShowSupplierDropdown(false);
    setFilteredSuppliers([]);
    setValidationError('');
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  const formatTime = (time) => time || 'Not set';

  const filteredSchedules = schedules.filter(schedule =>
    schedule.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading schedules...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Schedule Presence Management</h1>
        <button className="add-button" style={{ marginRight: '150px' }} onClick={() => setShowForm(true)}>
          + Schedule Presence
        </button>
      </div>

      {error && (
        <div className="error-message" style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by supplier name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="list">
        <table>
          <thead>
            <tr>
              <th>SUPPLIER NAME</th>
              <th>DATE</th>
              <th>TIME</th>
              <th>REASON</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  No schedules found
                </td>
              </tr>
            ) : (
              filteredSchedules.map(schedule => (
                <tr key={schedule._id}>
                  <td>{schedule.supplierName}</td>
                  <td>{formatDate(schedule.date)}</td>
                  <td>{formatTime(schedule.time)}</td>
                  <td>{schedule.reason}</td>
                
                  <td>
                    <button className="edit-button" onClick={() => handleEdit(schedule)}>Edit</button>
                    <button className="delete-button" onClick={() => handleDeleteClick(schedule)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? 'Edit Schedule' : 'Add Schedule'}</h2>

            {validationError && (
              <div style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '8px 12px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ffeeba'
              }}>
                {validationError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="supplier-input-container" style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Supplier Name"
                  value={formData.supplierName}
                  onChange={handleSupplierNameChange}
                  onFocus={() => {
                    if (formData.supplierName.length > 0) {
                      const filtered = suppliers.filter(supplier =>
                        supplier.name && supplier.name.toLowerCase().includes(formData.supplierName.toLowerCase())
                      );
                      setFilteredSuppliers(filtered);
                      if (filtered.length > 0) setShowSupplierDropdown(true);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSupplierDropdown(false), 150)}
                  required
                  autoComplete="off"
                />

                {showSupplierDropdown && filteredSuppliers.length > 0 && (
                  <div className="supplier-dropdown" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderTop: 'none',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {filteredSuppliers.map(supplier => (
                      <div
                        key={supplier._id}
                        className="supplier-option"
                        onClick={() => handleSupplierSelect(supplier)}
                        style={{
                          padding: '10px 15px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        <div style={{ fontWeight: 'bold' }}>{supplier.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {supplier.email} | {supplier.phonenumber}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="date"
                placeholder="Schedule Date"
                value={formData.date}
                onChange={handleDateChange}
                required
              />

              <input
                type="time"
                placeholder="Meeting Time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />

              <textarea
                placeholder="Reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                rows="3"
              />

              <div className="modal-buttons">
                <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
                <button type="button" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content delete-confirm">
            <h2>Delete Schedule</h2>
            <p>Are you sure you want to delete this schedule for {scheduleToDelete?.supplierName}?</p>
            <div className="modal-buttons">
              <button onClick={handleDeleteConfirm} className="delete-button">Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePresence;
