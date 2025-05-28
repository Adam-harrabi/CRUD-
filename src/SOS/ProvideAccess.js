import React, { useState } from 'react';
import '../components/SharedStyles.css'; // Corrected the path to SharedStyles.css
import './ProvideAccess.css'; // Corrected the casing of the CSS file import
const ProvideAccess = () => {
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState(''); // 'checkIn' or 'checkOut'
  const [formData, setFormData] = useState({
    cinMatricule: '',
    name: '',
    plate: '',
    date: ''
  });
  const [accessList, setAccessList] = useState(() => {
    const storedAccessList = localStorage.getItem('accessList');
    return storedAccessList ? JSON.parse(storedAccessList) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Save data to localStorage whenever accessList changes
  React.useEffect(() => {
    localStorage.setItem('accessList', JSON.stringify(accessList));
  }, [accessList]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedAccessList = accessList.map((row, index) => {
      if (index === accessList.length - 1) {
        return { ...row, time: formMode === 'checkIn' ? formData.entryTime : formData.exitTime };
      }
      return row;
    });
    setAccessList(updatedAccessList);

    if (formMode === 'checkIn') {
      alert(`${formData.name} has entered successfully.`);
    } else if (formMode === 'checkOut') {
      alert(`${formData.name} has left successfully.`);
    }

    setFormData({ cinMatricule: '', name: '', plate: '', date: '', entryTime: '', exitTime: '' });
    setShowForm(false);
  };

  const handleCheckIn = (idx) => {
    setFormMode('checkIn');
    setShowForm(true);
    const updatedAccessList = accessList.map((row, index) => {
      if (index === idx) {
        const currentTime = new Date().toLocaleTimeString();
        return { ...row, status: 'Entry', entryTime: currentTime, exitTime: '-', duration: '-' };
      }
      return row;
    });
    setAccessList(updatedAccessList);
  };

  const handleCheckOut = (idx) => {
    setFormMode('checkOut');
    setShowForm(true);
    const updatedAccessList = accessList.map((row, index) => {
      if (index === idx) {
        const currentTime = new Date().toLocaleTimeString();
        const entryTime = row.entryTime;

        // Calculate duration
        const [entryHours, entryMinutes] = entryTime.split(':').map(Number);
        const [exitHours, exitMinutes] = currentTime.split(':').map(Number);
        const durationHours = exitHours - entryHours;
        const durationMinutes = exitMinutes - entryMinutes;
        const duration = `${durationHours}h ${Math.abs(durationMinutes)}m`;

        return { ...row, status: 'Exit', exitTime: currentTime, duration };
      }
      return row;
    });
    setAccessList(updatedAccessList);
  };

  const filteredAccessList = accessList.filter(row =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.cinMatricule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="supplier-container">
      <div className="header">
        <h1>Provide Access</h1>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{formMode === 'checkIn' ? 'Check In Form' : 'Check Out Form'}</h2>
            <form onSubmit={handleSubmit}>
              {formMode === 'checkIn' && (
                <>
                  <label htmlFor="date">Date:</label>
                  <input
                    id="date"
                    type="date"
                    placeholder="Date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <label htmlFor="entryTime">Entry Time:</label>
                  <input
                    id="entryTime"
                    type="time"
                    placeholder="Entry Time"
                    value={formData.entryTime || ''}
                    onChange={(e) => setFormData({ ...formData, entryTime: e.target.value })}
                    required
                  />
                </>
              )}
              {formMode === 'checkOut' && (
                <>
                  <label htmlFor="date">Date:</label>
                  <input
                    id="date"
                    type="date"
                    placeholder="Date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <label htmlFor="exitTime">Exit Time:</label>
                  <input
                    id="exitTime"
                    type="time"
                    placeholder="Exit Time"
                    value={formData.exitTime || ''}
                    onChange={(e) => setFormData({ ...formData, exitTime: e.target.value })}
                    required
                  />
                </>
              )}
              <div className="modal-buttons">
                <button type="submit">Submit</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ cinMatricule: '', name: '', plate: '', date: '', entryTime: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="supplier-list">
        <table>
          <thead>
            <tr>
              <th>Worker</th>
              <th>Type</th>
              <th>Vehicle Matricule</th>
              <th>CIN</th>
              <th>Status</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccessList.map((row, idx) => (
              <tr key={idx}>
                <td>{row.name}</td>
                <td>{row.type}</td>
                <td>{row.plate}</td>
                <td>{row.cinMatricule}</td>
                <td className={row.status === 'Entry' ? 'status-entry' : row.status === 'Exit' ? 'status-exit' : ''}>
                  {row.status}
                </td>
                <td>{row.time}</td>
                <td>
                  <button className="check-in-button" onClick={() => handleCheckIn(idx)}>Check In</button>
                  <button className="check-out-button" style={{ marginLeft: '10px' }} onClick={() => handleCheckOut(idx)}>Check Out</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProvideAccess;
