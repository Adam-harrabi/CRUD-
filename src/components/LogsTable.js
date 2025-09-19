import React, { useState, useEffect, useMemo } from 'react';
import { logAPI } from '../SOS/utils/api'; // Adjust path based on your project structure
import './LogsTable.css';

const LogsTable = () => {
  const [dateFilter, setDateFilter] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [ownerTypeFilter, setOwnerTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'individual'
  const [logs, setLogs] = useState([]);
  const [monthlyVisits, setMonthlyVisits] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 200, // Increased to get more data for grouping
    total: 0,
    pages: 0
  });

  // Helper functions - Updated getVehiclePlate function (fixed for new backend structure)
  const getVehiclePlate = (log) => {
    console.log('Getting vehicle plate for log:', log._id || log.id);
    console.log('Log structure:', {
      hasVehicleInfo: !!log.vehicleInfo,
      vehicleInfo: log.vehicleInfo
    });

    // 1. Check vehicleInfo from enhanced backend (primary source)
    if (log.vehicleInfo && log.vehicleInfo.lic_plate_string) {
      console.log('Found plate in vehicleInfo:', log.vehicleInfo.lic_plate_string);
      return log.vehicleInfo.lic_plate_string;
    }

    // 2. Check vehicleLog structure (if present - fallback)
    if (log.vehicleLog && log.vehicleLog.vehicle && log.vehicleLog.vehicle.lic_plate_string) {
      console.log('Found plate in vehicleLog:', log.vehicleLog.vehicle.lic_plate_string);
      return log.vehicleLog.vehicle.lic_plate_string;
    }

    // 3. Check direct vehicle reference in log (legacy support)
    if (log.vehicle && log.vehicle.lic_plate_string) {
      console.log('Found plate in direct vehicle reference:', log.vehicle.lic_plate_string);
      return log.vehicle.lic_plate_string;
    }

    // 4. Check if vehicle data is directly in the person object (legacy support)
    if (log.person && log.person.lic_plate_string) {
      console.log('Found plate in person object:', log.person.lic_plate_string);
      return log.person.lic_plate_string;
    }

    console.log('No vehicle plate found for log:', log._id || log.id);
    return 'N/A';
  };

  const calculateTotalDuration = (logs) => {
    let totalMinutes = 0;
    
    logs.forEach(logItem => {
      if (logItem.entryTime && logItem.exitTime) {
        const durationMs = new Date(logItem.exitTime) - new Date(logItem.entryTime);
        if (durationMs > 0) {
          totalMinutes += Math.floor(durationMs / (1000 * 60));
        }
      }
    });
    
    if (totalMinutes === 0) return '—';
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '—';
    
    try {
      return new Date(dateTimeString).toLocaleTimeString('en-GB', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '—';
    }
  };

  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return '—';
    
    try {
      return new Date(dateTimeString).toISOString().split('T')[0];
    } catch (error) {
      return '—';
    }
  };

  // Updated load data function
  const loadData = async (params = {}) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Loading logs with params:', params);
      
      // Load logs
      const logsResponse = await logAPI.getAll({
        limit: pagination.limit,
        page: pagination.page,
        sortBy: 'logDate',
        sortOrder: 'desc',
        ...params
      });

      console.log('Logs response:', logsResponse);

      if (logsResponse.success) {
        setLogs(logsResponse.data || []);
        setPagination(logsResponse.pagination || pagination);

        // Debug: Check first few logs
        if (logsResponse.data && logsResponse.data.length > 0) {
          console.log('First log sample:', JSON.stringify(logsResponse.data[0], null, 2));
          console.log('Vehicle info check:', {
            hasVehicleInfo: !!logsResponse.data[0].vehicleInfo,
            hasPersonVehicles: !!(logsResponse.data[0].person && logsResponse.data[0].person.vehicles),
            monthlyVisitCount: logsResponse.data[0].monthlyVisitCount
          });
        }

        // Load monthly visit data for suppliers using new API
        const currentMonth = new Date().toISOString().slice(0, 7);
        console.log('Loading monthly stats for month:', currentMonth);
        
        try {
          const monthlyStatsResponse = await logAPI.getMonthlyStats(currentMonth);
          console.log('Monthly stats response:', monthlyStatsResponse);
          
          const visitMap = {};
          if (monthlyStatsResponse.success && monthlyStatsResponse.data.supplierStats) {
            monthlyStatsResponse.data.supplierStats.forEach(stat => {
              if (stat.supplier && stat.supplier._id) {
                visitMap[stat.supplier._id] = stat.visitCount;
                console.log(`Supplier ${stat.supplier.name}: ${stat.visitCount} visits`);
              }
            });
          }
          
          console.log('Final visit map:', visitMap);
          setMonthlyVisits(visitMap);
          
        } catch (monthlyError) {
          console.error('Failed to load monthly visit data:', monthlyError);
          
          // Fallback: Try to use the enhanced logs data if available
          if (logsResponse.data && Array.isArray(logsResponse.data)) {
            const fallbackVisitMap = {};
            logsResponse.data.forEach(log => {
              if (log.monthlyVisitCount !== undefined && log.person && log.person._id) {
                fallbackVisitMap[log.person._id] = log.monthlyVisitCount;
              }
            });
            console.log('Using fallback visit map from logs:', fallbackVisitMap);
            setMonthlyVisits(fallbackVisitMap);
          } else {
            setMonthlyVisits({});
          }
        }
      } else {
        throw new Error(logsResponse.message || 'Failed to fetch logs');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message);
      setLogs([]);
      setMonthlyVisits({});
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Process and filter logs with grouping logic - Updated with better monthly visit handling
  const processedLogs = useMemo(() => {
    let filtered = logs;

    // Apply filters first
    if (dateFilter) {
      filtered = filtered.filter(logItem => {
        const logDate = new Date(logItem.logDate).toISOString().split('T')[0];
        return logDate === dateFilter;
      });
    }

    if (ownerSearch) {
      filtered = filtered.filter(logItem => {
        const person = logItem.person || {};
        const searchTerm = ownerSearch.toLowerCase();
        
        return (
          (person.name && person.name.toLowerCase().includes(searchTerm)) ||
          (person.cin && person.cin.includes(ownerSearch)) ||
          (person.matricule && person.matricule.includes(ownerSearch)) ||
          (person.id_sup && person.id_sup.includes(ownerSearch))
        );
      });
    }

    if (ownerTypeFilter) {
      filtered = filtered.filter(logItem => logItem.personType === ownerTypeFilter);
    }

    // Group by person if in grouped mode
    if (viewMode === 'grouped') {
      const grouped = {};
      
      filtered.forEach(logItem => {
        if (!logItem.person || !logItem.person._id) return;
        
        const key = `${logItem.person._id}-${logItem.personType}`;
        
        if (!grouped[key]) {
          grouped[key] = {
            person: logItem.person,
            personType: logItem.personType,
            logs: [],
            latestLog: logItem,
            totalVisits: 0,
            currentStatus: 'unknown',
            firstEntry: null,
            lastActivity: null,
            vehiclePlate: getVehiclePlate(logItem),
            monthlyVisitCount: logItem.personType === 'Supplier' && logItem.person._id 
              ? (logItem.monthlyVisitCount !== undefined ? logItem.monthlyVisitCount : (monthlyVisits[logItem.person._id] || 0))
              : 0
          };
        }
        
        grouped[key].logs.push(logItem);
        grouped[key].totalVisits++;
        
        // Update latest activity
        if (new Date(logItem.logDate) > new Date(grouped[key].latestLog.logDate)) {
          grouped[key].latestLog = logItem;
          // Update vehicle plate from latest log
          grouped[key].vehiclePlate = getVehiclePlate(logItem);
        }
        
        // Set first entry if this is earlier
        if (!grouped[key].firstEntry || new Date(logItem.logDate) < new Date(grouped[key].firstEntry.logDate)) {
          grouped[key].firstEntry = logItem;
        }
        
        // Update current status based on latest log
        if (logItem.status === 'entry' || logItem.status === 'present') {
          grouped[key].currentStatus = 'inside';
          grouped[key].lastActivity = logItem.logDate;
        } else if (logItem.status === 'exit' && new Date(logItem.logDate) > new Date(grouped[key].lastActivity || 0)) {
          grouped[key].currentStatus = 'outside';
          grouped[key].lastActivity = logItem.logDate;
        }
      });
      
      // Convert to array and sort by latest activity
      return Object.values(grouped).sort((a, b) => 
        new Date(b.latestLog.logDate) - new Date(a.latestLog.logDate)
      );
    }
    
    // Return individual logs for non-grouped view with enhanced monthly visit data
    return filtered.map(logItem => ({
      ...logItem,
      monthlyVisitCount: logItem.personType === 'Supplier' && logItem.person && logItem.person._id 
        ? (logItem.monthlyVisitCount !== undefined ? logItem.monthlyVisitCount : (monthlyVisits[logItem.person._id] || 0))
        : 0
    }));
  }, [logs, dateFilter, ownerSearch, ownerTypeFilter, viewMode, monthlyVisits]);

  // Enhanced debug function
  const handleDebug = () => {
    console.log('=== DEBUG INFORMATION ===');
    console.log('Current logs count:', logs.length);
    console.log('Monthly visits map:', monthlyVisits);
    console.log('Processed logs count:', processedLogs.length);
    
    if (logs.length > 0) {
      const sampleLog = logs[0];
      console.log('Sample log structure:', {
        id: sampleLog._id,
        personType: sampleLog.personType,
        hasVehicleInfo: !!sampleLog.vehicleInfo,
        vehicleInfo: sampleLog.vehicleInfo,
        hasPersonVehicles: !!(sampleLog.person && sampleLog.person.vehicles),
        personVehicles: sampleLog.person?.vehicles,
        monthlyVisitCount: sampleLog.monthlyVisitCount,
        vehiclePlate: getVehiclePlate(sampleLog)
      });
    }
    
    // Test vehicle plate function on first few logs
    logs.slice(0, 3).forEach((log, index) => {
      console.log(`Vehicle plate for log ${index + 1}:`, getVehiclePlate(log));
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">
          <p>Loading logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Access Logs</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div>
            <label style={{ marginRight: '5px' }}>View:</label>
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
              style={{ padding: '4px 8px' }}
            >
              <option value="grouped">Grouped by Person</option>
              <option value="individual">Individual Logs</option>
            </select>
          </div>
          <button 
            onClick={handleDebug}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Debug
          </button>
          <button 
            onClick={() => loadData()} 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
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
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="filter-section">
        <div>
          <label>Search by Owner: </label>
          <input 
            type="text" 
            value={ownerSearch} 
            onChange={(e) => setOwnerSearch(e.target.value)} 
            placeholder="Owner name, CIN, Matricule, or ID" 
          />
        </div>
        <div>
          <label>Date: </label>
          <input 
            type="date" 
            value={dateFilter} 
            style={{ marginRight: '50px' }} 
            onChange={(e) => setDateFilter(e.target.value)} 
          />
        </div>
        <div>
          <label>Owner Type: </label>
          <select value={ownerTypeFilter} onChange={(e) => setOwnerTypeFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Supplier">Supplier</option>
            <option value="LeoniPersonnel">Leoni Personnel</option>
            <option value="Worker">Worker</option>
          </select>
        </div>
      </div>

      <div className="stats-summary" style={{ 
        backgroundColor: '#e7f3ff', 
        padding: '10px', 
        marginBottom: '20px', 
        borderRadius: '4px',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <span><strong>Total Records:</strong> {processedLogs.length}</span>
        {viewMode === 'grouped' ? (
          <>
            <span><strong>Currently Inside:</strong> {processedLogs.filter(item => item.currentStatus === 'inside').length}</span>
            <span><strong>Total People:</strong> {processedLogs.length}</span>
          </>
        ) : (
          <>
            <span><strong>Currently Inside:</strong> {processedLogs.filter(logItem => logItem.status === 'entry' || logItem.status === 'present').length}</span>
            <span><strong>Completed Visits:</strong> {processedLogs.filter(logItem => logItem.status === 'exit').length}</span>
          </>
        )}
      </div>

      <div className="table-responsive">
        <table className="logs-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Plate</th>
            <th>Name</th>
            <th>Owner Type</th>
            <th>CIN / Matricule</th>
            {viewMode === 'grouped' ? (
              <>
                <th>Monthly Visits</th>
                <th>Total Visits</th>
                <th>Current Status</th>
                <th>Last Activity</th>
                <th>Total Duration</th>
              </>
            ) : (
              <>
                <th>Monthly Visits</th>
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Duration</th>
                <th>Status</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {processedLogs.length > 0 ? (
            processedLogs.map((item, idx) => {
              if (viewMode === 'grouped') {
                // Grouped view
                const person = item.person || {};
                const cinMatricule = item.personType === 'LeoniPersonnel' 
                  ? (person.matricule || person.cin || '—')
                  : (person.cin || person.id_sup || '—');

                return (
                  <tr key={`grouped-${item.person._id}-${idx}`}>
                    <td>{formatDate(item.latestLog.logDate)}</td>
                    <td style={{ fontWeight: 'bold', color: item.vehiclePlate === 'N/A' ? '#999' : '#333' }}>
                      {item.vehiclePlate}
                    </td>
                    <td>{person.name || 'Unknown'}</td>
                    <td>
                      <span className={
                        item.personType === 'Supplier' ? 'type-supplier' : 
                        item.personType === 'LeoniPersonnel' ? 'type-personnel' : 'type-worker'
                      }>
                        {item.personType === 'LeoniPersonnel' ? 'Leoni Personnel' : item.personType}
                      </span>
                    </td>
                    <td>{cinMatricule}</td>
                    <td>
                      {item.personType === 'Supplier' ? (
                        <strong style={{ 
                          color: '#007bff',
                          fontSize: '16px'
                        }}>
                          {item.monthlyVisitCount}
                        </strong>
                      ) : '—'}
                    </td>
                    <td><strong>{item.totalVisits}</strong></td>
                    <td className={item.currentStatus === 'inside' ? 'status-inside' : 'status-outside'}>
                      {item.currentStatus === 'inside' ? 'Inside' : 'Outside'}
                    </td>
                    <td>
                      {formatDate(item.lastActivity)}<br/>
                      <small>{formatTime(item.lastActivity)}</small>
                    </td>
                    <td>{calculateTotalDuration(item.logs)}</td>
                  </tr>
                );
              } else {
                // Individual view (original)
                const person = item.person || {};
                const status = item.status === 'exit' ? 'Exited' : 
                             item.status === 'entry' || item.status === 'present' ? 'Inside' : 
                             item.status;
                
                const duration = item.entryTime && item.exitTime ? 
                  (() => {
                    const durationMs = new Date(item.exitTime) - new Date(item.entryTime);
                    if (durationMs < 0) return '—';
                    const hours = Math.floor(durationMs / (1000 * 60 * 60));
                    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                    return `${hours}h ${minutes}m`;
                  })() : '—';
                
                const vehiclePlate = getVehiclePlate(item);
                
                const cinMatricule = item.personType === 'LeoniPersonnel' 
                  ? (person.matricule || person.cin || '—')
                  : (person.cin || person.id_sup || '—');

                return (
                  <tr key={`individual-${item._id}-${idx}`}>
                    <td>{formatDate(item.logDate)}</td>
                    <td style={{ fontWeight: 'bold', color: vehiclePlate === 'N/A' ? '#999' : '#333' }}>
                      {vehiclePlate}
                    </td>
                    <td>{person.name || 'Unknown'}</td>
                    <td>
                      <span className={
                        item.personType === 'Supplier' ? 'type-supplier' : 
                        item.personType === 'LeoniPersonnel' ? 'type-personnel' : 'type-worker'
                      }>
                        {item.personType === 'LeoniPersonnel' ? 'Leoni Personnel' : item.personType}
                      </span>
                    </td>
                    <td>{cinMatricule}</td>
                    <td>
                      {item.personType === 'Supplier' ? (
                        <strong style={{ 
                          color: '#007bff',
                          fontSize: '16px'
                        }}>
                          {item.monthlyVisitCount || 0}
                        </strong>
                      ) : '—'}
                    </td>
                    <td>{formatTime(item.entryTime)}</td>
                    <td>{formatTime(item.exitTime)}</td>
                    <td>{duration}</td>
                    <td className={status === 'Exited' ? 'status-exited' : 'status-inside'}>
                      {status}
                    </td>
                  </tr>
                );
              }
            })
          ) : (
            <tr>
              <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                {loading ? 'Loading logs...' : 'No logs found matching your criteria.'}
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="pagination" style={{ 
          marginTop: '20px', 
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          alignItems: 'center'
        }}>
          <button 
            onClick={() => loadData({ page: pagination.page - 1 })}
            disabled={pagination.page <= 1}
            style={{ padding: '5px 10px' }}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages} 
            ({pagination.total} total records)
          </span>
          <button 
            onClick={() => loadData({ page: pagination.page + 1 })}
            disabled={pagination.page >= pagination.pages}
            style={{ padding: '5px 10px' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default LogsTable;