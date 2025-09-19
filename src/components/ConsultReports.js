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
  const [stats, setStats] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: '',
    adminNotes: '',
    priority: ''
  });
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
    fetchStats();
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
        ...(priorityFilter && { priority: priorityFilter }),
        ...(searchTerm && { search: searchTerm })
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

  const fetchStats = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/incidents/admin/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedReport || !statusUpdateData.status) {
      alert('Please select a status.');
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        alert('Authentication token not found.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/incidents/admin/${selectedReport._id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusUpdateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to update status');
      }

      // Update the report in the list
      setReports(prevReports =>
        prevReports.map(report =>
          report._id === selectedReport._id ? data.incident : report
        )
      );

      setSuccessMessage(`Incident ${statusUpdateData.status} successfully!`);
      setShowStatusModal(false);
      setSelectedReport(null);
      setStatusUpdateData({ status: '', adminNotes: '', priority: '' });
      setTimeout(() => setSuccessMessage(''), 3000);

      // Refresh stats
      fetchStats();

    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.message || 'Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (report) => {
    setSelectedReport(report);
    setStatusUpdateData({
      status: report.status || '',
      adminNotes: report.adminNotes || '',
      priority: report.priority || 'medium'
    });
    setShowStatusModal(true);
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      resolved: 'status-resolved'
    };
    return `status-badge ${statusClasses[status] || 'status-pending'}`;
  };

  const getPriorityBadgeClass = (priority) => {
    const priorityClasses = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high'
    };
    return `priority-badge ${priorityClasses[priority] || 'priority-medium'}`;
  };

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
        
        {/* Enhanced Statistics Overview */}
        {stats.overall && (
          <div className="stats-container" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              color: 'white', 
              fontSize: '20px', 
              fontWeight: '600', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Reports Overview
            </h2>
            <div className="stats-grid" style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div className="stat-card" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                minWidth: '140px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                border: '2px solid #e5e7eb',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  color: '#1f2937',
                  marginBottom: '8px'
                }}>
                  {stats.overall.total}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Total Reports
                </div>
              </div>

              <div className="stat-card" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                minWidth: '140px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                border: '2px solid #fbbf24',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  color: '#d97706',
                  marginBottom: '8px'
                }}>
                  {stats.overall.pending}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#92400e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Pending
                </div>
              </div>

              <div className="stat-card" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                minWidth: '140px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                border: '2px solid #10b981',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  color: '#059669',
                  marginBottom: '8px'
                }}>
                  {stats.overall.approved}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#047857',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Approved
                </div>
              </div>

              <div className="stat-card" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                minWidth: '140px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                border: '2px solid #ef4444',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  color: '#dc2626',
                  marginBottom: '8px'
                }}>
                  {stats.overall.rejected}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#991b1b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Rejected
                </div>
              </div>

              <div className="stat-card" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                minWidth: '140px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                border: '2px solid #3b82f6',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  color: '#2563eb',
                  marginBottom: '8px'
                }}>
                  {stats.overall.resolved}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1d4ed8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Resolved
                </div>
              </div>
            </div>
          </div>
        )}
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
              placeholder="Search by type, description, or reporter..."
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
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
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
            <option value="Real Parking">Real Parking</option>
            <option value="Application">Application</option>
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
              {!loading && reports.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '16px' }}>
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((report, index) => (
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
                      {report.reportedBy?.cin && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          CIN: {report.reportedBy.cin}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>{new Date(report.date).toLocaleDateString()}</td>
                    <td style={{ padding: '16px' }}>
                      <span className={getStatusBadgeClass(report.status)}>
                        {report.status || 'pending'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className={getPriorityBadgeClass(report.priority)}>
                        {report.priority || 'medium'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => openStatusModal(report)}
                        className="action-btn"
                        disabled={loading}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        Update
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

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            minWidth: '500px',
            maxWidth: '600px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
          }}>
            <h3 style={{ 
              fontSize: '22px', 
              fontWeight: '700', 
              color: '#1f2937', 
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              Update Report Status
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                Status:
              </label>
              <select
                value={statusUpdateData.status}
                onChange={(e) => setStatusUpdateData(prev => ({ ...prev, status: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                Priority:
              </label>
              <select
                value={statusUpdateData.priority}
                onChange={(e) => setStatusUpdateData(prev => ({ ...prev, priority: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                Admin Notes:
              </label>
              <textarea
                value={statusUpdateData.adminNotes}
                onChange={(e) => setStatusUpdateData(prev => ({ ...prev, adminNotes: e.target.value }))}
                placeholder="Add any notes about this decision..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedReport(null);
                }}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  color: '#6b7280'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={loading || !statusUpdateData.status}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                }}
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultReports;