import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s — ARIMA prediction can take time
});

export const apiClient = {
  // Get current data
  getCurrentData: () => api.get('/current-data'),

  // Get predicted values
  getPredictions: () => api.get('/predictions'),
  
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
