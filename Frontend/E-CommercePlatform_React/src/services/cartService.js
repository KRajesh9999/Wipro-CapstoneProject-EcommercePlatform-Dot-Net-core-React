import api from './api';

export const cartService = {
  // Get user cart
  getCart: async () => {
    const response = await api.get('/Cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (productId, quantity) => {
    const response = await api.post('/Cart/add', { productId, quantity });
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (productId, quantity) => {
    const response = await api.put(`/Cart/update/${productId}`, quantity);
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    const response = await api.delete(`/Cart/remove/${productId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete('/Cart/clear');
    return response.data;
  },
};