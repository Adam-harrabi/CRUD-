import React, { useState, useEffect } from 'react';
import '../components/SharedStyles.css';

const Incidents = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ type: '', description: '', date: '' });
  const [incidents, setIncidents] = useState(() => {
    const storedIncidents = localStorage.getItem('incidents');
    return storedIncidents ? JSON.parse(storedIncidents) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('incidents', JSON.stringify(incidents));
  }, [incidents]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setIncidents([...incidents, { ...formData }]);
    setFormData({ type: '', description: '', date: '' });
    setSuccessMessage('Incident reported successfully!');
    setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
  };

  const filteredIncidents = incidents.filter(
    (incident) =>
      incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="incident-form-container">
      <h1 className="incident-header" style={{ color: '#007BFF' }}>📋 Report Incident/Bug</h1>
      {successMessage && <div className="success-message">{successMessage}</div>}
      <form onSubmit={handleSubmit} className="incident-form">
        <select
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Type</option>
          <option value="Real Parking">Real Parking</option>
          <option value="Application">Application</option>
        </select>
        <textarea
          placeholder="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
        ></textarea>
        <input
          type="date"
          placeholder="Date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
        />
        <button type="submit" className="add-button">Add</button>
      </form>
    </div>
  );
};

export default Incidents;