import React, { useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Sidebar from './Sidebar'; // Make sure the path is correct
import './Dashboard.css'; // Create this CSS file for layout styles

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [filter, setFilter] = useState('supplier');

  const barChartData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Scheduled Visits',
        data: [10, 20, 15, 25, 30],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const stackedBarChartData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Suppliers',
        data: [5, 10, 8, 12, 15],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Personnel',
        data: [3, 7, 6, 10, 12],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const lineChartData = {
    labels: ['5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    datasets: [
      {
        label: filter === 'supplier' ? 'Supplier Vehicle Number' : 'Leoni Personnel Vehicle Number',
        data: filter === 'supplier'
          ? [10, 50, 20, 60, 30, 55, 25, 45, 35, 50, 40, 60, 30]
          : [5, 40, 15, 50, 20, 45, 25, 35, 30, 40, 35, 50, 25],
        borderColor: 'rgba(153, 102, 255, 0.8)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
      },
    ],
  };

  const incidentReportData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Incidents',
        data: [8, 15, 12, 20, 18],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        title: {
          display: false, // Hide x-axis title
          text: 'Time (hours)',
        },
      },
      y: {
        title: {
          display: false, // Hide y-axis title
          text: 'Number of Vehicles',
        },
        max: 60,
      },
    },
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-greeting">
          <h1 style={{ background: '#dbeafe', padding: '10px', borderRadius: '6px', fontWeight: 700, fontSize: '2rem', color: '#222', marginBottom: '20px' }}>
            Good afternoon Admin <span role="img" aria-label="wave">👋</span>
          </h1>
        </div>
        <div className="dashboard-grid">
          <div className="chart-container">
            <h2>Scheduled Supplier Visits by Month</h2>
            <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          </div>
          <div className="chart-container">
            <h2>New Registered by Month</h2>
            <Bar
              data={stackedBarChartData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'top' } },
                scales: {
                  x: { stacked: false },
                  y: { stacked: false },
                },
              }}
            />
          </div>
          <div className="chart-container">
            <h2 style={{ marginTop: '5px' }}>Average Parking Time per Vehicle</h2>
            <div className="filter-container">
              
              <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="supplier">Supplier</option>
                <option value="leoniPersonnel">Leoni Personnel</option>
              </select>
            </div>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
          <div className="chart-container">
            <h2>Incident Report by Month</h2>
            <Bar
              data={incidentReportData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'top' } },
                scales: {
                  x: { stacked: true },
                  y: { stacked: true, max: 30 },
                },
              }}
            />
          </div>
        </div>
        <div className="chart-container" style={{ marginTop: 20 }}>
          <h2>Ranking Table for Most Frequent Supplier Visits</h2>
          <table className="ranking-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>CIN</th>
                <th>Email</th>
                <th>Number of Visits</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Adem Harrabi</td>
                <td>123456</td>
                <td>ademharrabi100@gmail.com</td>
                <td className="visits">50</td>
              </tr>
              <tr>
                <td>Hassen</td>
                <td>654321</td>
                <td>Hassen213@gmail.com</td>
                <td className="visits">40</td>
              </tr>
              <tr>
                <td>Sameh Guetari</td>
                <td>789012</td>
                <td>samehguetari@gmail.com</td>
                <td className="visits">30</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
