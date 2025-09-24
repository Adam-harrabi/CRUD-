import React, { useState, useEffect } from 'react';
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
import './Dashboard.css'; // Your existing CSS file

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for dashboard data - NO fake data, only empty structures
  const [dashboardData, setDashboardData] = useState({
    scheduledVisits: [],
    registrations: [],
    parkingData: { 
      supplier: [],
      personnel: []
    },
    incidents: [],
    topSuppliers: [],
    stats: null,
    monthLabels: [] // Add this to store month labels
  });

  // API configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Function to generate last 5 months
  const generateMonthLabels = () => {
    const months = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentDate = new Date();
    
    for (let i = 4; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        name: monthNames[date.getMonth()],
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      });
    }
    
    return months;
  };

  // Function to generate vehicle count data per hour from logs
  const generateVehicleCountFromLogs = async (personType) => {
    try {
      const headers = getAuthHeaders();
      
      // Fetch logs from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const response = await fetch(
        `${API_BASE_URL}/logs?personType=${personType}&limit=1000&dateFrom=${thirtyDaysAgo.toISOString().split('T')[0]}`,
        { headers }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch vehicle count data');
        return new Array(13).fill(0); // Return empty array for 13 time slots
      }
      
      const data = await response.json();
      const logs = data.data || [];
      
      // Count vehicles by entry hour
      const hourlyData = {};
      
      // Initialize all hours from 5:00 to 17:00
      for (let hour = 5; hour <= 17; hour++) {
        hourlyData[hour] = 0;
      }
      
      logs.forEach(log => {
        if (log.entryTime) {
          const entryHour = new Date(log.entryTime).getHours();
          
          // Only consider entries between 5:00 and 17:00
          if (entryHour >= 5 && entryHour <= 17) {
            hourlyData[entryHour] += 1;
          }
        }
      });
      
      // Convert to array for chart
      const vehicleCounts = [];
      for (let hour = 5; hour <= 17; hour++) {
        vehicleCounts.push(hourlyData[hour]);
      }
      
      return vehicleCounts;
    } catch (error) {
      console.error('Error generating vehicle count data:', error);
      return new Array(13).fill(0); // Return empty array for 13 time slots
    }
  };

  // Fetch data from your backend APIs
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();

      // Real API calls to your exact endpoints
      const [
        logsStatsResponse,
        incidentStatsResponse,
        monthlyStatsResponse,
        suppliersResponse,
        personnelResponse,
        incidentsResponse
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/logs/stats`, { headers }),
        fetch(`${API_BASE_URL}/incidents/admin/stats`, { headers }),
        fetch(`${API_BASE_URL}/logs/monthly-stats`, { headers }),
        fetch(`${API_BASE_URL}/suppliers?limit=100`, { headers }),
        fetch(`${API_BASE_URL}/leoni-personnel`, { headers }),
        fetch(`${API_BASE_URL}/incidents/admin/all?limit=100`, { headers })
      ]);

      // Parse responses only if successful
      const logsStats = logsStatsResponse.ok ? await logsStatsResponse.json() : null;
      const incidentStats = incidentStatsResponse.ok ? await incidentStatsResponse.json() : null;
      const monthlyStats = monthlyStatsResponse.ok ? await monthlyStatsResponse.json() : null;
      const suppliers = suppliersResponse.ok ? await suppliersResponse.json() : null;
      const personnel = personnelResponse.ok ? await personnelResponse.json() : null;
      const incidents = incidentsResponse.ok ? await incidentsResponse.json() : null;

      console.log('API Responses:', { logsStats, incidentStats, monthlyStats, suppliers, personnel, incidents });

      // Process the data for charts - NO fallbacks, only real data
      const processedData = await processApiData({
        logsStats,
        incidentStats,
        monthlyStats,
        suppliers,
        personnel,
        incidents
      });

      setDashboardData(prevData => ({
        ...prevData,
        ...processedData
      }));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(`Failed to load dashboard data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Process API data into chart format - ONLY REAL DATA
  const processApiData = async ({ logsStats, incidentStats, monthlyStats, suppliers, personnel, incidents }) => {
    console.log('Processing data:', { logsStats, incidentStats, monthlyStats, suppliers, personnel, incidents });

    // Generate last 5 months for charts
    const months = generateMonthLabels();

    // Process scheduled visits using monthly stats data
    const scheduledVisits = months.map(month => {
      if (monthlyStats?.data?.supplierStats) {
        const monthData = monthlyStats.data.supplierStats.find(stat => stat.month === month.key);
        return monthData ? monthData.visitCount : 0;
      }
      return 0;
    });

    // Process registrations data from creation dates
    const registrationData = months.map(month => {
      let supplierCount = 0;
      let personnelCount = 0;

      // Count suppliers created in this month
      if (suppliers?.suppliers) {
        supplierCount = suppliers.suppliers.filter(supplier => {
          if (supplier.createdAt) {
            const createdMonth = new Date(supplier.createdAt).toISOString().slice(0, 7);
            return createdMonth === month.key;
          }
          return false;
        }).length;
      }

      // Count personnel created in this month
      if (personnel && Array.isArray(personnel)) {
        personnelCount = personnel.filter(person => {
          if (person.createdAt) {
            const createdMonth = new Date(person.createdAt).toISOString().slice(0, 7);
            return createdMonth === month.key;
          }
          return false;
        }).length;
      }

      return { suppliers: supplierCount, personnel: personnelCount };
    });

    // Generate vehicle count data using the new function
    const supplierVehicleData = await generateVehicleCountFromLogs('Supplier');
    const personnelVehicleData = await generateVehicleCountFromLogs('LeoniPersonnel');

    // Process incidents by month
    const incidentsData = months.map(month => {
      if (incidents?.incidents) {
        return incidents.incidents.filter(incident => {
          if (incident.date) {
            const incidentMonth = new Date(incident.date).toISOString().slice(0, 7);
            return incidentMonth === month.key;
          }
          return false;
        }).length;
      }
      return 0;
    });

    // Process top suppliers from monthly stats
    let topSuppliers = [];
    if (monthlyStats?.data?.supplierStats) {
      topSuppliers = monthlyStats.data.supplierStats
        .sort((a, b) => b.visitCount - a.visitCount)
        .slice(0, 5)
        .map(stat => ({
          name: stat.supplier?.name || 'Unknown',
          cin: stat.supplier?.cin || 'N/A',
          email: stat.supplier?.email || 'N/A',
          visits: stat.visitCount || 0
        }));
    }

    return {
      scheduledVisits,
      registrations: registrationData,
      parkingData: {
        supplier: supplierVehicleData,
        personnel: personnelVehicleData
      },
      incidents: incidentsData,
      topSuppliers,
      stats: logsStats?.data || null,
      monthLabels: months.map(m => m.name) // Store the month labels
    };
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Chart data configurations using processed data and dynamic labels
  const barChartData = {
    labels: dashboardData.monthLabels,
    datasets: [
      {
        label: 'Scheduled Visits',
        data: dashboardData.scheduledVisits,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
    ],
  };

  const stackedBarChartData = {
    labels: dashboardData.monthLabels,
    datasets: [
      {
        label: 'Suppliers',
        data: dashboardData.registrations.map(reg => reg.suppliers),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Personnel',
        data: dashboardData.registrations.map(reg => reg.personnel),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      },
    ],
  };

  const lineChartData = {
    labels: ['5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    datasets: [
      {
        label: filter === 'supplier' ? 'Supplier Vehicle Number' : 'Leoni Personnel Vehicle Number',
        data: filter === 'supplier' ? dashboardData.parkingData.supplier : dashboardData.parkingData.personnel,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
        tension: 0.4
      },
    ],
  };

  const incidentReportData = {
    labels: dashboardData.monthLabels,
    datasets: [
      {
        label: 'Incidents',
        data: dashboardData.incidents,
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666'
        }
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        max: 60
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="dashboard-content">
          <div className="dashboard-greeting">
            <h1 style={{ background: '#dbeafe', padding: '10px', borderRadius: '6px', fontWeight: 700, fontSize: '2rem', color: '#222', marginBottom: '20px' }}>
              Loading Dashboard... 
            </h1>
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <div style={{ 
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-layout">
        <div className="dashboard-content">
          <div className="dashboard-greeting">
            <h1 style={{ background: '#fecaca', padding: '10px', borderRadius: '6px', fontWeight: 700, fontSize: '2rem', color: '#dc2626', marginBottom: '20px' }}>
              Error Loading Dashboard
            </h1>
            <p style={{ color: '#dc2626', textAlign: 'center', marginBottom: '20px' }}>{error}</p>
            <button 
              onClick={fetchDashboardData}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'block',
                margin: '0 auto'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <div className="dashboard-greeting">
          <h1 style={{ background: '#dbeafe', padding: '10px', borderRadius: '6px', fontWeight: 700, fontSize: '2rem', color: '#222', marginBottom: '20px' }}>
            Good afternoon Admin 👋
          </h1>
        </div>
        <div className="dashboard-grid">
          <div className="chart-container">
            <h2>Scheduled Supplier Visits by Month</h2>
            <div style={{ height: '320px', width: '100%', position: 'relative' }}>
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>
          <div className="chart-container">
            <h2>New Registered by Month</h2>
            <div style={{ height: '320px', width: '100%', position: 'relative' }}>
              <Bar data={stackedBarChartData} options={chartOptions} />
            </div>
          </div>
          <div className="chart-container">
            <h2 style={{ marginTop: '5px' }}>Average Parking Time per Vehicle</h2>
            <div className="filter-container">
              <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="supplier">Supplier</option>
                <option value="leoniPersonnel">Leoni Personnel</option>
              </select>
            </div>
            <div style={{ height: '320px', width: '100%', position: 'relative' }}>
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>
          <div className="chart-container">
            <h2>Incident Report by Month</h2>
            <div style={{ height: '320px', width: '100%', position: 'relative' }}>
              <Bar data={incidentReportData} options={chartOptions} />
            </div>
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
              {dashboardData.topSuppliers.map((supplier, index) => (
                <tr key={supplier.cin || index}>
                  <td>{supplier.name}</td>
                  <td>{supplier.cin}</td>
                  <td>{supplier.email}</td>
                  <td className="visits">{supplier.visits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;