import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SharedStyles.css";

const SOSAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    birthdate: "",
    password: ""
  });
  const [createFormData, setCreateFormData] = useState({
    cin: "", // Added cin field
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    birthdate: "",
    password: "",
    confirmPassword: ""
  });

  // Fetch SOS accounts on load
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/admin/users?role=sos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAccounts(res.data.users);
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setError("Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Filter accounts
  const filteredAccounts = accounts.filter(
    (account) =>
      `${account.firstName} ${account.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete click
  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admin/delete-user/${accountToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAccounts(accounts.filter((acc) => acc._id !== accountToDelete._id));
      alert("Account deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.msg || "Failed to delete account");
    } finally {
      setShowDeleteConfirm(false);
      setAccountToDelete(null);
    }
  };

  // Handle edit click
  const handleEditClick = (account) => {
    setAccountToEdit(account);
    setEditFormData({
      firstName: account.firstName || "",
      lastName: account.lastName || "",
      email: account.email || "",
      phoneNumber: account.phoneNumber || "",
      birthdate: account.birthdate ? account.birthdate.substring(0, 10) : "",
      password: ""
    });
    setShowEditModal(true);
  };

  // Handle create account click
  const handleCreateClick = () => {
    setCreateFormData({
      cin: "", // Reset cin field
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      birthdate: "",
      password: "",
      confirmPassword: ""
    });
    setShowCreateModal(true);
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle create form input changes
  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const updateData = { ...editFormData };
      
      // Remove password if it's empty
      if (!updateData.password.trim()) {
        delete updateData.password;
      }

      const res = await axios.patch(
        `http://localhost:5000/api/admin/update-user/${accountToEdit._id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the accounts list with the updated user data
      setAccounts(accounts.map(acc => 
        acc._id === accountToEdit._id ? res.data.user : acc
      ));

      setShowEditModal(false);
      setAccountToEdit(null);
      setEditFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        birthdate: "",
        password: ""
      });

      alert("Account updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.msg || "Failed to update account");
    }
  };

  // Handle create form submission
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    // Validate CIN
    if (!createFormData.cin.trim()) {
      alert("CIN is required!");
      return;
    }
    
    // Validate password confirmation
    if (createFormData.password !== createFormData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (createFormData.password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const { confirmPassword, ...createData } = createFormData; // Remove confirmPassword from data sent to server
      
      const res = await axios.post(
        "http://localhost:5000/api/admin/create-user",
        createData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Add the new user to the accounts list
      setAccounts([res.data.user, ...accounts]);

      setShowCreateModal(false);
      setCreateFormData({
        cin: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        birthdate: "",
        password: "",
        confirmPassword: ""
      });

      alert("Account created successfully!");
    } catch (err) {
      console.error("Create error:", err);
      alert(err.response?.data?.msg || "Failed to create account");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>SOS Accounts Management</h1>
        <button 
          className="create-button"
          onClick={handleCreateClick}
          style={{ 
            backgroundColor: "#2834e7ff", 
            color: "white", 
            padding: "10px 20px", 
            border: "none", 
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "100px"
          }}
        >
          Create New Account
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

      {loading ? (
        <p>Loading accounts...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <div className="list">
          <table>
            <thead>
              <tr>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>BIRTHDATE</th>
                <th>PHONE NUMBER</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((account) => (
                  <tr key={account._id}>
                    <td>{`${account.firstName} ${account.lastName}`}</td>
                    <td>{account.email}</td>
                    <td>
                      {account.birthdate
                        ? account.birthdate.substring(0, 10)
                        : ""}
                    </td>
                    <td>{account.phoneNumber}</td>
                    <td>
                      <button
                        className="edit-button"
                        onClick={() => handleEditClick(account)}
                        style={{ marginRight: "10px" }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteClick(account)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No SOS accounts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal">
          <div className="modal-content create-modal">
            <h2>Create New Account</h2>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label>CIN: *</label>
                <input
                  type="text"
                  name="cin"
                  value={createFormData.cin}
                  onChange={handleCreateInputChange}
                  placeholder="Enter CIN (required)"
                  required
                />
              </div>

              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={createFormData.firstName}
                  onChange={handleCreateInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={createFormData.lastName}
                  onChange={handleCreateInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={createFormData.email}
                  onChange={handleCreateInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={createFormData.phoneNumber}
                  onChange={handleCreateInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Birth Date:</label>
                <input
                  type="date"
                  name="birthdate"
                  value={createFormData.birthdate}
                  onChange={handleCreateInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  value={createFormData.password}
                  onChange={handleCreateInputChange}
                  placeholder="Enter password (minimum 6 characters)"
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={createFormData.confirmPassword}
                  onChange={handleCreateInputChange}
                  placeholder="Confirm password"
                  required
                  minLength="6"
                />
              </div>
              
              <div className="modal-buttons">
                <button type="submit" className="save-button">
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content edit-modal">
            <h2>Edit Account</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={editFormData.firstName}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={editFormData.lastName}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={editFormData.phoneNumber}
                  onChange={handleEditInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Birth Date:</label>
                <input
                  type="date"
                  name="birthdate"
                  value={editFormData.birthdate}
                  onChange={handleEditInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>New Password (leave empty to keep current):</label>
                <input
                  type="password"
                  name="password"
                  value={editFormData.password}
                  onChange={handleEditInputChange}
                  placeholder="Enter new password or leave empty"
                />
              </div>
              
              <div className="modal-buttons">
                <button type="submit" className="save-button">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content delete-confirm">
            <h2>Delete Account</h2>
            <p>
              Are you sure you want to delete{" "}
              {accountToDelete?.firstName} {accountToDelete?.lastName}'s
              account?
            </p>
            <div className="modal-buttons">
              <button
                onClick={handleDeleteConfirm}
                className="delete-button"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="cancel-button"
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

export default SOSAccounts;