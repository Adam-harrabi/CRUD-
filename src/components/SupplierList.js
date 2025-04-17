import React, { useState } from 'react';
import './SupplierList.css';

const SupplierList = ({ suppliers, setSuppliers }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    companyInfo: '',
    cin: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setSuppliers(suppliers.map(supplier => 
        supplier.id === editId ? { ...formData, id: editId } : supplier
      ));
      setIsEditing(false);
      setEditId(null);
    } else {
      setSuppliers([...suppliers, { ...formData, id: Date.now() }]);
    }
    setFormData({ name: '', contact: '', companyInfo: '', cin: '' });
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
              <th>CONTACT</th>
              <th>COMPANY</th>
              <th>CIN</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map(supplier => (
              <tr key={supplier.id}>
                <td>{supplier.name}</td>
                <td>{supplier.contact}</td>
                <td>{supplier.companyInfo}</td>
                <td>{supplier.cin}</td>
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
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="CIN"
                value={formData.cin}
                onChange={(e) => setFormData({...formData, cin: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Contact"
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                required
              />
              <textarea
                placeholder="Company Info"
                value={formData.companyInfo}
                onChange={(e) => setFormData({...formData, companyInfo: e.target.value})}
                required
              />
              <div className="modal-buttons">
                <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setIsEditing(false);
                  setFormData({ name: '', contact: '', companyInfo: '', cin: '' });
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
            <p>Are you sure you want to delete {supplierToDelete?.name}? This action cannot be undone.</p>
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