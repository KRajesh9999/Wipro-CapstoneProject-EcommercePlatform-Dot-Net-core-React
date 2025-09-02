import axios from 'axios';

// Base API configuration
// Check if running in Docker (frontend served from container)
const isDocker = window.location.port === '3000' && window.location.hostname === 'localhost';
const API_BASE_URL = isDocker 
  ? 'http://localhost:5165/api'    // Docker: backend exposed on host
  : 'https://localhost:7167/api';  // Local development

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token; // No Bearer prefix as per your backend
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;