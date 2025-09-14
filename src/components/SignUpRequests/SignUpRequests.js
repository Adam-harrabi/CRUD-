import React, { useState, useEffect } from 'react';
import '../SharedStyles.css';

const SignUpRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [action, setAction] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // API Base URL - adjust this to match your backend
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/admin';

  // Function to get auth token (adjust based on your auth implementation)
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Function to fetch pending requests from API
  const fetchPendingRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/pending-approvals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched requests:', data);
      setRequests(data.pendingUsers || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setError(error.message || 'Failed to fetch sign-up requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to approve a user
  const approveUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/approve-user/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  };

  // Function to reject a user
  const rejectUser = async (userId, reason = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/reject-user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error rejecting user:', error);
      throw error;
    }
  };

  // Load requests when component mounts
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleAction = (request, actionType) => {
    setSelectedRequest(request);
    setAction(actionType);
    setRejectionReason('');
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setError('');
    setLoading(true);

    try {
      if (action === 'approve') {
        const result = await approveUser(selectedRequest._id);
        console.log('User approved:', result);
        
        // Show success message (you can implement a toast notification here)
        alert(result.msg || 'User approved successfully!');
        
        // Refresh the requests list
        await fetchPendingRequests();
      } else if (action === 'reject') {
        const result = await rejectUser(selectedRequest._id, rejectionReason);
        console.log('User rejected:', result);
        
        // Show success message
        alert(result.msg || 'User rejected successfully!');
        
        // Refresh the requests list
        await fetchPendingRequests();
      }
    } catch (error) {
      setError(error.message || `Failed to ${action} user`);
      alert(`Error: ${error.message || `Failed to ${action} user`}`);
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      setSelectedRequest(null);
      setAction('');
      setRejectionReason('');
    }
  };

  const filteredRequests = requests.filter(request => 
    `${request.firstName} ${request.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <h1>Sign-Up Requests</h1>
       
      </div>

      {error && (
        <div 
          className="error-message" 
          style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}
        >
          {error}
        </div>
      )}

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
              <th>CIN</th>
              <th>PHONE</th>
              <th>REQUEST DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading && requests.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    <div className="spinner" style={{
                      border: '2px solid #f3f3f3',
                      borderTop: '2px solid #007bff',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Loading requests...
                  </div>
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  {searchTerm ? 'No requests found matching your search' : 'No sign-up requests found'}
                </td>
              </tr>
            ) : (
              filteredRequests.map(request => (
                <tr key={request._id}>
                  <td>{`${request.firstName} ${request.lastName}`}</td>
                  <td>{request.email}</td>
                  <td>{request.cin || 'N/A'}</td>
                  <td>{request.phone || request.phoneNumber || 'N/A'}</td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="approve-button" 
                      onClick={() => handleAction(request, 'approve')}
                      disabled={loading}
                      style={{ opacity: loading ? 0.6 : 1 }}
                    >
                      Approve
                    </button>
                    <button 
                      className="reject-button" 
                      onClick={() => handleAction(request, 'reject')}
                      disabled={loading}
                      style={{ opacity: loading ? 0.6 : 1 }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showConfirmModal && (
        <div className="modal">
          <div className="modal-content delete-confirm">
            <h2>{action === 'approve' ? 'Approve Request' : 'Reject Request'}</h2>
            <p>
              Are you sure you want to {action === 'approve' ? 'approve' : 'reject'} the request from{' '}
              {selectedRequest?.firstName} {selectedRequest?.lastName}?
            </p>
            
            {action === 'reject' && (
              <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                <label htmlFor="rejectionReason" style={{ display: 'block', marginBottom: '5px' }}>
                  Rejection Reason (Optional):
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}

            <div className="modal-buttons">
              <button 
                onClick={handleConfirm} 
                className={action === 'approve' ? 'edit-button' : 'delete-button'}
                style={action === 'approve' ? { backgroundColor: '#28a745' } : {}}
                disabled={loading}
              >
                {loading ? 'Processing...' : (action === 'approve' ? 'Approve' : 'Reject')}
              </button>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="cancel-button"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .request-count {
          background-color: #007bff;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .refresh-button:hover:not(:disabled) {
          background-color: #0056b3;
        }
        
        .approve-button:disabled,
        .reject-button:disabled {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default SignUpRequests;