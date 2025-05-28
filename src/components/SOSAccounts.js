import React, { useState } from 'react';
import './SharedStyles.css';

const SOSAccounts = ({ accounts, setAccounts }) => {
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    birthdate: '',
   
    address: '',
    phone_num: '',
    email: '',
    password: '',

  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [fnameError, setFnameError] = useState(false);
  const [lnameError, setLnameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fnameError || lnameError || phoneError) {
      alert('Please fix the errors before submitting.');
      return;
    }
    if (isEditing) {
      setAccounts(accounts.map(account => 
        account.id === editId ? { ...formData, id: editId } : account
      ));
      setIsEditing(false);
      setEditId(null);
    } else {
      setAccounts([...accounts, { ...formData, id: Date.now() }]);
      alert('Account added successfully!');
    }
    setFormData({
      fname: '',
      lname: '',
      birthdate: '',
      
      address: '',
      phone_num: '',
      email: '',
      password: '',
      
    });
    setShowForm(false);
  };

  const handleEdit = (account) => {
    setIsEditing(true);
    setEditId(account.id);
    setFormData(account);
    setShowForm(true);
  };

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setAccounts(accounts.filter(account => account.id !== accountToDelete.id));
    setShowDeleteConfirm(false);
    setAccountToDelete(null);
  };

  const filteredAccounts = accounts.filter(account => 
    `${account.fname} ${account.lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNameValidation = (name) => /^[A-Za-z]+$/.test(name);

  return (
    <div className="container">
      <div className="header">
        <h1>SOS Accounts Management</h1>
        <button className="add-button" style={{ marginRight: '165px' }} onClick={() => setShowForm(true)}>
          + Add Account
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
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
              <th>EMAIL</th>
              <th>BIRTHDATE</th>
              <th>PHONE NUMBER</th>
              <th>ADDRESS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
  {filteredAccounts.map(account => (
    <tr key={account.id}>
      <td>{`${account.fname} ${account.lname}`}</td>
      <td>{account.email}</td>
      <td>{account.birthdate}</td>
      <td>{account.phone_num}</td>
      <td>{account.address}</td>
      <td>
                  <button className="edit-button" onClick={() => handleEdit(account)}>
                    Edit
                  </button>
                  <button className="delete-button" onClick={() => handleDeleteClick(account)}>
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
            <h2>{isEditing ? 'Edit Account' : 'Add Account'}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="First Name"
                value={formData.fname}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, fname: value });
                  setFnameError(value !== '' && !handleNameValidation(value));
                }}
                required
              />
              {fnameError && <p style={{ color: 'red' }}>Name must contain only letters</p>}
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lname}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, lname: value });
                  setLnameError(value !== '' && !handleNameValidation(value));
                }}
                required
              />
              {lnameError && <p style={{ color: 'red' }}>Name must contain only letters</p>}
              <input
                type="date"
                placeholder="Birth Date"
                value={formData.birthdate}
                onChange={(e) => setFormData({...formData, birthdate: e.target.value})}
                required
              />
            
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={formData.phone_num}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, phone_num: value });
                  setPhoneError(value !== '' && (!/^[0-9]{8}$/.test(value)));
                }}
                required
              />
              {phoneError && <p style={{ color: 'red' }}>Phone number must contain exactly 8 numbers</p>}
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
             
            
              <div className="modal-buttons">
                <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setIsEditing(false);
                  setFormData({
                    fname: '',
                    lname: '',
                    birthdate: '',
                   
                    address: '',
                    phone_num: '',
                    email: '',
                    password: '',
                    
                    
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
            <h2>Delete Account</h2>
            <p>Are you sure you want to delete {accountToDelete?.fname} {accountToDelete?.lname}'s </p>
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

export default SOSAccounts;