import React, { useState, useEffect } from "react";
import "./SupplierList.css";

const API_URL = "http://localhost:5000/api/suppliers";

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    // Frontend required fields
    name: "",
    email: "",
    phonenumber: "",
    cin: "",
    companyInfo: "",
    // Vehicle fields
    vehicle: {
      lic_plate_string: "",
      mark: "",
      model: "",
      v_year: new Date().getFullYear(),
      color: ""
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Validation states
  const [emailError, setEmailError] = useState("");
  const [cinError, setCinError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [yearError, setYearError] = useState("");

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCin = (cin) => {
    return /^[0-9]{8}$/.test(cin);
  };

  const validatePhone = (phone) => {
    return /^[0-9]{8}$/.test(phone);
  };

  const validateYear = (year) => {
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear + 1;
  };

  // =========================
  // Load suppliers from backend
  // =========================
  useEffect(() => {
    let isMounted = true;

    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          return;
        }

        const res = await fetch(API_URL, {
          headers: { Authorization: "Bearer " + token }
        });

        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          setSuppliers(Array.isArray(data.suppliers) ? data.suppliers : Array.isArray(data) ? data : []);
        } else if (res.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else {
          setError(`Failed to load suppliers (Status: ${res.status})`);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching suppliers:", err);
        setError("Server connection error.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSuppliers();

    return () => {
      isMounted = false;
    };
  }, []);

  // =========================
  // Add / Update supplier
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const errors = {};
    
    // Required field validation
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!validateEmail(formData.email)) errors.email = "Invalid email format";
    
    if (!formData.phonenumber.trim()) errors.phonenumber = "Phone number is required";
    else if (!validatePhone(formData.phonenumber)) errors.phonenumber = "Phone must be 8 digits";
    
    if (!formData.cin.trim()) errors.cin = "CIN is required";
    else if (!validateCin(formData.cin)) errors.cin = "CIN must be 8 digits";
    
    if (!formData.companyInfo.trim()) errors.companyInfo = "Company info is required";

    // Vehicle validation (if license plate is provided, other fields are required)
    if (formData.vehicle.lic_plate_string.trim()) {
      if (!formData.vehicle.mark.trim()) errors.vehicleMark = "Vehicle mark is required when license plate is provided";
      if (!formData.vehicle.model.trim()) errors.vehicleModel = "Vehicle model is required when license plate is provided";
      if (!formData.vehicle.color.trim()) errors.vehicleColor = "Vehicle color is required when license plate is provided";
      if (!validateYear(formData.vehicle.v_year)) errors.vehicleYear = "Invalid vehicle year";
    }

    if (Object.keys(errors).length > 0) {
      alert("Please fix the following errors:\n" + Object.values(errors).join("\n"));
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Prepare data for backend
      const submitData = {
        // Required fields
        name: formData.name.trim(),
        email: formData.email.trim(),
        phonenumber: formData.phonenumber.trim(),
        companyInfo: formData.companyInfo.trim(),
        cin: formData.cin.trim()
      };

      // Add vehicle data if license plate is provided
      if (formData.vehicle.lic_plate_string.trim()) {
        submitData.vehicle = {
          lic_plate_string: formData.vehicle.lic_plate_string.trim().toUpperCase(),
          mark: formData.vehicle.mark.trim(),
          model: formData.vehicle.model.trim(),
          v_year: parseInt(formData.vehicle.v_year),
          color: formData.vehicle.color.trim()
        };
      }

      console.log("Submitting data:", submitData);

      const res = await fetch(
        isEditing ? `${API_URL}/${editId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify(submitData)
        }
      );

      const data = await res.json();

      if (res.ok) {
        if (isEditing) {
          setSuppliers((prev) =>
            prev.map((s) => (s._id === editId ? data : s))
          );
          alert("Supplier updated successfully!");
        } else {
          setSuppliers((prev) => [...prev, data]);
          alert("Supplier added successfully!");
        }
        resetForm();
      } else {
        alert(data.msg || "Error saving supplier");
      }
    } catch (err) {
      console.error("Error saving supplier:", err);
      alert("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Edit
  // =========================
  const handleEdit = (supplier) => {
    setIsEditing(true);
    setEditId(supplier._id);
    
    // Get vehicle data if exists
    const vehicle = supplier.vehicles && supplier.vehicles[0];
    
    setFormData({
      // All required fields
      name: supplier.name || "",
      email: supplier.email || "",
      phonenumber: supplier.phonenumber || "",
      cin: supplier.cin || "",
      companyInfo: supplier.companyInfo || "",
      // Vehicle data
      vehicle: {
        lic_plate_string: vehicle?.lic_plate_string || "",
        mark: vehicle?.mark || "",
        model: vehicle?.model || "",
        v_year: vehicle?.v_year || new Date().getFullYear(),
        color: vehicle?.color || ""
      }
    });
    setShowForm(true);
  };

  // =========================
  // Delete
  // =========================
  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/${supplierToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });

      if (res.ok) {
        setSuppliers((prev) =>
          prev.filter((s) => s._id !== supplierToDelete._id)
        );
        alert("Supplier deleted successfully!");
      } else {
        const errData = await res.json();
        alert(errData.msg || "Error deleting supplier");
      }
    } catch (err) {
      console.error("Error deleting supplier:", err);
      alert("Server connection error.");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setSupplierToDelete(null);
    }
  };

  // =========================
  // Helpers
  // =========================
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phonenumber: "",
      cin: "",
      companyInfo: "",
      vehicle: {
        lic_plate_string: "",
        mark: "",
        model: "",
        v_year: new Date().getFullYear(),
        color: ""
      }
    });
    setShowForm(false);
    setIsEditing(false);
    setEditId(null);
    // Reset validation errors
    setEmailError("");
    setCinError("");
    setPhoneError("");
    setYearError("");
  };

  // =========================
  // Filter search
  // =========================
  const filteredSuppliers = suppliers.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.cin || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.id_sup || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.companyInfo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.num_vst || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="supplier-container">
      <div className="header">
        <h1>Supplier Management</h1>
        <button className="add-button" onClick={() => setShowForm(true)}>
          + Add Supplier
        </button>
      </div>

      {error && (
        <div className="error-box">
          ⚠️ {error}
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, CIN, supplier ID, company info, email, or VST number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading && <div className="loading-box">Loading...</div>}

      <div className="supplier-list">
        <table>
          <thead>
            <tr>
              <th>SUPPLIER NAME</th>
              <th>EMAIL</th>
              <th>PHONE</th>
              <th>CIN</th>
              <th>SUPPLIER ID</th>
              <th>COMPANY INFO</th>
              <th>VST NUMBER</th>
              <th>VEHICLE INFO</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  {error ? "Unable to load data" : "No suppliers found"}
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((s) => (
                <tr key={s._id}>
                  <td>{s.name || "N/A"}</td>
                  <td>{s.email || "N/A"}</td>
                  <td>{s.phonenumber || "N/A"}</td>
                  <td>{s.cin || "N/A"}</td>
                  <td>{s.id_sup || "N/A"}</td>
                  <td>{s.companyInfo || "N/A"}</td>
                  <td>{s.num_vst || "N/A"}</td>
                  <td>
                    {s.vehicles && s.vehicles.length > 0 ? (
                      <div style={{fontSize: '12px'}}>
                        <strong>{s.vehicles[0].lic_plate_string}</strong><br/>
                        {s.vehicles[0].mark} {s.vehicles[0].model}<br/>
                        {s.vehicles[0].v_year} - {s.vehicles[0].color}
                      </div>
                    ) : (
                      "No vehicle"
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleEdit(s)}>Edit</button>
                    <button onClick={() => handleDeleteClick(s)}>Delete</button>
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
          <div className="modal-content" style={{maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto'}}>
            <h2>{isEditing ? "Edit Supplier" : "Add Supplier"}</h2>
            <form onSubmit={handleSubmit}>
              
              {/* Required Supplier Information */}
              <div style={{marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '15px'}}>
                <h3 style={{margin: '0 0 15px 0', color: '#666'}}>Supplier Information (All Required)</h3>
                
                <input
                  type="text"
                  placeholder="Supplier Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <input
                  type="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, email: val });
                    if (val && !validateEmail(val)) {
                      setEmailError("Invalid email format");
                    } else {
                      setEmailError("");
                    }
                  }}
                  required
                />
                {emailError && <p className="error-text" style={{color: 'red', fontSize: '12px', margin: '5px 0'}}>{emailError}</p>}

                <input
                  type="text"
                  placeholder="Phone Number (8 digits) *"
                  value={formData.phonenumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, phonenumber: val });
                    if (val && !validatePhone(val)) {
                      setPhoneError("Phone must be exactly 8 digits");
                    } else {
                      setPhoneError("");
                    }
                  }}
                  required
                />
                {phoneError && <p className="error-text" style={{color: 'red', fontSize: '12px', margin: '5px 0'}}>{phoneError}</p>}

                <input
                  type="text"
                  placeholder="CIN (8 digits) *"
                  value={formData.cin}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, cin: val });
                    if (val && !validateCin(val)) {
                      setCinError("CIN must be exactly 8 digits");
                    } else {
                      setCinError("");
                    }
                  }}
                  required
                />
                {cinError && <p className="error-text" style={{color: 'red', fontSize: '12px', margin: '5px 0'}}>{cinError}</p>}

                <textarea
                  placeholder="Company Information *"
                  value={formData.companyInfo}
                  onChange={(e) => setFormData({ ...formData, companyInfo: e.target.value })}
                  required
                  rows="3"
                  style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                />
              </div>

              {/* Vehicle Information */}
              <div style={{marginBottom: '20px'}}>
                <h3 style={{margin: '0 0 15px 0', color: '#666'}}>Vehicle Information (Optional)</h3>
                
                <input
                  type="text"
                  placeholder="License Plate"
                  value={formData.vehicle.lic_plate_string}
                  onChange={(e) => setFormData({
                    ...formData, 
                    vehicle: {...formData.vehicle, lic_plate_string: e.target.value.toUpperCase()}
                  })}
                />

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '10px 0'}}>
                  <input
                    type="text"
                    placeholder="Vehicle Mark"
                    value={formData.vehicle.mark}
                    onChange={(e) => setFormData({
                      ...formData, 
                      vehicle: {...formData.vehicle, mark: e.target.value}
                    })}
                  />
                  
                  <input
                    type="text"
                    placeholder="Vehicle Model"
                    value={formData.vehicle.model}
                    onChange={(e) => setFormData({
                      ...formData, 
                      vehicle: {...formData.vehicle, model: e.target.value}
                    })}
                  />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                  <input
                    type="number"
                    placeholder="Year"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.vehicle.v_year}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setFormData({
                        ...formData, 
                        vehicle: {...formData.vehicle, v_year: val}
                      });
                      if (val && !validateYear(val)) {
                        setYearError(`Year must be between 1900 and ${new Date().getFullYear() + 1}`);
                      } else {
                        setYearError("");
                      }
                    }}
                  />
                  
                  <input
                    type="text"
                    placeholder="Color"
                    value={formData.vehicle.color}
                    onChange={(e) => setFormData({
                      ...formData, 
                      vehicle: {...formData.vehicle, color: e.target.value}
                    })}
                  />
                </div>
                {yearError && <p className="error-text" style={{color: 'red', fontSize: '12px', margin: '5px 0'}}>{yearError}</p>}
              </div>

              <div className="modal-buttons">
                <button 
                  type="submit" 
                  disabled={loading || emailError || cinError || phoneError || yearError}
                >
                  {loading ? "Processing..." : isEditing ? "Update" : "Add"}
                </button>
                <button type="button" onClick={resetForm} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content delete-confirm">
            <h2>Delete Supplier</h2>
            <p>
              Are you sure you want to delete supplier <strong>{supplierToDelete?.name || supplierToDelete?.id_sup}</strong>?
            </p>
            <p style={{color: '#666', fontSize: '14px'}}>This will also delete any associated vehicles.</p>
            <div className="modal-buttons">
              <button onClick={handleDeleteConfirm} className="delete-button" disabled={loading}>
                {loading ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
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

export default SupplierList;