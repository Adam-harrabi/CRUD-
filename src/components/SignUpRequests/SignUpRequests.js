import React, { useState, useEffect } from 'react';
import '../SharedStyles.css';

const SignUpRequests = () => {
  const [requests, setRequests] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [action, setAction] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load requests when component mounts
  useEffect(() => {
    const loadRequests = () => {
      const savedRequests = localStorage.getItem('signupRequests');
      if (savedRequests) {
        try {
          const parsedRequests = JSON.parse(savedRequests);
          console.log('Loaded requests:', parsedRequests); // Debug log
          setRequests(parsedRequests);
        } catch (error) {
          console.error('Error parsing requests:', error);
          setRequests([]);
        }
      } else {
        console.log('No requests found in localStorage'); // Debug log
        setRequests([]);
      }
    };

    loadRequests();
  }, []);

  const handleAction = (request, actionType) => {
    setSelectedRequest(request);
    setAction(actionType);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (action === 'approve') {
      // In a real application, you would:
      // 1. Make an API call to activate the account
      // 2. Send an email notification to the user
      // 3. Update the database
      
      const updatedRequests = requests.filter(req => req.id !== selectedRequest.id);
      setRequests(updatedRequests);
      localStorage.setItem('signupRequests', JSON.stringify(updatedRequests));
    } else if (action === 'reject') {
      // In a real application, you would:
      // 1. Make an API call to delete the account
      // 2. Send an email notification to the user
      // 3. Update the database
      
      const updatedRequests = requests.filter(req => req.id !== selectedRequest.id);
      setRequests(updatedRequests);
      localStorage.setItem('signupRequests', JSON.stringify(updatedRequests));
    }
    setShowConfirmModal(false);
    setSelectedRequest(null);
    setAction('');
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
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  No sign-up requests found
                </td>
              </tr>
            ) : (
              filteredRequests.map(request => (
                <tr key={request.id}>
                  <td>{`${request.firstName} ${request.lastName}`}</td>
                  <td>{request.email}</td>
                  <td>{request.cin}</td>
                  <td>{request.phoneNumber}</td>
                  <td>{new Date(request.requestDate).toLocaleDateString()}</td>
                  <td>
  <button 
    className="approve-button" 
    onClick={() => handleAction(request, 'approve')}>
    Approve
  </button>
  <button 
    className="reject-button" 
    onClick={() => handleAction(request, 'reject')}>
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
            <div className="modal-buttons">
              <button 
                onClick={handleConfirm} 
                className={action === 'approve' ? 'edit-button' : 'delete-button'}
                style={action === 'approve' ? { backgroundColor: '#28a745' } : {}}
              >
                {action === 'approve' ? 'Approve' : 'Reject'}
              </button>
              <button onClick={() => setShowConfirmModal(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpRequests;