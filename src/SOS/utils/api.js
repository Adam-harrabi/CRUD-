// utils/api.js - Updated API functions with monthly visits support

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Common headers
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// =====================================================
// LOG API FUNCTIONS - Updated with monthly visits
// =====================================================
export const logAPI = {
  // Check in a person
  checkIn: async (data) => {
    const response = await fetch(`${API_BASE_URL}/logs/checkin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  // Check out a person
  checkOut: async (data) => {
    const response = await fetch(`${API_BASE_URL}/logs/checkout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  // Get all logs with enhanced monthly visit data
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/logs${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  // Get currently active entries
  getActive: async () => {
    const response = await fetch(`${API_BASE_URL}/logs/active`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  // Get logs for specific person
  getByPerson: async (personId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/logs/person/${personId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  // Get vehicle logs (Vehiculog)
  getVehicleLogs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/logs/vehicles${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  // Get statistics
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/logs/stats`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  // NEW: Get monthly visit history for specific supplier
  getMonthlyVisits: async (supplierId, months = 12) => {
    const response = await fetch(`${API_BASE_URL}/logs/monthly-visits/${supplierId}?months=${months}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  // NEW: Get monthly statistics for all suppliers
  getMonthlyStats: async (month = '') => {
    const currentMonth = month || new Date().toISOString().slice(0, 7);
    const response = await fetch(`${API_BASE_URL}/logs/monthly-stats?month=${currentMonth}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
};

// =====================================================
// SUPPLIER API FUNCTIONS
// =====================================================
export const supplierAPI = {
  // Get all suppliers
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/suppliers${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  // Get single supplier
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
};

// =====================================================
// SCHEDULE PRESENCE API FUNCTIONS
// =====================================================
export const scheduleAPI = {
  // Get all schedule presences
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/schedule-presence${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  // Get single schedule presence
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/schedule-presence/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
};

// =====================================================
// LEONI PERSONNEL API FUNCTIONS
// =====================================================
export const personnelAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/leoni-personnel${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch personnel: ${response.status}`);
    }
    
    return await response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/leoni-personnel/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch personnel');
    return response.json();
  },

  create: async (personnelData) => {
    const response = await fetch(`${API_BASE_URL}/leoni-personnel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(personnelData)
    });
    if (!response.ok) throw new Error('Failed to create personnel');
    return response.json();
  },

  update: async (id, personnelData) => {
    const response = await fetch(`${API_BASE_URL}/leoni-personnel/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(personnelData)
    });
    if (!response.ok) throw new Error('Failed to update personnel');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/leoni-personnel/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete personnel');
    return response.json();
  }
};

// =====================================================
// COMBINED API FUNCTIONS FOR EASIER USE - UPDATED
// =====================================================
export const accessAPI = {
  // Get all data needed for access management page with monthly visits
  getAllAccessData: async () => {
    try {
      console.log('Fetching access data...');
      
      // Initialize with empty arrays as fallback
      let suppliers = [];
      let personnel = [];
      let schedules = [];
      let activeLogs = [];
      let monthlyStats = {};

      // Fetch suppliers with error handling
      try {
        const suppliersResponse = await supplierAPI.getAll();
        console.log('Suppliers response:', suppliersResponse);
        suppliers = suppliersResponse.suppliers || suppliersResponse.data || suppliersResponse || [];
      } catch (error) {
        console.warn('Failed to fetch suppliers:', error.message);
        suppliers = [];
      }

      // Fetch personnel with error handling
      try {
        const personnelResponse = await personnelAPI.getAll();
        console.log('Personnel response:', personnelResponse);
        personnel = personnelResponse.personnel || personnelResponse.data || personnelResponse || [];
      } catch (error) {
        console.warn('Failed to fetch personnel:', error.message);
        personnel = [];
      }

      // Fetch schedules with error handling
      try {
        const schedulesResponse = await scheduleAPI.getAll();
        console.log('Schedules response:', schedulesResponse);
        schedules = schedulesResponse.data || schedulesResponse || [];
      } catch (error) {
        console.warn('Failed to fetch schedules:', error.message);
        schedules = [];
      }

      // Fetch active logs with error handling
      try {
        const activeLogsResponse = await logAPI.getActive();
        console.log('Active logs response:', activeLogsResponse);
        activeLogs = activeLogsResponse.data || activeLogsResponse || [];
      } catch (error) {
        console.warn('Failed to fetch active logs:', error.message);
        activeLogs = [];
      }

      // Fetch monthly statistics for current month
      try {
        const monthlyStatsResponse = await logAPI.getMonthlyStats();
        console.log('Monthly stats response:', monthlyStatsResponse);
        if (monthlyStatsResponse.success && monthlyStatsResponse.data.supplierStats) {
          monthlyStatsResponse.data.supplierStats.forEach(stat => {
            if (stat.supplier && stat.supplier._id) {
              monthlyStats[stat.supplier._id] = stat.visitCount;
            }
          });
        }
      } catch (error) {
        console.warn('Failed to fetch monthly stats:', error.message);
        monthlyStats = {};
      }

      console.log('Final data:', { 
        suppliers: suppliers.length, 
        personnel: personnel.length, 
        schedules: schedules.length, 
        activeLogs: activeLogs.length,
        monthlyStats: Object.keys(monthlyStats).length
      });

      return {
        suppliers: Array.isArray(suppliers) ? suppliers : [],
        personnel: Array.isArray(personnel) ? personnel : [],
        schedules: Array.isArray(schedules) ? schedules : [],
        activeLogs: Array.isArray(activeLogs) ? activeLogs : [],
        monthlyStats: monthlyStats || {}
      };
    } catch (error) {
      console.error('Error fetching access data:', error);
      // Return empty arrays to prevent undefined errors
      return {
        suppliers: [],
        personnel: [],
        schedules: [],
        activeLogs: [],
        monthlyStats: {}
      };
    }
  },

  // Check if person is currently checked in
  isPersonCheckedIn: async (personId, personType) => {
    try {
      const activeLogsResponse = await logAPI.getActive();
      const activeLogs = activeLogsResponse.data || [];
      
      return activeLogs.some(log => 
        log.person._id === personId && 
        log.personType === personType
      );
    } catch (error) {
      console.error('Error checking person status:', error);
      return false;
    }
  },

  // Get person's current status and last log
  getPersonStatus: async (personId, personType) => {
    try {
      const [activeLogsResponse, personLogsResponse] = await Promise.all([
        logAPI.getActive(),
        logAPI.getByPerson(personId, { limit: 1 })
      ]);
      
      const activeLogs = activeLogsResponse.data || [];
      const personLogs = personLogsResponse.data || [];
      
      const isActive = activeLogs.some(log => 
        log.person._id === personId && 
        log.personType === personType
      );
      
      const lastLog = personLogs.length > 0 ? personLogs[0] : null;
      
      return {
        isCurrentlyInside: isActive,
        lastEntry: lastLog,
        canCheckIn: !isActive,
        canCheckOut: isActive
      };
    } catch (error) {
      console.error('Error getting person status:', error);
      return {
        isCurrentlyInside: false,
        lastEntry: null,
        canCheckIn: true,
        canCheckOut: false
      };
    }
  }
};

// Export default object with all APIs
export default {
  supplier: supplierAPI,
  schedule: scheduleAPI,
  log: logAPI,
  personnel: personnelAPI,
  access: accessAPI
};