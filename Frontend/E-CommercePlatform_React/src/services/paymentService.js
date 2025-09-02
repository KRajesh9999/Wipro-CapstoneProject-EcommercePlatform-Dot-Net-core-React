import axios from 'axios';

const API_BASE_URL = 'http://localhost:5165/api';

// Create axios instance with auth token
const createAuthenticatedRequest = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
};

export const paymentService = {
  // Process payment
  processPayment: async (paymentData) => {
    const api = createAuthenticatedRequest();
    const response = await api.post('/Payment/process', paymentData);
    return response.data;
  },

  // Create payment intent (for Stripe)
  createPaymentIntent: async (amount) => {
    const api = createAuthenticatedRequest();
    const response = await api.post('/Payment/create-intent', { amount });
    return response.data;
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId) => {
    const api = createAuthenticatedRequest();
    const response = await api.post('/Payment/confirm', { paymentIntentId });
    return response.data;
  }
};