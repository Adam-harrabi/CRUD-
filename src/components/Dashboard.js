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
    incidentTypes: [],
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

  // UPDATED FUNCTION: Calculate total parking activity per hour for TODAY only
  const calculateTotalParkingActivityByHour = async (personType) => {
    try {
      const headers = getAuthHeaders();
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      const response = await fetch(
        `${API_BASE_URL}/logs?personType=${personType}&limit=1000&dateFrom=${todayString}&dateTo=${todayString}`,
        { headers }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch parking activity data');
        return new Array(13).fill(0); // Return empty array for 13 time slots
      }
      
      const data = await response.json();
      const logs = data.data || [];
      
      // Group by entry hour and count ALL parking activities for TODAY (regardless of checkout status)
      const hourlyParkingActivity = {};
      
      // Initialize all hours from 5:00 to 17:00
      for (let hour = 5; hour <= 17; hour++) {
        hourlyParkingActivity[hour] = 0;
      }
      
      logs.forEach(log => {
        if (log.entryTime) {
          const entryDate = new Date(log.entryTime);
          const entryHour = entryDate.getHours();
          
          // Only count entries from today between 5:00 and 17:00
          if (entryHour >= 5 && entryHour <= 17) {
            hourlyParkingActivity[entryHour] += 1;
          }
        }
      });
      
      // Convert to array
      const activityCounts = [];
      for (let hour = 5; hour <= 17; hour++) {
        activityCounts.push(hourlyParkingActivity[hour]);
      }
      
      console.log(`Total parking activity by hour for ${personType} (TODAY):`, activityCounts);
      return activityCounts;
    } catch (error) {
      console.error('Error calculating parking activity data:', error);
      return new Array(13).fill(0); // Return empty array for 13 time slots
    }
  };

  // Function to calculate total visits for suppliers from logs
  const calculateTotalVisitsFromLogs = async () => {
    try {
      const headers = getAuthHeaders();
      
      // Fetch all supplier logs (increase limit to get more comprehensive data)
      const response = await fetch(
        `${API_BASE_URL}/logs?personType=Supplier&limit=2000&sortBy=logDate&sortOrder=desc`,
        { headers }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch supplier logs for visit calculation');
        return [];
      }
      
      const data = await response.json();
      const logs = data.data || [];
      
      console.log('Supplier logs for visit calculation:', logs.length);
      
      // Group logs by supplier and count total visits
      const supplierVisits = {};
      
      logs.forEach(log => {
        if (log.person && log.person._id) {
          const supplierId = log.person._id;
          
          if (!supplierVisits[supplierId]) {
            supplierVisits[supplierId] = {
              name: log.person.name || 'Unknown',
              cin: log.person.cin || log.person.id_sup || 'N/A',
              email: log.person.email || 'N/A',
              visits: 0
            };
          }
          
          supplierVisits[supplierId].visits += 1;
        }
      });
      
      // Convert to array and sort by visit count
      const sortedSuppliers = Object.values(supplierVisits)
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5); // Top 5 suppliers
      
      console.log('Calculated top suppliers:', sortedSuppliers);
      return sortedSuppliers;
      
    } catch (error) {
      console.error('Error calculating total visits from logs:', error);
      return [];
    }
  };

  // Function to calculate new vehicles registered by month
  const calculateNewVehiclesByMonth = async () => {
    try {
      const headers = getAuthHeaders();
      
      // Fetch all vehicles
      const response = await fetch(
        `${API_BASE_URL}/vehicles?limit=1000`,
        { headers }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch vehicles for registration calculation');
        return [];
      }
      
      const data = await response.json();
      const vehicles = data.vehicles || [];
      
      console.log('Vehicles for registration calculation:', vehicles.length);
      
      return vehicles;
      
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return [];
    }
  };

  // Function to calculate incident statistics by type
  const calculateIncidentTypeStats = async () => {
    try {
      const headers = getAuthHeaders();
      
      // Fetch all incidents to calculate type statistics
      const response = await fetch(
        `${API_BASE_URL}/incidents/admin/all?limit=1000`,
        { headers }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch incidents for type statistics');
        return [];
      }
      
      const data = await response.json();
      const incidents = data.incidents || [];
      
      console.log('Incidents for type calculation:', incidents.length);
      
      // Count incidents by type
      const typeStats = {};
      
      incidents.forEach(incident => {
        const type = incident.type || 'Unknown';
        if (!typeStats[type]) {
          typeStats[type] = {
            type: type,
            count: 0
          };
        }
        typeStats[type].count += 1;
      });
      
      // Convert to array and sort by count
      const sortedTypes = Object.values(typeStats)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 incident types
      
      console.log('Calculated incident type stats:', sortedTypes);
      return sortedTypes;
      
    } catch (error) {
      console.error('Error calculating incident type stats:', error);
      return [];
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

  // UPDATED Process API data into chart format - ONLY REAL DATA
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

    // Process registrations data - NOW TRACKING VEHICLES, NOT PEOPLE
    const vehicles = await calculateNewVehiclesByMonth();
    const registrationData = months.map(month => {
      let supplierVehicles = 0;
      let personnelVehicles = 0;

      // Count vehicles created in this month by owner type
      vehicles.forEach(vehicle => {
        if (vehicle.createdAt) {
          const createdMonth = new Date(vehicle.createdAt).toISOString().slice(0, 7);
          if (createdMonth === month.key) {
            if (vehicle.ownerType === 'Supplier') {
              supplierVehicles += 1;
            } else if (vehicle.ownerType === 'LeoniPersonnel') {
              personnelVehicles += 1;
            }
          }
        }
      });

      return { suppliers: supplierVehicles, personnel: personnelVehicles };
    });

    // UPDATED: Generate total parking activity data using the new function (shows all parking entries by hour)
    const supplierParkingData = await calculateTotalParkingActivityByHour('Supplier');
    const personnelParkingData = await calculateTotalParkingActivityByHour('LeoniPersonnel');

    // Process incidents by month with ALL specific types for stacked bar chart
    const incidentTypes = ['Login bug', 'Report submission error', 'Gate malfunction', 'Electricity outage', 'Fire', 'Car accident', 'Unauthorized worker entry', "Worker's vehicle overstaying"];
    
    const incidentsData = months.map(month => {
      const monthData = {};
      
      // Initialize all types to 0
      incidentTypes.forEach(type => {
        monthData[type] = 0;
      });

      if (incidents?.incidents) {
        incidents.incidents.forEach(incident => {
          if (incident.date) {
            const incidentMonth = new Date(incident.date).toISOString().slice(0, 7);
            if (incidentMonth === month.key && incident.type) {
              if (incidentTypes.includes(incident.type)) {
                monthData[incident.type] += 1;
              }
            }
          }
        });
      }

      return monthData;
    });

    // Calculate total visits for top suppliers from logs
    const topSuppliers = await calculateTotalVisitsFromLogs();

    // Calculate incident type statistics
    const incidentTypeStats = await calculateIncidentTypeStats();

    return {
      scheduledVisits,
      registrations: registrationData,
      parkingData: {
        supplier: supplierParkingData,
        personnel: personnelParkingData
      },
      incidents: incidentsData,
      topSuppliers,
      incidentTypes: incidentTypeStats,
      stats: logsStats?.data || null,
      monthLabels: months.map(m => m.name) // Store the month labels
    };
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Chart data configurations using processed data and dynamic labels
  // 1. Scheduled Supplier Visits - Single color Bar Chart as per requirements
  const barChartData = {
    labels: dashboardData.monthLabels,
    datasets: [
      {
        label: 'Scheduled Visits',
        data: dashboardData.scheduledVisits,
        backgroundColor: '#3b82f6', // Single blue color
        borderColor: '#2563eb',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // 2. New Vehicles Registered - Regular Bar Chart with different colors as per requirements
  const stackedBarChartData = {
    labels: dashboardData.monthLabels,
    datasets: [
      {
        label: 'Supplier Vehicles',
        data: dashboardData.registrations.map(reg => reg.suppliers),
        backgroundColor: '#3b82f6', // Blue for suppliers
        borderColor: '#2563eb',
        borderWidth: 1
      },
      {
        label: 'Personnel Vehicles',
        data: dashboardData.registrations.map(reg => reg.personnel),
        backgroundColor: '#ef4444', // Red for personnel
        borderColor: '#dc2626',
        borderWidth: 1
      },
    ],
  };

  // 3. UPDATED: Total Parking Activity by Entry Hour - Line Chart (TODAY ONLY)
  const lineChartData = {
    labels: ['5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    datasets: [
      {
        label: filter === 'supplier' ? 'Total Supplier Parking Activities (Today)' : 'Total Personnel Parking Activities (Today)',
        data: filter === 'supplier' ? dashboardData.parkingData.supplier : dashboardData.parkingData.personnel,
        borderColor: '#8b5cf6', // Single purple color
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#7c3aed',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  // 4. Incident Report - Stacked Bar Chart with different colors for parking and application incidents
  const parkingIncidents = ['Gate malfunction', 'Car accident', "Worker's vehicle overstaying"];
  const applicationIncidents = ['Login bug', 'Report submission error'];
  const facilityIncidents = ['Electricity outage', 'Fire', 'Unauthorized worker entry'];

  const incidentColors = {
    // Parking related incidents - Blue tones
    'Gate malfunction': '#3b82f6',
    'Car accident': '#1d4ed8',
    "Worker's vehicle overstaying": '#60a5fa',
    
    // Application related incidents - Red tones
    'Login bug': '#ef4444',
    'Report submission error': '#dc2626',
    
    // Facility incidents - Green/Orange tones
    'Electricity outage': '#f59e0b',
    'Fire': '#ea580c',
    'Unauthorized worker entry': '#10b981'
  };

  const incidentTypeList = ['Login bug', 'Report submission error', 'Gate malfunction', 'Electricity outage', 'Fire', 'Car accident', 'Unauthorized worker entry', "Worker's vehicle overstaying"];

  const incidentReportData = {
    labels: dashboardData.monthLabels,
    datasets: incidentTypeList.map((type) => ({
      label: type,
      data: dashboardData.incidents.map(monthData => monthData[type] || 0),
      backgroundColor: incidentColors[type],
      borderColor: incidentColors[type],
      borderWidth: 1
    }))
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 12
          }
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
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          }
        }
      }
    }
  };

  const stackedBarOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      x: {
        ...chartOptions.scales.x,
        stacked: true,
      },
      y: {
        ...chartOptions.scales.y,
        stacked: true,
      }
    }
  };

  // UPDATED: Line chart options for total parking activity display (TODAY)
  const lineChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        beginAtZero: true,
        ticks: {
          ...chartOptions.scales.y.ticks,
          stepSize: 1, // Show whole numbers only
          callback: function(value) {
            return Math.floor(value) + ' visits'; // Display as "X visits"
          }
        },
        title: {
          display: true,
          text: 'Total Number of Parking Activities (Today)'
        }
      },
      x: {
        ...chartOptions.scales.x,
        title: {
          display: true,
          text: 'Entry Time (Hour)'
        }
      }
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          afterLabel: function(context) {
            return 'All parking entries for today in this hour';
          }
        }
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
          {/* 1. Scheduled Supplier Visits by Month - Bar Chart (Single Color) */}
          <div className="chart-container">
            <h2>Scheduled Supplier Visits by Month</h2>
            <div style={{ height: '320px', width: '100%', position: 'relative' }}>
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>
          
          {/* 2. New Vehicles Registered by Month - Regular Bar Chart (Different Colors) */}
          <div className="chart-container">
            <h2>New Vehicles Registered by Month</h2>
            <div style={{ height: '320px', width: '100%', position: 'relative' }}>
              <Bar data={stackedBarChartData} options={chartOptions} />
            </div>
          </div>
          
          {/* 3. UPDATED: Total Parking Activity by Entry Hour - Line Chart (TODAY) */}
          <div className="chart-container">
            <h2 style={{ marginTop: '5px' }}>Average parking time per vehicule (Today)</h2>
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
          
          {/* 4. Incident Report by Month - Stacked Bar Chart (Different colors for parking vs application incidents) */}
          <div className="chart-container">
            <h2>Incident Report by Month</h2>
            <div style={{ height: '320px', width: '100%', position: 'relative' }}>
              <Bar data={incidentReportData} options={stackedBarOptions} />
            </div>
          </div>
        </div>
        
        {/* 5. Ranking Table for Most Frequent Supplier Visits - Scoreboard (No colors) */}
        <div className="chart-container" style={{ marginTop: 20 }}>
          <h2>Ranking Table for Most Frequent Supplier Visits</h2>
          <table className="ranking-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>CIN</th>
                <th>Email</th>
                <th>Total Number of Visits</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.topSuppliers.length > 0 ? (
                dashboardData.topSuppliers.map((supplier, index) => (
                  <tr key={supplier.cin || index}>
                    <td style={{ fontWeight: 'bold', color: index === 0 ? '#f59e0b' : index === 1 ? '#6b7280' : index === 2 ? '#cd7c2f' : '#374151' }}>
                      #{index + 1}
                    </td>
                    <td>{supplier.name}</td>
                    <td>{supplier.cin}</td>
                    <td>{supplier.email}</td>
                    <td className="visits">{supplier.visits}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No supplier visit data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* 6. UPDATED: Top 5 Frequent Incidents per Type - Simple Ranking Table (No percentage) */}
        <div className="chart-container" style={{ marginTop: 20 }}>
          <h2>Top 5 Frequent Incidents per Type</h2>
          <table className="ranking-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Incident Type</th>
                <th>Total Reported</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.incidentTypes.length > 0 ? (
                dashboardData.incidentTypes.map((incidentType, index) => (
                  <tr key={incidentType.type || index}>
                    <td style={{ fontWeight: 'bold', color: index === 0 ? '#f59e0b' : index === 1 ? '#6b7280' : index === 2 ? '#cd7c2f' : '#374151' }}>
                      #{index + 1}
                    </td>
                    <td>{incidentType.type}</td>
                    <td className="visits">{incidentType.count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No incident data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;