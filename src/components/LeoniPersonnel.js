import React, { useState } from 'react';
import './SharedStyles.css';

const LeoniPersonnel = ({ personnel, setPersonnel }) => {
  const [formData, setFormData] = useState({
    cin: '',
    worker_name: '',
    age: '',
    email: '',
    worker_address: '',
    state: '',
    postal_code: '',
    matricule: '',
    phone_num: '',
    vehiclePlate: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);
  const [workerNameError, setWorkerNameError] = useState(false);
  const [cinError, setCinError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (workerNameError || cinError ) {
      alert('Please fix the errors before submitting.');
      return; }

    setPersonnel([...personnel, { ...formData, id: Date.now() }]);
    setFormData({
      cin: '',
      worker_name: '',
      age: '',
      email: '',
      worker_address: '',
      state: '',
      postal_code: '',
      matricule: '',
      phone_num: '',
      vehiclePlate: ''
    });
    setShowForm(false);
    alert('Personnel added successfully!');
  };


  const handleEdit = (person) => {
    setIsEditing(true);
    setEditId(person.id);
    setFormData(person);
    setShowForm(true);
  };

  const handleDeleteClick = (person) => {
    setPersonToDelete(person);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setPersonnel(personnel.filter(person => person.id !== personToDelete.id));
    setShowDeleteConfirm(false);
    setPersonToDelete(null);
  };

  const filteredPersonnel = personnel.filter(person => 
    person.worker_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.cin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <h1>Leoni Personnel Management</h1>
        <button className="add-button" style={{ marginRight: '70px' }} onClick={() => setShowForm(true)}>
          + Add Personnel
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or CIN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="list">
        <table>
          <thead>
            <tr>
              <th>NAME</th>
              <th>CIN</th>
              <th>MATRICULE</th>
              <th>AGE</th>
              <th>STATE</th>
              <th>EMAIL</th>
              <th>ADDRESS</th>
              <th>POSTAL CODE</th>
              <th>VEHICLE PLATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredPersonnel.map(person => (
              <tr key={person.id}>
                <td>{person.worker_name}</td>
                <td>{person.cin}</td>
                <td>{person.matricule}</td>
                <td>{person.age}</td>
                <td>{person.state}</td>
                <td>{person.email}</td>
                <td>{person.worker_address}</td>
                <td>{person.postal_code}</td>
                <td>{person.vehiclePlate}</td>
                <td>
                  <button className="edit-button" onClick={() => handleEdit(person)}>
                    Edit
                  </button>
                  <button className="delete-button" onClick={() => handleDeleteClick(person)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? 'Edit Personnel' : 'Add Personnel'}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Worker Name"
                value={formData.worker_name}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, worker_name: value });
                  setWorkerNameError(value !== '' && !/^[A-Za-z]+$/.test(value));
                }}
                required
              />
              {workerNameError && <p style={{ color: 'red' }}>Name must contain only letters</p>}
              <input
                type="text"
                placeholder="CIN"
                value={formData.cin}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, cin: value });
                  setCinError(value !== '' && (!/^[0-9]{8}$/.test(value)));
                }}
                required
              />
              {cinError && <p style={{ color: 'red' }}>CIN must contain exactly 8 numbers</p>}
              <input
                type="text"
                placeholder="Matricule"
                value={formData.matricule}
                onChange={(e) => setFormData({...formData, matricule: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={formData.worker_address}
                onChange={(e) => setFormData({...formData, worker_address: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={formData.postal_code}
                onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone_num}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,8}$/.test(value)) {
                    setFormData({ ...formData, phone_num: value });
                  }
                }}
                minLength="8"
                required
              />
              <input
                type="text"
                placeholder="Vehicle Plate"
                value={formData.vehiclePlate || ''}
                onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                required
              />
              <div className="modal-buttons">
                <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setIsEditing(false);
                  setFormData({
                    cin: '',
                    worker_name: '',
                    age: '',
                    email: '',
                    worker_address: '',
                    state: '',
                    postal_code: '',
                    matricule: '',
                    phone_num: '',
                    vehiclePlate: ''
                  });
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content delete-confirm">
            <h2>Delete Personnel</h2>
            <p>Are you sure you want to delete {personToDelete?.worker_name}? </p>
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

export default LeoniPersonnel;