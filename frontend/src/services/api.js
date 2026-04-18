import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const apiClient = {
  // Get current data
  getCurrentData: () => api.get('/current-data'),
  
  // Get historical data
  getDataHistory: (count = 20) => api.get(`/data-history/${count}`),
  
  // Get all data with pagination
  getAllData: (skip = 0, limit = 1000) => api.get('/all-data', {
    params: { skip, limit }
  }),
  
  // Get alerts
  getAlerts: () => api.get('/alerts'),
  
  // Get control output
  getControlOutput: () => api.get('/control-output'),
  
  // Run fuzzy control with parameters
  runFuzzyControl: (co2, pm25, humidity, occupancy, applyControl = false) => 
    api.post('/fuzzy-control', null, {
      params: { co2, pm25, humidity, occupancy, apply_control: applyControl }
    }),
  
  // Get system info
  getSystemInfo: () => api.get('/system-info'),
  
  // Health check
  healthCheck: () => api.get('/health'),
};

export default api;
