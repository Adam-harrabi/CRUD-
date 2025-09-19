import React, { useState, useEffect } from 'react';
import '../components/SharedStyles.css';
import './ProvideAccess.css';

const ProvideAccess = () => {
  // Filter states
  const [ownerSearch, setOwnerSearch] = useState('');
  const [ownerType, setOwnerType] = useState('');
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('');
  const [formData, setFormData] = useState({
    date: '',
    entryTime: '',
    exitTime: ''
  });
  const [accessList, setAccessList] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState([]);

  // API base URL - try different possible URLs
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Add debug message
  const addDebugInfo = (message) => {
    console.log('[DEBUG]', message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    addDebugInfo(`Auth token ${token ? 'found' : 'not found'} in localStorage`);
    return token;
  };

  // Test API connectivity
  const testApiConnection = async () => {
    try {
      addDebugInfo(`Testing API connection to: ${API_BASE_URL}`);
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        addDebugInfo(`API root endpoint working: ${JSON.stringify(data)}`);
        return true;
      } else {
        addDebugInfo(`API root endpoint failed with status: ${response.status}`);
        return false;
      }
    } catch (error) {
      addDebugInfo(`API connection test failed: ${error.message}`);
      return false;
    }
  };

  // Fetch suppliers from backend
  const fetchSuppliers = async () => {
    try {
      const token = getAuthToken();
      addDebugInfo(`Fetching suppliers from: ${API_BASE_URL}/suppliers`);
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'GET',
        headers: headers
      });

      addDebugInfo(`Suppliers API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        addDebugInfo(`Suppliers API error response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      addDebugInfo(`Suppliers data received: ${JSON.stringify(data, null, 2)}`);
      return data.suppliers || data || [];
    } catch (error) {
      addDebugInfo(`Error fetching suppliers: ${error.message}`);
      throw error;
    }
  };

  // Fetch schedule presences from backend
  const fetchSchedulePresences = async () => {
    try {
      const token = getAuthToken();
      addDebugInfo(`Fetching schedule presences from: ${API_BASE_URL}/schedule-presence`);
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/schedule-presence`, {
        method: 'GET',
        headers: headers
      });

      addDebugInfo(`Schedule presences API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        addDebugInfo(`Schedule presences API error response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      addDebugInfo(`Schedule presences data received: ${JSON.stringify(data, null, 2)}`);
      return data.data || data || [];
    } catch (error) {
      addDebugInfo(`Error fetching schedule presences: ${error.message}`);
      throw error;
    }
  };

  // Load data from backend
  const loadData = async () => {
    setLoading(true);
    setError('');
    setDebugInfo([]);
    addDebugInfo('Starting data load process');
    
    try {
      // First test API connectivity
      const apiWorking = await testApiConnection();
      if (!apiWorking) {
        addDebugInfo('API connectivity test failed, using fallback data');
        throw new Error('API server is not responding');
      }

      addDebugInfo('API connectivity confirmed, fetching data...');
      
      const [suppliersData, scheduleData] = await Promise.all([
        fetchSuppliers().catch(err => {
          addDebugInfo(`Suppliers fetch failed: ${err.message}`);
          return [];
        }),
        fetchSchedulePresences().catch(err => {
          addDebugInfo(`Schedule presences fetch failed: ${err.message}`);
          return [];
        })
      ]);
      
      addDebugInfo(`Data fetched - Suppliers: ${suppliersData.length}, Schedules: ${scheduleData.length}`);
      
      // Transform suppliers data for access list
      const transformedAccessList = suppliersData.map(supplier => {
        // Find schedule presence for this supplier
        const schedulePresence = scheduleData.find(schedule => 
          schedule.supplierName?.toLowerCase().trim() === supplier.name?.toLowerCase().trim() &&
          (schedule.status === 'scheduled' || schedule.status === 'rescheduled')
        );
        
        // Get vehicle info
        const vehicle = supplier.vehicles && supplier.vehicles.length > 0 
          ? supplier.vehicles[0] 
          : null;
        
        return {
          name: supplier.name || 'Unknown Supplier',
          type: 'Supplier',
          plate: vehicle ? vehicle.lic_plate_string : 'N/A',
          cinMatricule: supplier.cin || 'N/A',
          status: '',
          entryTime: '',
          exitTime: '',
          scheduleDate: schedulePresence 
            ? new Date(schedulePresence.date).toISOString().split('T')[0]
            : '',
          scheduledTime: schedulePresence ? schedulePresence.time : '',
          reason: schedulePresence ? schedulePresence.reason : '',
          supplierId: supplier._id,
          supplierEmail: supplier.email,
          supplierPhone: supplier.phonenumber
        };
      });
      
      // Add example personnel
      const personnelData = [
        { 
          name: 'Ahmed Ben Ali', 
          type: 'Personnel', 
          plate: 'TN-1234-AB', 
          cinMatricule: '12345678', 
          status: '', 
          entryTime: '', 
          exitTime: '', 
          scheduleDate: '',
          scheduledTime: '',
          reason: ''
        },
        { 
          name: 'Mohamed Bouazizi', 
          type: 'Personnel', 
          plate: 'TN-9101-EF', 
          cinMatricule: '87654321', 
          status: '', 
          entryTime: '', 
          exitTime: '', 
          scheduleDate: '',
          scheduledTime: '',
          reason: ''
        }
      ];
      
      const finalAccessList = [...transformedAccessList, ...personnelData];
      setAccessList(finalAccessList);
      addDebugInfo(`Final access list created with ${finalAccessList.length} entries`);
      
    } catch (error) {
      addDebugInfo(`Data loading failed: ${error.message}`);
      setError(error.message);
      
      // Fallback to example data
      const fallbackData = [
        { 
          name: 'Ahmed Ben Ali', 
          type: 'Personnel', 
          plate: 'TN-1234-AB', 
          cinMatricule: '12345678', 
          status: '', 
          entryTime: '', 
          exitTime: '', 
          scheduleDate: '',
          scheduledTime: '',
          reason: ''
        },
        { 
          name: 'Fatma Trabelsi', 
          type: 'Supplier', 
          plate: 'TN-5678-CD', 
          cinMatricule: '87654321', 
          status: '', 
          entryTime: '', 
          exitTime: '', 
          scheduleDate: '2024-12-20',
          scheduledTime: '09:00',
          reason: 'Monthly delivery'
        },
        { 
          name: 'Mohamed Bouazizi', 
          type: 'Personnel', 
          plate: 'TN-9101-EF', 
          cinMatricule: '11223344', 
          status: '', 
          entryTime: '', 
          exitTime: '', 
          scheduleDate: '',
          scheduledTime: '',
          reason: ''
        },
        { 
          name: 'Hanen Jaziri', 
          type: 'Supplier', 
          plate: 'TN-1121-GH', 
          cinMatricule: '55667788', 
          status: '', 
          entryTime: '', 
          exitTime: '', 
          scheduleDate: '2024-12-21',
          scheduledTime: '14:30',
          reason: 'Equipment maintenance'
        }
      ];
      setAccessList(fallbackData);
      addDebugInfo(`Using fallback data with ${fallbackData.length} entries`);
    } finally {
      setLoading(false);
      addDebugInfo('Data loading process completed');
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const currentDateTime = new Date();
    const timeString = formMode === 'checkIn' 
      ? formData.entryTime || currentDateTime.toTimeString().slice(0, 5)
      : formData.exitTime || currentDateTime.toTimeString().slice(0, 5);
    
    const updatedAccessList = accessList.map((row, index) => {
      if (index === selectedIdx) {
        if (formMode === 'checkIn') {
          return { 
            ...row, 
            status: 'Entry', 
            entryTime: timeString,
            exitTime: row.exitTime || ''
          };
        } else if (formMode === 'checkOut') {
          return { 
            ...row, 
            status: 'Exit', 
            exitTime: timeString
          };
        }
      }
      return row;
    });
    
    setAccessList(updatedAccessList);

    const workerName = accessList[selectedIdx]?.name || 'Worker';
    if (formMode === 'checkIn') {
      alert(`${workerName} has checked in successfully at ${timeString}.`);
    } else if (formMode === 'checkOut') {
      alert(`${workerName} has checked out successfully at ${timeString}.`);
    }

    // Reset form
    setFormData({ date: '', entryTime: '', exitTime: '' });
    setShowForm(false);
    setSelectedIdx(null);
  };

  const handleCheckIn = (idx) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);
    
    setFormMode('checkIn');
    setShowForm(true);
    setSelectedIdx(idx);
    setFormData({
      date: currentDate,
      entryTime: currentTime,
      exitTime: ''
    });
  };

  const handleCheckOut = (idx) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);
    
    setFormMode('checkOut');
    setShowForm(true);
    setSelectedIdx(idx);
    setFormData({
      date: currentDate,
      entryTime: '',
      exitTime: currentTime
    });
  };

  // Filtering logic
  useEffect(() => {
    const filtered = accessList.filter(log => {
      const matchesSearch = ownerSearch === '' || 
        log.name?.toLowerCase().includes(ownerSearch.toLowerCase()) ||
        log.cinMatricule?.includes(ownerSearch) ||
        log.plate?.toLowerCase().includes(ownerSearch.toLowerCase());
      
      const matchesType = ownerType === '' || log.type === ownerType;
      
      return matchesSearch && matchesType;
    });
    
    setFilteredLogs(filtered);
  }, [accessList, ownerSearch, ownerType]);

  if (loading) {
    return (
      <div className="supplier-container">
        <div className="header">
          <h1>Provide Access</h1>
        </div>
        <div className="loading-state">
          <p>Loading suppliers and schedule data...</p>
          <p>API URL: {API_BASE_URL}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-container">
      <div className="header">
        <h1>Provide Access</h1>
        <button 
          onClick={loadData} 
          style={{ 
            marginLeft: '20px', 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Data
        </button>
      </div>

      {/* Debug Panel */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        marginBottom: '20px', 
        borderRadius: '4px',
        border: '1px solid #ddd'
      }}>
        <h3>Debug Information</h3>
        <p><strong>API URL:</strong> {API_BASE_URL}</p>
        <p><strong>Auth Token:</strong> {getAuthToken() ? 'Present' : 'Missing'}</p>
        <p><strong>Access List Length:</strong> {accessList.length}</p>
        <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '12px' }}>
          {debugInfo.map((info, idx) => (
            <div key={idx} style={{ marginBottom: '4px', padding: '2px' }}>
              {info}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>API Error:</strong> {error}. Using fallback data for demonstration.
        </div>
      )}

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{formMode === 'checkIn' ? 'Check In Form' : 'Check Out Form'}</h2>
            
            {selectedIdx !== null && (
              <div className="worker-info">
                <h3>Worker Information</h3>
                <p><strong>Name:</strong> {accessList[selectedIdx]?.name}</p>
                <p><strong>Type:</strong> {accessList[selectedIdx]?.type}</p>
                <p><strong>Vehicle:</strong> {accessList[selectedIdx]?.plate}</p>
                <p><strong>CIN:</strong> {accessList[selectedIdx]?.cinMatricule}</p>
                
                {accessList[selectedIdx]?.scheduleDate && (
                  <div className="schedule-info">
                    <p><strong>Scheduled Date:</strong> {accessList[selectedIdx]?.scheduleDate}</p>
                    {accessList[selectedIdx]?.scheduledTime && (
                      <p><strong>Scheduled Time:</strong> {accessList[selectedIdx]?.scheduledTime}</p>
                    )}
                    {accessList[selectedIdx]?.reason && (
                      <p><strong>Reason:</strong> {accessList[selectedIdx]?.reason}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="date">Date:</label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              {formMode === 'checkIn' && (
                <div className="form-group">
                  <label htmlFor="entryTime">Entry Time:</label>
                  <input
                    id="entryTime"
                    type="time"
                    value={formData.entryTime}
                    onChange={(e) => setFormData({ ...formData, entryTime: e.target.value })}
                    required
                  />
                </div>
              )}

              {formMode === 'checkOut' && (
                <div className="form-group">
                  <label htmlFor="exitTime">Exit Time:</label>
                  <input
                    id="exitTime"
                    type="time"
                    value={formData.exitTime}
                    onChange={(e) => setFormData({ ...formData, exitTime: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="modal-buttons">
                <button type="submit">Submit</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ date: '', entryTime: '', exitTime: '' });
                    setSelectedIdx(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter/Search Bar */}
      <div className="filter-section">
        <div className="filter-group">
          <label>Search by Owner: </label>
          <input 
            type="text" 
            value={ownerSearch} 
            onChange={(e) => setOwnerSearch(e.target.value)} 
            placeholder="Name, CIN, or Vehicle plate" 
          />
        </div>
        <div className="filter-group">
          <label>Owner Type: </label>
          <select value={ownerType} onChange={(e) => setOwnerType(e.target.value)}>
            <option value="">All</option>
            <option value="Supplier">Supplier</option>
            <option value="Personnel">Personnel</option>
          </select>
        </div>
      </div>

      <div className="supplier-list">
        <table>
          <thead>
            <tr>
              <th>WORKER</th>
              <th>TYPE</th>
              <th>VEHICLE MATRICULE</th>
              <th>CIN</th>
              <th>SCHEDULE PRESENCE DATE</th>
              <th>ENTRY TIME</th>
              <th>EXIT TIME</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((row, idx) => {
                const originalIdx = accessList.findIndex(item => 
                  item.name === row.name && item.cinMatricule === row.cinMatricule
                );
                
                return (
                  <tr key={`${row.name}-${row.cinMatricule}-${idx}`}>
                    <td>{row.name}</td>
                    <td>
                      <span className={row.type === 'Supplier' ? 'type-supplier' : 'type-personnel'}>
                        {row.type}
                      </span>
                    </td>
                    <td>{row.plate}</td>
                    <td>{row.cinMatricule}</td>
                    <td className={row.scheduleDate ? 'schedule-date-present' : 'schedule-date-empty'}>
                      {row.scheduleDate || '-'}
                      {row.scheduleDate && row.scheduledTime && (
                        <div className="scheduled-time">
                          at {row.scheduledTime}
                        </div>
                      )}
                    </td>
                    <td>{row.entryTime || '-'}</td>
                    <td>{row.exitTime || '-'}</td>
                    <td>
                      <span className={
                        row.status === 'Entry' ? 'status-entry' : 
                        row.status === 'Exit' ? 'status-exit' : 'status-none'
                      }>
                        {row.status || '-'}
                      </span>
                    </td>
                    <td className="actions-container">
                      <button 
                        className="check-in-button" 
                        onClick={() => handleCheckIn(originalIdx)}
                        disabled={row.status === 'Entry'}
                        title={row.status === 'Entry' ? 'Already checked in' : 'Check in'}
                      >
                        Check In
                      </button>
                      <button 
                        className="check-out-button" 
                        onClick={() => handleCheckOut(originalIdx)}
                        disabled={row.status !== 'Entry'}
                        title={row.status !== 'Entry' ? 'Must check in first' : 'Check out'}
                      >
                        Check Out
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No workers found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProvideAccess;