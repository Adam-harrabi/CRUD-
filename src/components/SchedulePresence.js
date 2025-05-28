import React, { useState } from 'react';
import './SharedStyles.css';

const SchedulePresence = ({ schedules, setSchedules }) => {
  const [formData, setFormData] = useState({
   
    supplier_name: '',
    sch_date: '',
    duration: '',
    reason: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setSchedules(schedules.map(schedule =>
        schedule.id === editId ? { ...formData, id: editId } : schedule
      ));
      setIsEditing(false);
      setEditId(null);
    } else {
      setSchedules([...schedules, { ...formData, id: Date.now() }]);
      alert('Schedule presence added successfully!');
    }
    setFormData({
    
      supplier_name: '',
     
      sch_date: '',
      duration: '',
      reason: ''
    });
    setShowForm(false);
  };

  const handleEdit = (schedule) => {
    setIsEditing(true);
    setEditId(schedule.id);
    setFormData(schedule);
    setShowForm(true);
  };

  const handleDeleteClick = (schedule) => {
    setScheduleToDelete(schedule);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setSchedules(schedules.filter(schedule => schedule.id !== scheduleToDelete.id));
    setShowDeleteConfirm(false);
    setScheduleToDelete(null);
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison
  
    if (selectedDate < today) {
      alert('You cannot select a past date.');
      setFormData({ ...formData, sch_date: '' }); // Reset the date field
    } else {
      setFormData({ ...formData, sch_date: e.target.value });
    }
  };

  const filteredSchedules = schedules.filter(schedule =>
    schedule.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.supplier_cin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <h1>Schedule Presence Management</h1>
        <button className="add-button" style={{ marginRight: '150px' }} onClick={() => setShowForm(true)}>
          + Schedule Presence
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by supplier name or CIN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="list">
        <table>
          <thead>
            <tr>
              <th>SUPPLIER NAME</th>
             
              
              <th>DATE</th>
              <th>DURATION</th>
              <th>REASON</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map(schedule => (
              <tr key={schedule.id}>
                <td>{schedule.supplier_name}</td>
               
                <td>{schedule.sch_date}</td>
                <td>{schedule.duration}</td>
                <td>{schedule.reason}</td>
                <td>
                  <button className="edit-button" onClick={() => handleEdit(schedule)}>
                    Edit
                  </button>
                  <button className="delete-button" onClick={() => handleDeleteClick(schedule)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? 'Edit Schedule' : 'Add Schedule'}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Supplier Name"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                required
              />
            
              
              <input
                type="date"
                placeholder="Schedule Date"
                value={formData.sch_date}
                onChange={handleDateChange}
                required
              />
              <input
                type="number"
                placeholder="Duration (hours)"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
              <textarea
                placeholder="Reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                
              />
              <div className="modal-buttons">
                <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setIsEditing(false);
                  setFormData({
                   
                    supplier_name: '',
                    
                    sch_date: '',
                    duration: '',
                    reason: ''
                  });
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content delete-confirm">
            <h2>Delete Schedule</h2>
            <p>Are you sure you want to delete this schedule for {scheduleToDelete?.supplier_name}? </p>
            <div className="modal-buttons">
              <button onClick={handleDeleteConfirm} className="delete-button">Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePresence;
