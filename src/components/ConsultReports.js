import React, { useState, useEffect } from 'react';
import './SharedStyles.css';

const ConsultReports = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load reports when component mounts
  useEffect(() => {
    const loadReports = () => {
      const savedReports = localStorage.getItem('incidents'); // Corrected key
      if (savedReports) {
        try {
          const parsedReports = JSON.parse(savedReports);
          console.log('Loaded reports:', parsedReports); // Debug log
          setReports(parsedReports);
        } catch (error) {
          console.error('Error parsing reports:', error);
          setReports([]);
        }
      } else {
        console.log('No reports found in localStorage'); // Debug log
        setReports([]);
      }
    };

    loadReports();

    // Debugging: Log localStorage content
    console.log('Current localStorage content:', localStorage);
  }, []);

  const filteredReports = reports.filter(
    (report) =>
      report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(report.date).toLocaleDateString().includes(searchTerm)
  );

  return (
    <div className="container">
      <div className="header">
        <h1>Consult Reports Incidents/Bugs</h1>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by type, description, or date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="list">
        <table>
          <thead>
            <tr>
              <th>Type of Report</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                  No reports found
                </td>
              </tr>
            ) : (
              filteredReports.map((report, index) => (
                <tr key={index}>
                  <td>{report.type}</td>
                  <td>{report.description}</td>
                  <td>{new Date(report.date).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsultReports;
