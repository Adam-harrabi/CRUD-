import React, { useState } from 'react';
import './LogsTable.css';

const logsData = [
  { id: 1, plate: '123 TU 456', owner: 'Ahmed L.', ownerType: 'Supplier', CIN: '01234567', entryTime: '08:12', exitTime: '17:45', date: '2025-04-10' },
  { id: 2, plate: '456 AB 789', owner: 'A. Ben Ali', ownerType: 'Personnel', matricule: 'MAT09876', entryTime: '09:00', exitTime: '', date: '2025-04-10' },
  { id: 3, plate: '789 CD 321', owner: 'Sami J.', ownerType: 'Supplier', CIN: '09876543', entryTime: '07:45', exitTime: '16:30', date: '2025-04-11' },
  { id: 4, plate: '321 EF 654', owner: 'Fatma K.', ownerType: 'Personnel', matricule: 'MAT12345', entryTime: '10:00', exitTime: '18:00', date: '2025-04-11' },
  { id: 5, plate: '654 GH 987', owner: 'Yassine M.', ownerType: 'Supplier', CIN: '11223344', entryTime: '08:20', exitTime: '', date: '2025-04-12' },
  { id: 6, plate: '987 IJ 210', owner: 'Imen B.', ownerType: 'Personnel', matricule: 'MAT54321', entryTime: '09:15', exitTime: '17:50', date: '2025-04-12' },
  { id: 7, plate: '111 KK 999', owner: 'Zouhair R.', ownerType: 'Supplier', CIN: '66778899', entryTime: '06:55', exitTime: '14:30', date: '2025-04-13' },
  { id: 8, plate: '999 LL 111', owner: 'Rania A.', ownerType: 'Personnel', matricule: 'MAT67890', entryTime: '11:00', exitTime: '', date: '2025-04-13' }
];

const LogsTable = () => {
  const [dateFilter, setDateFilter] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [filteredLogs, setFilteredLogs] = useState(logsData);

  const handleDateChange = (e) => {
    setDateFilter(e.target.value);
    filterLogs(e.target.value, ownerSearch);
  };

  const handleSearchChange = (e) => {
    setOwnerSearch(e.target.value);
    filterLogs(dateFilter, e.target.value);
  };

  const handleOwnerTypeChange = (e) => {
    const ownerTypeFilter = e.target.value;
    filterLogs(dateFilter, ownerSearch, ownerTypeFilter);
  };

  const filterLogs = (date, owner, ownerType) => {
    const filtered = logsData.filter(log => {
      return (
        (date ? log.date === date : true) &&
        (owner ? log.owner.toLowerCase().includes(owner.toLowerCase()) || log.CIN?.includes(owner) || log.matricule?.includes(owner) : true) &&
        (ownerType ? log.ownerType === ownerType : true)
      );
    });
    setFilteredLogs(filtered);
  };

  return (
    <div className="container">
      <div className="filter-section">
        <div>
          <label>Search by Owner: </label>
          <input type="text" value={ownerSearch} onChange={handleSearchChange} placeholder="Owner name, CIN or Matricule" />
        </div>
        <div>
          <label>Date: </label>
          <input type="date" value={dateFilter} style={{ marginRight: '50px' }} onChange={handleDateChange} />
        </div>
        <div>
          <label>Owner Type: </label>
          <select onChange={handleOwnerTypeChange}>
            <option value="">All</option>
            <option value="Supplier">Supplier</option>
            <option value="Personnel">Personnel</option>
          </select>
        </div>
      </div>

      <table className="logs-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Plate</th>
            <th>Name</th>
            <th>Owner Type</th>
            <th>CIN / Matricule</th>
            <th>Entry Time</th>
            <th>Exit Time</th>
            <th>Duration</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map(log => {
            const status = log.exitTime ? 'Exited' : 'Inside';

            // Calculate duration if both entry and exit times are available
            let duration = '—';
            if (log.entryTime && log.exitTime) {
              const [entryHours, entryMinutes] = log.entryTime.split(':').map(Number);
              const [exitHours, exitMinutes] = log.exitTime.split(':').map(Number);
              const durationHours = exitHours - entryHours;
              const durationMinutes = exitMinutes - entryMinutes;
              duration = `${durationHours}h ${Math.abs(durationMinutes)}m`;
            }

            return (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.date}</td>
                <td>{log.plate}</td>
                <td>{log.owner}</td>
                <td>{log.ownerType}</td>
                <td>{log.ownerType === 'Supplier' ? log.CIN : log.matricule}</td>
                <td>{log.entryTime}</td>
                <td>{log.exitTime || '—'}</td>
                <td>{duration}</td>
                <td className={status === 'Exited' ? 'status-exited' : 'status-inside'}>
                  {status}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LogsTable;