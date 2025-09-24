import React, { useState, useEffect } from 'react';
import './SharedStyles.css';

const API_URL = "http://localhost:5000/api/leoni-personnel";

const LeoniPersonnel = () => {
  // Component manages its own personnel state
  const [personnel, setPersonnel] = useState([]);
  const [formData, setFormData] = useState({
    matricule: '',
    name: '',
    cin: '',
    email: '',
    address: '',
    state: '',
    postal_code: '',
    vehiclePlate: '',
    vehicleMark: '',
    vehicleModel: '',
    vehicleYear: new Date().getFullYear(),
    vehicleColor: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);
  const [nameError, setNameError] = useState(false);
  const [cinError, setCinError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
const userRole = localStorage.getItem("userRole") || 'unknown';
const isAdmin = userRole === 'admin';
const isSOS = userRole === 'sos';
  // =========================
  // Load personnel from backend - ONLY ONCE on mount
  // =========================
  useEffect(() => {
    let isMounted = true;
    
    const fetchPersonnel = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          return;
        }

        const response = await fetch(API_URL, {
          headers: {
            Authorization: "Bearer " + token
          }
        });
        
        if (!isMounted) return; // Component unmounted, don't update state
        
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched personnel:", data); // Debug log
          setPersonnel(Array.isArray(data) ? data : []);
        } else if (response.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else {
          setError(`Failed to load personnel data (Status: ${response.status})`);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching personnel:", err);
        setError("Server connection error. Please check if the server is running.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPersonnel();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency - runs only once

  // =========================
  // Submit form (add/update)
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (nameError || cinError) {
      alert('Please fix the validation errors before submitting.');
      return;
    }

    if (!formData.matricule || !formData.name || !formData.cin || !formData.email || !formData.address || !formData.state || !formData.postal_code) {
      alert('Please fill in all required fields.');
      return;
    }

    const payload = {
      matricule: formData.matricule.trim(),
      name: formData.name.trim(),
      cin: formData.cin.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      state: formData.state.trim(),
      postal_code: formData.postal_code.trim()
    };

    if (formData.vehiclePlate.trim()) {
      payload.vehicle = {
        lic_plate_string: formData.vehiclePlate.trim(),
        mark: formData.vehicleMark.trim() || "Unknown",
        model: formData.vehicleModel.trim() || "Unknown",
        v_year: formData.vehicleYear || new Date().getFullYear(),
        color: formData.vehicleColor.trim() || "Unknown"
      };
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        isEditing ? `${API_URL}/${editId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (isEditing) {
          setPersonnel(prev => prev.map(p => (p._id === editId ? data : p)));
          alert("Personnel updated successfully!");
        } else {
          setPersonnel(prev => [...prev, data]);
          alert("Personnel added successfully!");
        }
        resetForm();
      } else {
        alert(data.msg || `Error ${isEditing ? 'updating' : 'adding'} personnel`);
      }
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} personnel:`, err);
      alert("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Edit
  // =========================
  const handleEdit = (person) => {
    setIsEditing(true);
    setEditId(person._id);
    setFormData({
      matricule: person.matricule || "",
      name: person.name || "",
      cin: person.cin || "",
      email: person.email || "",
      address: person.address || "",
      state: person.state || "",
      postal_code: person.postal_code || "",
      vehiclePlate: person.vehicles?.[0]?.lic_plate_string || "",
      vehicleMark: person.vehicles?.[0]?.mark || "",
      vehicleModel: person.vehicles?.[0]?.model || "",
      vehicleYear: person.vehicles?.[0]?.v_year || new Date().getFullYear(),
      vehicleColor: person.vehicles?.[0]?.color || ""
    });
    setShowForm(true);
  };

  // =========================
  // Delete
  // =========================
  const handleDeleteClick = (person) => {
    setPersonToDelete(person);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/${personToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token
        }
      });
      
      if (response.ok) {
        setPersonnel(prev => prev.filter(p => p._id !== personToDelete._id));
        alert("Personnel deleted successfully");
      } else {
        const errorData = await response.json();
        alert(errorData.msg || "Error deleting personnel");
      }
    } catch (err) {
      console.error("Error deleting personnel:", err);
      alert("Server connection error");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setPersonToDelete(null);
    }
  };

  // =========================
  // Helpers
  // =========================
  const resetForm = () => {
    setFormData({
      matricule: '',
      name: '',
      cin: '',
      email: '',
      address: '',
      state: '',
      postal_code: '',
      vehiclePlate: '',
      vehicleMark: '',
      vehicleModel: '',
      vehicleYear: new Date().getFullYear(),
      vehicleColor: ''
    });
    setShowForm(false);
    setIsEditing(false);
    setEditId(null);
    setNameError(false);
    setCinError(false);
  };

  const validateName = (name) => {
    return name === '' || /^[A-Za-z\s]+$/.test(name);
  };

  const validateCin = (cin) => {
    return cin === '' || /^[0-9]{8}$/.test(cin);
  };

  // =========================
  // Filter search
  // =========================
  const filteredPersonnel = personnel.filter(person =>
    (person.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.matricule || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.cin || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.address || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.state || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.postal_code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // =========================
  // Refresh data
  // =========================
  const handleRefresh = () => {
    window.location.reload(); // Simple refresh for now
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="container">
      <div className="header">
        <h1>Leoni Personnel Management</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Show user role badge */}
     
          <button 
            className="add-button" 
            onClick={() => setShowForm(true)}
            disabled={loading}
          >
            + Add Personnel
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          ⚠️ {error}
          <button 
            onClick={handleRefresh}
            style={{ 
              marginLeft: '10px', 
              background: '#dc3545', 
              color: 'white', 
              border: 'none', 
              padding: '5px 10px', 
              borderRadius: '3px' 
            }}
          >
            Retry
          </button>
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, matricule"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          background: '#f8f9fa', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          Loading...
        </div>
      )}

      <div className="list">
        <table>
          <thead>
            <tr>
              <th>NAME</th>
              <th>MATRICULE</th>
              <th>CIN</th>
              <th>EMAIL</th>
              <th>ADDRESS</th>
              <th>STATE</th>
              <th>POSTAL CODE</th>
              <th>VEHICLE PLATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredPersonnel.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                  {error ? 'Unable to load data' : 'No personnel found'}
                </td>
              </tr>
            ) : (
              filteredPersonnel.map(person => (
                <tr key={person._id}>
                  <td>{person.name}</td>
                  <td>{person.matricule}</td>
                  <td>{person.cin}</td>
                  <td>{person.email}</td>
                  <td>{person.address}</td>
                  <td>{person.state}</td>
                  <td>{person.postal_code}</td>
                  <td>{person.vehicles?.[0]?.lic_plate_string || "-"}</td>
                  <td>
                    <button 
                      className="edit-button" 
                      onClick={() => handleEdit(person)}
                      disabled={loading}
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-button" 
                      onClick={() => handleDeleteClick(person)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <span 
              className="close" 
              onClick={resetForm}
              style={{ 
                float: 'right', 
                fontSize: '28px', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                color: '#aaa'
              }}
            >
              &times;
            </span>
            <h2>{isEditing ? 'Edit Personnel' : 'Add Personnel'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ color: '#495057', marginBottom: '10px' }}>Personnel Information</h3>
                
                <input
                  type="text"
                  placeholder="Name *"
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, name: value });
                    setNameError(!validateName(value));
                  }}
                  required
                  style={{ marginBottom: '5px' }}
                />
                {nameError && <p style={{ color: 'red', fontSize: '12px', margin: '0 0 10px 0' }}>Name must contain only letters and spaces</p>}
                
                <input 
                  type="text" 
                  placeholder="Matricule *" 
                  value={formData.matricule} 
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })} 
                  required 
                />
                
                <input
                  type="text"
                  placeholder="CIN (8 digits) *"
                  value={formData.cin}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, cin: value });
                    setCinError(!validateCin(value));
                  }}
                  required
                  maxLength="8"
                  style={{ marginBottom: '5px' }}
                />
                {cinError && <p style={{ color: 'red', fontSize: '12px', margin: '0 0 10px 0' }}>CIN must be exactly 8 digits</p>}
                
                <input 
                  type="email" 
                  placeholder="Email *" 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  required 
                />
                
                <input 
                  type="text" 
                  placeholder="Address *" 
                  value={formData.address} 
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                  required 
                />
                
                <input 
                  type="text" 
                  placeholder="State *" 
                  value={formData.state} 
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })} 
                  required 
                />
                
                <input 
                  type="text" 
                  placeholder="Postal Code *" 
                  value={formData.postal_code} 
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} 
                  required 
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ color: '#495057', marginBottom: '10px' }}>Vehicle Information (Optional)</h3>
                
                <input 
                  type="text" 
                  placeholder="Vehicle License Plate" 
                  value={formData.vehiclePlate} 
                  onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })} 
                />
                
                <input 
                  type="text" 
                  placeholder="Vehicle Make" 
                  value={formData.vehicleMark} 
                  onChange={(e) => setFormData({ ...formData, vehicleMark: e.target.value })} 
                />
                
                <input 
                  type="text" 
                  placeholder="Vehicle Model" 
                  value={formData.vehicleModel} 
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })} 
                />
                
                <input 
                  type="number" 
                  placeholder="Vehicle Year" 
                  value={formData.vehicleYear} 
                  onChange={(e) => setFormData({ ...formData, vehicleYear: parseInt(e.target.value) || new Date().getFullYear() })}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
                
                <input 
                  type="text" 
                  placeholder="Vehicle Color" 
                  value={formData.vehicleColor} 
                  onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })} 
                />
              </div>

              <div className="modal-buttons">
                <button type="submit" disabled={loading || nameError || cinError}>
                  {loading ? 'Processing...' : (isEditing ? 'Update' : 'Add')}
                </button>
                <button type="button" onClick={resetForm} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content delete-confirm">
            <h2>Delete Personnel</h2>
            <p>Are you sure you want to delete <strong>{personToDelete?.name}</strong>?</p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              This will also delete their associated vehicle(s).
            </p>
            <div className="modal-buttons">
              <button 
                onClick={handleDeleteConfirm} 
                className="delete-button"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPersonToDelete(null);
                }} 
                className="cancel-button"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeoniPersonnel;