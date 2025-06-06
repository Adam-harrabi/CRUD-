import React, { useState } from 'react';
import './SupplierList.css';

const SupplierList = ({ suppliers, setSuppliers }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phonenumber: '',
    companyInfo: '',
    cin: '',
    vehiclePlate: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [nameError, setNameError] = useState(false);
  const [cinError, setCinError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nameError || cinError || phoneError) {
      alert('Please fix the errors before submitting.');
      return;
    }
    if (isEditing) {
      setSuppliers(suppliers.map(supplier => 
        supplier.id === editId ? { ...formData, id: editId } : supplier
      ));
      setIsEditing(false);
      setEditId(null);
    } else {
      setSuppliers([...suppliers, { ...formData, id: Date.now() }]);
      alert('Supplier added successfully!');
    }
    setFormData({ name: '', email: '', phonenumber: '', companyInfo: '', cin: '', vehiclePlate: '' });
    setShowForm(false);
  };

  const handleEdit = (supplier) => {
    setIsEditing(true);
    setEditId(supplier.id);
    setFormData(supplier);
    setShowForm(true);
  };

  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setSuppliers(suppliers.filter(supplier => supplier.id !== supplierToDelete.id));
    setShowDeleteConfirm(false);
    setSupplierToDelete(null);
  };

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.cin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="supplier-container">
      <div className="header">
        <h1>Supplier Management</h1>
        <button className="add-button" onClick={() => setShowForm(true)}>
          + Add Supplier
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

      <div className="supplier-list">
        <table>
          <thead>
            <tr>
              <th>SUPPLIER</th>
              <th>CIN</th>
              <th>EMAIL</th>
              <th>PHONE NUMBER</th>
              <th>COMPANY</th>
              <th>VEHICLE PLATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map(supplier => (
              <tr key={supplier.id}>
                <td>{supplier.name}</td>
                <td>{supplier.cin}</td>
                <td>{supplier.email}</td>
                <td>{supplier.phonenumber}</td>
                <td>{supplier.companyInfo}</td>
                <td>{supplier.vehiclePlate}</td>
                <td>
                  <button className="edit-button" onClick={() => handleEdit(supplier)}>
                    Edit
                  </button>
                  <button className="delete-button" onClick={() => handleDeleteClick(supplier)}>
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
            <h2>{isEditing ? 'Edit Supplier' : 'Add Supplier'}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Supplier Name"
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, name: value });
                  setNameError(value !== '' && !/^[A-Za-z]+$/.test(value));
                }}
                required
              />
              {nameError && <p style={{ color: 'red' }}>Name must contain only letters</p>}
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
                type="email"
                placeholder="Supplier EMAIL"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={formData.phonenumber}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, phonenumber: value });
                  setPhoneError(value !== '' && (!/^[0-9]{8}$/.test(value)));
                }}
                required
              />
              {phoneError && <p style={{ color: 'red' }}>Phone number must contain exactly 8 numbers</p>}
              <textarea
                placeholder="Company Info"
                value={formData.companyInfo}
                onChange={(e) => setFormData({...formData, companyInfo: e.target.value})}
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
                  setFormData({ name: '', contact: '', companyInfo: '', cin: '',email: '' });
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
            <h2>Delete Supplier</h2>
            <p>Are you sure you want to delete {supplierToDelete?.name}? </p>
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

export default SupplierList;