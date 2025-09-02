import api from './api';

export const authService = {
  // User login
  login: async (email, password) => {
    const response = await api.post('/Auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // User registration
  register: async (username, email, password) => {
    const response = await api.post('/Auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current token
  getToken: () => {
    return localStorage.getItem('token');
  },
};