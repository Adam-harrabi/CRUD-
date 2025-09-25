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
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

  // Auto clear messages
  useEffect(() => {
    if (formMessage.text) {
      const timer = setTimeout(() => setFormMessage({ type: '', text: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

  // Helper function to determine person status from logs
  const getPersonStatus = (personId, personType, activeLogs, allLogs) => {
    const safeActiveLogs = Array.isArray(activeLogs) ? activeLogs : [];
    const safeAllLogs = Array.isArray(allLogs) ? allLogs : [];
    
    const activeLog = safeActiveLogs.find(log => 
      log.person && log.person._id === personId && 
      log.personType === personType
    );
    
    const latestLog = safeAllLogs.find(log => 
      log.person && log.person._id === personId && 
      log.personType === personType
    );
    
    let status = '';
    let entryTime = '';
    let exitTime = '';
    let canCheckIn = true;
    let canCheckOut = false;
    let isCurrentlyInside = false;
    
    if (activeLog) {
      status = 'Entry';
      entryTime = activeLog.entryTime ? new Date(activeLog.entryTime).toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5) : '';
      exitTime = '';
      canCheckIn = false;
      canCheckOut = true;
      isCurrentlyInside = true;
    } else if (latestLog && latestLog.status === 'exit') {
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
      const accessData = await accessAPI.getAllAccessData();
      const {
        suppliers = [],
        personnel = [],
        schedules = [],
        activeLogs = []
      } = accessData || {};
      
      let recentLogs = [];
      try {
        const recentLogsResponse = await logAPI.getAll({ limit: 200, sortBy: 'logDate', sortOrder: 'desc' });
        recentLogs = recentLogsResponse.data || [];
      } catch {
        recentLogs = [];
      }
      
      const transformedSuppliers = Array.isArray(suppliers) ? suppliers.map((supplier) => {
        if (!supplier || !supplier._id) return null;

        try {
          const schedulePresence = Array.isArray(schedules) ? schedules.find(schedule => 
            schedule && schedule.supplierName && supplier.name &&
            schedule.supplierName.toLowerCase().trim() === supplier.name.toLowerCase().trim() &&
            (schedule.status === 'scheduled' || schedule.status === 'rescheduled')
          ) : null;
          
          const vehicle = supplier.vehicles && Array.isArray(supplier.vehicles) && supplier.vehicles.length > 0 
            ? supplier.vehicles[0] 
            : null;
          
          const statusInfo = getPersonStatus(supplier._id, 'Supplier', activeLogs, recentLogs);
          
          return {
            id: supplier._id,
            name: supplier.name || 'Unknown Supplier',
            type: 'Supplier',
            plate: vehicle ? (vehicle.lic_plate_string || 'N/A') : 'N/A',
            cinMatricule: supplier.cin || 'N/A',
            ...statusInfo,
            scheduleDate: schedulePresence ? new Date(schedulePresence.date).toISOString().split('T')[0] : '',
            scheduledTime: schedulePresence ? (schedulePresence.time || '') : '',
            reason: schedulePresence ? (schedulePresence.reason || '') : '',
            supplierId: supplier._id,
            supplierEmail: supplier.email || '',
            supplierPhone: supplier.phonenumber || '',
            vehicleId: vehicle ? vehicle._id : null,
            personType: 'Supplier'
          };
        } catch {
          return null;
        }
      }).filter(Boolean) : [];

      const transformedPersonnel = Array.isArray(personnel) ? personnel.map((person) => {
        if (!person || !person._id) return null;

        try {
          const vehicle = person.vehicles && Array.isArray(person.vehicles) && person.vehicles.length > 0 
            ? person.vehicles[0] 
            : null;
          
          const statusInfo = getPersonStatus(person._id, 'LeoniPersonnel', activeLogs, recentLogs);
          
          return {
            id: person._id,
            name: person.name || 'Unknown Personnel',
            type: 'LeoniPersonnel',
            plate: vehicle ? (vehicle.lic_plate_string || 'N/A') : 'N/A',
            cinMatricule: person.cin || 'N/A',
            matricule: person.matricule || 'N/A',
            ...statusInfo,
            scheduleDate: '',
            scheduledTime: '',
            reason: '',
            personnelId: person._id,
            personnelEmail: person.email || '',
            vehicleId: vehicle ? vehicle._id : null,
            personType: 'LeoniPersonnel'
          };
        } catch {
          return null;
        }
      }).filter(Boolean) : [];
      
      const finalAccessList = [...transformedSuppliers, ...transformedPersonnel];
      setAccessList(finalAccessList);
      
    } catch (error) {
      setError(error.message || 'Unknown error occurred');
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

  useEffect(() => {
    loadData();
  }, [loadData]);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedPerson) {
    setFormMessage({ type: 'error', text: 'No person selected' });
    return;
  }

  try {
    setLoading(true);
    const selectedDate = formData.date || new Date().toISOString().split('T')[0];

    if (formMode === 'checkIn') {
      const timeString = formData.entryTime || new Date().toTimeString().slice(0, 5);
      const [hours, minutes] = timeString.split(':');
      const entryDateTime = new Date(selectedDate);
      entryDateTime.setHours(parseInt(hours, 10));
      entryDateTime.setMinutes(parseInt(minutes, 10));

      // Find the most recent log for this person to get the actual last exit date/time
      try {
        const recentLogsResponse = await logAPI.getAll({ 
          limit: 10, 
          sortBy: 'logDate', 
          sortOrder: 'desc'
        });
        
        const recentLogs = recentLogsResponse.data || [];
        
        // Find the most recent log for this specific person
        const personLogs = recentLogs.filter(log => 
          log.person && log.person._id === selectedPerson.id && 
          log.personType === selectedPerson.personType
        );
        
        const lastLog = personLogs[0]; // Most recent log for this person
        
        if (lastLog && lastLog.exitTime && lastLog.status === 'exit') {
          // Use the actual exit date/time from the log
          const lastExitDateTime = new Date(lastLog.exitTime);
          
          if (entryDateTime <= lastExitDateTime) {
            const lastExitDateStr = lastExitDateTime.toLocaleDateString();
            const lastExitTimeStr = lastExitDateTime.toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5);
            setFormMessage({ 
              type: 'error', 
              text: `Invalid check-in: must be after last exit (${lastExitDateStr} at ${lastExitTimeStr}).` 
            });
            setLoading(false);
            return;
          }
        }
        
        // Also check if person is currently inside (has an active entry without exit)
        const activeLog = recentLogs.find(log => 
          log.person && log.person._id === selectedPerson.id && 
          log.personType === selectedPerson.personType &&
          log.status === 'entry' &&
          !log.exitTime
        );
        
        if (activeLog) {
          setFormMessage({ 
            type: 'error', 
            text: `${selectedPerson.name} is already checked in. Please check out first.` 
          });
          setLoading(false);
          return;
        }
        
      } catch (error) {
        console.warn('Could not fetch recent logs for validation:', error);
        // Continue with check-in if we can't validate (fallback behavior)
      }

      const checkInData = {
        personId: selectedPerson.id,
        personType: selectedPerson.personType,
        vehicleId: selectedPerson.vehicleId,
        entryTime: entryDateTime.toISOString(),
      };

      await logAPI.checkIn(checkInData);
      setFormMessage({ type: 'success', text: `${selectedPerson.name} has checked in successfully at ${timeString}.` });

    } else if (formMode === 'checkOut') {
      const timeString = formData.exitTime || new Date().toTimeString().slice(0, 5);
      const [hours, minutes] = timeString.split(':');
      const exitDateTime = new Date(selectedDate);
      exitDateTime.setHours(parseInt(hours, 10));
      exitDateTime.setMinutes(parseInt(minutes, 10));

      // Find the current active entry for this person
      try {
        const recentLogsResponse = await logAPI.getAll({ 
          limit: 10, 
          sortBy: 'logDate', 
          sortOrder: 'desc'
        });
        
        const recentLogs = recentLogsResponse.data || [];
        
        const activeLog = recentLogs.find(log => 
          log.person && log.person._id === selectedPerson.id && 
          log.personType === selectedPerson.personType &&
          log.status === 'entry' &&
          !log.exitTime
        );
        
        if (activeLog && activeLog.entryTime) {
          const activeEntryDateTime = new Date(activeLog.entryTime);
          if (exitDateTime <= activeEntryDateTime) {
            const entryDateStr = activeEntryDateTime.toLocaleDateString();
            const entryTimeStr = activeEntryDateTime.toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5);
            setFormMessage({ 
              type: 'error', 
              text: `Exit time must be after entry time (${entryDateStr} at ${entryTimeStr}).` 
            });
            setLoading(false);
            return;
          }
        }
        
      } catch (error) {
        console.warn('Could not fetch recent logs for validation:', error);
        // Continue with fallback validation
        if (selectedPerson.entryTime) {
          const entryTime = new Date(`${selectedDate}T${selectedPerson.entryTime}:00`);
          if (exitDateTime <= entryTime) {
            setFormMessage({ type: 'error', text: 'Exit time must be after entry time.' });
            setLoading(false);
            return;
          }
        }
      }

      const checkOutData = {
        personId: selectedPerson.id,
        personType: selectedPerson.personType,
        exitTime: exitDateTime.toISOString(),
      };

      await logAPI.checkOut(checkOutData);
      setFormMessage({ type: 'success', text: `${selectedPerson.name} has checked out successfully at ${timeString}.` });
    }

    await loadData();
  } catch (error) {
    setFormMessage({ type: 'error', text: `Error: ${error.message || 'Unknown error occurred'}` });
  } finally {
    setLoading(false);
    setFormData({ date: '', entryTime: '', exitTime: '' });
    setSelectedIdx(null);
    setSelectedPerson(null);
  }
};

  const handleCheckIn = (idx) => {
    const person = filteredLogs[idx];
    if (!person) {
      setFormMessage({ type: 'error', text: 'Person not found' });
      return;
    }
    
    const originalIdx = accessList.findIndex(item => item.id === person.id);
    
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);
    
    setFormMode('checkIn');
    setShowForm(true);
    setSelectedIdx(originalIdx);
    setSelectedPerson(person);
    setFormData({ date: currentDate, entryTime: currentTime, exitTime: '' });
    setFormMessage({ type: '', text: '' });
  };

  const handleCheckOut = (idx) => {
    const person = filteredLogs[idx];
    if (!person) {
      setFormMessage({ type: 'error', text: 'Person not found' });
      return;
    }
    
    const originalIdx = accessList.findIndex(item => item.id === person.id);
    
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);
    
    setFormMode('checkOut');
    setShowForm(true);
    setSelectedIdx(originalIdx);
    setSelectedPerson(person);
    setFormData({ date: currentDate, entryTime: '', exitTime: currentTime });
    setFormMessage({ type: '', text: '' });
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

  if (loading && !showForm) {
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

            {formMessage.text && (
              <div
                className={`form-message ${formMessage.type}`}
                style={{
                  marginBottom: '15px',
                  padding: '10px',
                  borderRadius: '4px',
                  color: formMessage.type === 'error' ? '#721c24' : '#155724',
                  backgroundColor: formMessage.type === 'error' ? '#f8d7da' : '#d4edda',
                  border: formMessage.type === 'error' ? '1px solid #f5c6cb' : '1px solid #c3e6cb'
                }}
              >
                {formMessage.text}
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
                    setFormMessage({ type: '', text: '' });
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
              <th>SCHEDULE DATE</th>
              <th>SCHEDULED TIME</th>
              <th>REASON</th>
              <th>STATUS</th>
              <th>ENTRY TIME</th>
              <th>EXIT TIME</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center' }}>No results found</td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <tr key={log.id}>
                  <td>{log.name}</td>
                  <td>{log.type}</td>
                  <td>{log.plate}</td>
                  <td>{log.cinMatricule}</td>
                  <td>{log.matricule || '-'}</td>
                  <td>{log.scheduleDate}</td>
                  <td>{log.scheduledTime}</td>
                  <td>{log.reason}</td>
                  <td>{log.status}</td>
                  <td>{log.entryTime}</td>
                  <td>{log.exitTime}</td>
                  <td>
                   <button 
  className="check-in-button"
  onClick={() => handleCheckIn(idx)}
  disabled={!log.canCheckIn}
>
  Check In
</button>
<button 
  className="check-out-button"
  onClick={() => handleCheckOut(idx)}
  disabled={!log.canCheckOut}
>
  Check Out
</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProvideAccess;
