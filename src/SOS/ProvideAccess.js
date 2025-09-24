import React, { useState, useEffect, useCallback } from 'react';
import { supplierAPI, scheduleAPI, logAPI, accessAPI, personnelAPI } from './utils/api';
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
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  // Helper function to determine person status from logs
  const getPersonStatus = (personId, personType, activeLogs, allLogs) => {
    // Ensure activeLogs and allLogs are arrays
    const safeActiveLogs = Array.isArray(activeLogs) ? activeLogs : [];
    const safeAllLogs = Array.isArray(allLogs) ? allLogs : [];
    
    // Find active log for this person
    const activeLog = safeActiveLogs.find(log => 
      log.person && log.person._id === personId && 
      log.personType === personType
    );
    
    // Find latest log (including exits) for this person
    const latestLog = safeAllLogs.find(log => 
      log.person && log.person._id === personId && 
      log.personType === personType
    );
    
    // Determine current status and times
    let status = '';
    let entryTime = '';
    let exitTime = '';
    let canCheckIn = true;
    let canCheckOut = false;
    let isCurrentlyInside = false;
    
    if (activeLog) {
      // Person is currently inside
      status = 'Entry';
      entryTime = activeLog.entryTime ? new Date(activeLog.entryTime).toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5) : '';
      exitTime = '';
      canCheckIn = false;
      canCheckOut = true;
      isCurrentlyInside = true;
    } else if (latestLog && latestLog.status === 'exit') {
      // Person's last action was checkout
      status = 'Exit';
      entryTime = latestLog.entryTime ? new Date(latestLog.entryTime).toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5) : '';
      exitTime = latestLog.exitTime ? new Date(latestLog.exitTime).toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5) : '';
      canCheckIn = true;
      canCheckOut = false;
      isCurrentlyInside = false;
    }
    
    return {
      status,
      entryTime,
      exitTime,
      canCheckIn,
      canCheckOut,
      isCurrentlyInside
    };
  };

  // Load access data from backend
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Loading access data...');
      
      // Get access data with improved error handling
      const accessData = await accessAPI.getAllAccessData();
      console.log('Access data received:', accessData);
      
      // Destructure with fallbacks
      const {
        suppliers = [],
        personnel = [],
        schedules = [],
        activeLogs = []
      } = accessData || {};
      
      // Also get recent logs to show exit status
      let recentLogs = [];
      try {
        const recentLogsResponse = await logAPI.getAll({ limit: 200, sortBy: 'logDate', sortOrder: 'desc' });
        recentLogs = recentLogsResponse.data || [];
      } catch (logError) {
        console.warn('Failed to fetch recent logs:', logError.message);
        recentLogs = [];
      }
      
      // Transform suppliers data for access list
      const transformedSuppliers = Array.isArray(suppliers) ? suppliers.map((supplier) => {
        if (!supplier || !supplier._id) {
          console.warn('Invalid supplier data:', supplier);
          return null;
        }

        try {
          // Find schedule presence for this supplier
          const schedulePresence = Array.isArray(schedules) ? schedules.find(schedule => 
            schedule && schedule.supplierName && supplier.name &&
            schedule.supplierName.toLowerCase().trim() === supplier.name.toLowerCase().trim() &&
            (schedule.status === 'scheduled' || schedule.status === 'rescheduled')
          ) : null;
          
          // Get vehicle info
          const vehicle = supplier.vehicles && Array.isArray(supplier.vehicles) && supplier.vehicles.length > 0 
            ? supplier.vehicles[0] 
            : null;
          
          // Get status information
          const statusInfo = getPersonStatus(supplier._id, 'Supplier', activeLogs, recentLogs);
          
          return {
            id: supplier._id,
            name: supplier.name || 'Unknown Supplier',
            type: 'Supplier',
            plate: vehicle ? (vehicle.lic_plate_string || 'N/A') : 'N/A',
            cinMatricule: supplier.cin || 'N/A',
            ...statusInfo,
            scheduleDate: schedulePresence 
              ? new Date(schedulePresence.date).toISOString().split('T')[0]
              : '',
            scheduledTime: schedulePresence ? (schedulePresence.time || '') : '',
            reason: schedulePresence ? (schedulePresence.reason || '') : '',
            supplierId: supplier._id,
            supplierEmail: supplier.email || '',
            supplierPhone: supplier.phonenumber || '',
            vehicleId: vehicle ? vehicle._id : null,
            personType: 'Supplier'
          };
        } catch (supplierError) {
          console.error('Error processing supplier:', supplier, supplierError);
          return null;
        }
      }).filter(Boolean) : []; // Filter out null values

      // Transform LeoniPersonnel data for access list
      const transformedPersonnel = Array.isArray(personnel) ? personnel.map((person) => {
        if (!person || !person._id) {
          console.warn('Invalid personnel data:', person);
          return null;
        }

        try {
          // Get vehicle info
          const vehicle = person.vehicles && Array.isArray(person.vehicles) && person.vehicles.length > 0 
            ? person.vehicles[0] 
            : null;
          
          // Get status information
          const statusInfo = getPersonStatus(person._id, 'LeoniPersonnel', activeLogs, recentLogs);
          
          return {
            id: person._id,
            name: person.name || 'Unknown Personnel',
            type: 'LeoniPersonnel',
            plate: vehicle ? (vehicle.lic_plate_string || 'N/A') : 'N/A',
            cinMatricule: person.cin || 'N/A',
            matricule: person.matricule || 'N/A',
            ...statusInfo,
            scheduleDate: '', // Personnel don't have schedules typically
            scheduledTime: '',
            reason: '',
            personnelId: person._id,
            personnelEmail: person.email || '',
            vehicleId: vehicle ? vehicle._id : null,
            personType: 'LeoniPersonnel'
          };
        } catch (personnelError) {
          console.error('Error processing personnel:', person, personnelError);
          return null;
        }
      }).filter(Boolean) : []; // Filter out null values
      
      const finalAccessList = [...transformedSuppliers, ...transformedPersonnel];
      console.log('Final access list:', finalAccessList.length, 'items');
      setAccessList(finalAccessList);
      
      // Load statistics
      try {
        const statsData = await logAPI.getStats();
        setStats(statsData.data || null);
      } catch (statsError) {
        console.warn('Failed to fetch stats:', statsError.message);
        setStats(null);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message || 'Unknown error occurred');
      
      // Fallback to example data
      const fallbackData = [
        { 
          id: 'fallback_1',
          name: 'Ahmed Ben Ali', 
          type: 'LeoniPersonnel', 
          plate: 'TN-1234-AB', 
          cinMatricule: '12345678',
          matricule: 'LEO001',
          status: '', 
          entryTime: '', 
          exitTime: '', 
          scheduleDate: '',
          scheduledTime: '',
          reason: '',
          canCheckIn: true,
          canCheckOut: false,
          isCurrentlyInside: false,
          personType: 'LeoniPersonnel'
        },
        { 
          id: 'fallback_2',
          name: 'Fatma Trabelsi', 
          type: 'Supplier', 
          plate: 'TN-5678-CD', 
          cinMatricule: '87654321', 
          status: '', 
          entryTime: '', 
          exitTime: '', 
          scheduleDate: '2024-12-20',
          scheduledTime: '09:00',
          reason: 'Monthly delivery',
          canCheckIn: true,
          canCheckOut: false,
          isCurrentlyInside: false,
          personType: 'Supplier'
        }
      ];
      setAccessList(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPerson) {
      alert('No person selected');
      return;
    }
    
    try {
      setLoading(true);
      
      // Better time handling to avoid timezone issues
      const currentDate = formData.date || new Date().toISOString().split('T')[0];
      
      if (formMode === 'checkIn') {
        const timeString = formData.entryTime || new Date().toTimeString().slice(0, 5);
        // Fix: Use local time instead of UTC
        const [hours, minutes] = timeString.split(':');
        const entryDateTime = new Date(currentDate);
        entryDateTime.setHours(parseInt(hours, 10));
        entryDateTime.setMinutes(parseInt(minutes, 10));
        entryDateTime.setSeconds(0);
        entryDateTime.setMilliseconds(0);

        const checkInData = {
          personId: selectedPerson.id,
          personType: selectedPerson.personType,
          vehicleId: selectedPerson.vehicleId,
          entryTime: entryDateTime.toISOString(),
          notes: `Check-in via access control system`,
          parkingLocation: ''
        };

        console.log('Check-in data:', checkInData);
        await logAPI.checkIn(checkInData);

        alert(`${selectedPerson.name} has checked in successfully at ${timeString}.`);

      } else if (formMode === 'checkOut') {
        const timeString = formData.exitTime || new Date().toTimeString().slice(0, 5);
        // Fix: Use local time instead of UTC
        const [hours, minutes] = timeString.split(':');
        const exitDateTime = new Date(currentDate);
        exitDateTime.setHours(parseInt(hours, 10));
        exitDateTime.setMinutes(parseInt(minutes, 10));
        exitDateTime.setSeconds(0);
        exitDateTime.setMilliseconds(0);

        // Additional validation: ensure exit time is not before entry time
        if (selectedPerson.entryTime) {
          const entryTime = new Date(selectedPerson.entryTime);
          if (exitDateTime < entryTime) {
            alert('Exit time cannot be before entry time. Please check your time entry.');
            return;
          }
        }

        const checkOutData = {
          personId: selectedPerson.id,
          personType: selectedPerson.personType,
          exitTime: exitDateTime.toISOString(),
          notes: `Check-out via access control system`
        };

        console.log('Check-out data:', checkOutData);
        await logAPI.checkOut(checkOutData);

        alert(`${selectedPerson.name} has checked out successfully at ${timeString}.`);
      }
      
      // Reload data to reflect changes
      await loadData();
      
    } catch (error) {
      console.error('Error during check-in/out:', error);
      
      // More specific error handling
      if (error.message.includes('Validation error')) {
        alert(`Validation Error: ${error.message}. Please check your time entries.`);
      } else if (error.message.includes('already checked in')) {
        alert('This person is already checked in. Please check out first.');
      } else if (error.message.includes('No active check-in')) {
        alert('No active check-in found. Please check in first.');
      } else {
        alert(`Error: ${error.message || 'Unknown error occurred'}`);
      }
    } finally {
      setLoading(false);
      // Reset form
      setFormData({ date: '', entryTime: '', exitTime: '' });
      setShowForm(false);
      setSelectedIdx(null);
      setSelectedPerson(null);
    }
  };
  const handleCheckIn = (idx) => {
    const person = filteredLogs[idx];
    if (!person) {
      alert('Person not found');
      return;
    }
    
    const originalIdx = accessList.findIndex(item => item.id === person.id);
    
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);
    
    setFormMode('checkIn');
    setShowForm(true);
    setSelectedIdx(originalIdx);
    setSelectedPerson(person);
    setFormData({
      date: currentDate,
      entryTime: currentTime,
      exitTime: ''
    });
  };

  const handleCheckOut = (idx) => {
    const person = filteredLogs[idx];
    if (!person) {
      alert('Person not found');
      return;
    }
    
    const originalIdx = accessList.findIndex(item => item.id === person.id);
    
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);
    
    setFormMode('checkOut');
    setShowForm(true);
    setSelectedIdx(originalIdx);
    setSelectedPerson(person);
    setFormData({
      date: currentDate,
      entryTime: '',
      exitTime: currentTime
    });
  };

  // Filtering logic
  useEffect(() => {
    const filtered = Array.isArray(accessList) ? accessList.filter(log => {
      if (!log) return false;
      
      const matchesSearch = ownerSearch === '' || 
        (log.name && log.name.toLowerCase().includes(ownerSearch.toLowerCase())) ||
        (log.cinMatricule && log.cinMatricule.includes(ownerSearch)) ||
        (log.matricule && log.matricule.includes(ownerSearch)) ||
        (log.plate && log.plate.toLowerCase().includes(ownerSearch.toLowerCase()));
      
      const matchesType = ownerType === '' || log.type === ownerType;
      
      return matchesSearch && matchesType;
    }) : [];
    
    setFilteredLogs(filtered);
  }, [accessList, ownerSearch, ownerType]);

  if (loading) {
    return (
      <div className="supplier-container">
        <div className="header">
          <h1>Provide Access</h1>
        </div>
        <div className="loading-state">
          <p>Loading access control data...</p>
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

      {/* Statistics Panel */}
      {stats && (
        <div style={{ 
          backgroundColor: '#e7f3ff', 
          padding: '15px', 
          marginBottom: '20px', 
          borderRadius: '4px',
          border: '1px solid #b3d9ff'
        }}>
          <h3>Today's Statistics</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <strong>Currently Inside:</strong> {stats.today?.currentlyInside || 0}
            </div>
            <div>
              <strong>Total Entries:</strong> {stats.today?.totalEntries || 0}
            </div>
            <div>
              <strong>Total Exits:</strong> {stats.today?.totalExits || 0}
            </div>
            <div>
              <strong>Suppliers:</strong> {stats.today?.supplierEntries || 0}
            </div>
            <div>
              <strong>Workers:</strong> {stats.today?.personnelEntries || 0}
            </div>
            <div>
              <strong>Leoni Personnel:</strong> {stats.today?.leoniPersonnelEntries || 0}
            </div>
            <div>
              <strong>Vehicles Parked:</strong> {stats.vehicles?.currentlyParked || 0}
            </div>
          </div>
        </div>
      )}

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
            {/* Worker info removed as requested */}
            
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
                <button type="submit" disabled={loading}>
                  {loading ? 'Processing...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ date: '', entryTime: '', exitTime: '' });
                    setSelectedIdx(null);
                    setSelectedPerson(null);
                  }}
                  disabled={loading}
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
            placeholder="Name, CIN, Matricule, or Vehicle plate" 
          />
        </div>
        <div className="filter-group">
          <label>Owner Type: </label>
          <select value={ownerType} onChange={(e) => setOwnerType(e.target.value)}>
            <option value="">All</option>
            <option value="Supplier">Supplier</option>
            <option value="LeoniPersonnel">Leoni Personnel</option>
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
              <th>MATRICULE</th>
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
                return (
                  <tr key={`${row.id}-${idx}`}>
                    <td>{row.name || 'N/A'}</td>
                    <td>
                      <span className={
                        row.type === 'Supplier' ? 'type-supplier' : 
                        row.type === 'LeoniPersonnel' ? 'type-personnel' : 'type-worker'
                      }>
                        {row.type === 'LeoniPersonnel' ? 'Leoni Personnel' : row.type}
                      </span>
                    </td>
                    <td>{row.plate || 'N/A'}</td>
                    <td>{row.cinMatricule || 'N/A'}</td>
                    <td>{row.matricule || '-'}</td>
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
                        onClick={() => handleCheckIn(idx)}
                        disabled={!row.canCheckIn || loading}
                        title={!row.canCheckIn ? 'Already checked in' : 'Check in'}
                      >
                        Check In
                      </button>
                      <button 
                        className="check-out-button" 
                        onClick={() => handleCheckOut(idx)}
                        disabled={!row.canCheckOut || loading}
                        title={!row.canCheckOut ? 'Must check in first' : 'Check out'}
                      >
                        Check Out
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
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