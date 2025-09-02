import api from './api';

export const productService = {
  // Get all products
  getAllProducts: async () => {
    const response = await api.get('/Product');
    return response.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await api.get(`/Product/${id}`);
    return response.data;
  },

  // Create product (Admin only)
  createProduct: async (productData) => {
    const response = await api.post('/Product', productData);
    return response.data;
  },

  // Update product (Admin only)
  updateProduct: async (id, productData) => {
    const response = await api.put(`/Product/${id}`, productData);
    return response.data;
  },

  // Delete product (Admin only)
  deleteProduct: async (id) => {
    const response = await api.delete(`/Product/${id}`);
    return response.data;
  },
};