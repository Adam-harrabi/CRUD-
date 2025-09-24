import React, { useState, useEffect } from 'react';
import './SharedStyles.css';

const ConsultReports = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  // Get auth token from localStorage or context
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API base URL - adjust this to match your backend URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Load reports when component mounts or filters change
  useEffect(() => {
    fetchAllReports();
  }, [currentPage, statusFilter, typeFilter, priorityFilter, searchTerm]);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      setError('');

      const token = getAuthToken();
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
        ...(priorityFilter && { default_priority: priorityFilter }),
        ...(searchTerm && { reporter: searchTerm }) // Only search by reporter
      });

      const response = await fetch(`${API_BASE_URL}/incidents/admin/all?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReports(data.incidents || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsResolved = async (reportId) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        alert('Authentication token not found.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/incidents/admin/${reportId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to resolve incident');
      }

      // Update the report in the list
      setReports(prevReports =>
        prevReports.map(report =>
          report._id === reportId ? data.incident : report
        )
      );

      setSuccessMessage('Incident marked as resolved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error('Error resolving incident:', error);
      alert(error.message || 'Failed to resolve incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      resolved: 'status-resolved'
    };
    return `status-badge ${statusClasses[status] || 'status-pending'}`;
  };

  // Inline style for soft yellow pending badge
  const getStatusBadgeStyle = (status) => {
    if (status === 'pending') {
      return {
        background: '#FEF9C3', // soft yellow
        color: '#383735ff', // dark yellow text
        borderRadius: '6px',
        padding: '6px 14px',
        fontWeight: '500',
        fontSize: '14px',
        display: 'inline-block'
      };
    }
    return {};
  };

  const getPriorityBadgeClass = (priority) => {
    const priorityClasses = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high'
    };
    return `priority-badge ${priorityClasses[priority] || 'priority-medium'}`;
  };

  // Filter reports by reporter name (first and last) on the frontend
  const filteredReports = reports.filter(report => {
    if (!searchTerm.trim()) return true;
    if (!report.reportedBy) return false;
    const fullName = `${report.reportedBy.firstName} ${report.reportedBy.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.trim().toLowerCase());
  });

  return (
    <div className="container">
      <div className="header">
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: '#1f2937', 
          marginBottom: '24px',
          borderBottom: '3px solid #3b82f6',
          paddingBottom: '12px'
        }}>
          Admin - Consult Reports Incidents/Bugs
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message" style={{ 
          background: '#fee2e2', 
          border: '1px solid #fecaca', 
          color: '#dc2626', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="success-message" style={{ 
          background: '#d1fae5', 
          border: '1px solid #a7f3d0', 
          color: '#065f46', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          fontWeight: '500'
        }}>
          {successMessage}
        </div>
      )}

      {/* Enhanced Filters and Search */}
      <div className="filters-section" style={{ 
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#374151', 
          marginBottom: '16px' 
        }}>
          Search & Filter
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px'
        }}>
          <div className="search-bar">
              <input
                type="text"
                placeholder="Search by reporter name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
                }}
              />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          >
            <option value="">All Types</option>
            <option value="Login bug">Login bug</option>
            <option value="Report submission error">Report submission error</option>
            <option value="Gate malfunction">Gate malfunction</option>
            <option value="Electricity outage">Electricity outage</option>
            <option value="Fire">Fire</option>
            <option value="Car accident">Car accident</option>
            <option value="Unauthorized worker entry">Unauthorized worker entry</option>
            <option value="Worker's vehicle overstaying">Worker's vehicle overstaying</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="list">
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ 
              fontSize: '16px', 
              color: '#6b7280',
              fontWeight: '500'
            }}>
              Loading reports...
            </div>
          </div>
        )}

        <div style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Type</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Description</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Reporter</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Priority</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '16px' }}>
                    No reports found
                  </td>
                </tr>
              ) : (
                filteredReports.map((report, index) => (
                  <tr key={report._id} style={{ 
                    borderBottom: '1px solid #f3f4f6',
                    background: index % 2 === 0 ? 'white' : '#fafafa'
                  }}>
                    <td style={{ padding: '16px' }}>
                      <span className={`type-badge ${report.type === 'Real Parking' ? 'type-parking' : 'type-application'}`}>
                        {report.type}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }} title={report.description}>
                      {report.description.length > 50 
                        ? `${report.description.substring(0, 50)}...` 
                        : report.description}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {report.reportedBy ? 
                        `${report.reportedBy.firstName} ${report.reportedBy.lastName}` : 
                        'Unknown'
                      }
                    </td>
                    <td style={{ padding: '16px' }}>{new Date(report.date).toLocaleDateString()}</td>
                    <td style={{ padding: '16px' }}>
                      <span 
                        className={getStatusBadgeClass(report.status)}
                        style={getStatusBadgeStyle(report.status)}
                      >
                        {report.status || 'pending'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className={getPriorityBadgeClass(report.default_priority)}>
                        {report.default_priority || 'medium'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => handleMarkAsResolved(report._id)}
                        className="action-btn"
                        disabled={loading || report.status === 'resolved'}
                        style={{
                          padding: '8px 16px',
                          background: report.status === 'resolved' 
                            ? 'linear-gradient(135deg, #6b7280, #4b5563)' // Gray gradient for resolved
                            : 'linear-gradient(135deg, #10b981, #059669)', // Green gradient for pending
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: report.status === 'resolved' ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          boxShadow: report.status === 'resolved' 
                            ? '0 2px 4px rgba(107, 114, 128, 0.3)'
                            : '0 2px 4px rgba(16, 185, 129, 0.3)',
                          opacity: report.status === 'resolved' ? 0.6 : 1
                        }}
                      >
                        Mark as Resolved
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="pagination" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '12px', 
            marginTop: '24px' 
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              style={{
                padding: '10px 16px',
                border: '2px solid #e5e7eb',
                background: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              Previous
            </button>
            <span style={{ 
              padding: '10px 16px',
              background: '#f9fafb',
              borderRadius: '8px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              style={{
                padding: '10px 16px',
                border: '2px solid #e5e7eb',
                background: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultReports;  