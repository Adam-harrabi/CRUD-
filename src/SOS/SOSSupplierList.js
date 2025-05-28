import React, { useState } from 'react';
import '../components/SupplierList.css';

const SOSSupplierList = ({ suppliers, setSuppliers }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_num: '',
    companyInfo: '',
    cin: '',
    vehiclePlate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [cinError, setCinError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nameError || cinError || phoneError) {
      alert('Please fix the errors before submitting.');
      return;
    } else {
      setSuppliers([...suppliers, { ...formData, id: Date.now() }]);
      alert('Supplier added successfully!');
    }
    setSuppliers([...suppliers, { ...formData, id: Date.now() }]);
    setFormData({ name: '', phone_num: '', companyInfo: '', cin: '', email: '', vehiclePlate: '' });
    setShowForm(false);
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
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map(supplier => (
              <tr key={supplier.id}>
                <td>{supplier.name}</td>
                <td>{supplier.cin}</td>
                <td>{supplier.email}</td>
                <td>{supplier.phone_num}</td>
                <td>{supplier.companyInfo}</td>
                <td>{supplier.vehiclePlate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add Supplier</h2>
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
                placeholder="phone number"
                value={formData.phone_num}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) { // Allow only numeric input
                    setFormData({ ...formData, phone_num: value });
                    setPhoneError(value !== '' && (!/^[0-9]{8}$/.test(value)));
                  }
                }}
                required
              />
              {phoneError && <p style={{ color: 'red' }}>Phone number must contain exactly 8 numbers</p>}
              <input
                type="text"
                placeholder="Vehicle Plate"
                value={formData.vehiclePlate || ''}
                onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                required
              />
              <textarea
                placeholder="Company Info"
                value={formData.companyInfo}
                onChange={(e) => setFormData({ ...formData, companyInfo: e.target.value })}
                required
              />
              <div className="modal-buttons">
                <button type="submit">Add</button>
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setFormData({ name: '', phone_num: '', companyInfo: '', cin: '', email: '', vehiclePlate: '' });
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOSSupplierList;