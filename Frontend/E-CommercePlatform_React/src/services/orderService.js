import api from './api';

export const orderService = {
  // Create order
  createOrder: async (shippingAddress, items) => {
    const response = await api.post('/Order', { shippingAddress, items });
    return response.data;
  },

  // Get user orders with product details
  getUserOrders: async () => {
    const response = await api.get('/Order');
    const orders = response.data;
    
    // Fetch product details for each order item
    for (let order of orders) {
      if (order.orderItems) {
        for (let item of order.orderItems) {
          try {
            const productResponse = await api.get(`/Product/${item.productId}`);
            item.productName = productResponse.data.name;
            item.productImage = productResponse.data.imageUrl;
            item.productDescription = productResponse.data.description;
          } catch (error) {
            console.error(`Failed to fetch product ${item.productId}:`, error);
            item.productName = `Product #${item.productId}`;
            item.productImage = 'https://via.placeholder.com/100x100';
          }
        }
      }
    }
    
    return orders;
  },

  // Get order by ID with product details
  getOrderById: async (id) => {
    const response = await api.get(`/Order/${id}`);
    const order = response.data;
    
    // Fetch product details for order items
    if (order.orderItems) {
      for (let item of order.orderItems) {
        try {
          const productResponse = await api.get(`/Product/${item.productId}`);
          item.productName = productResponse.data.name;
          item.productImage = productResponse.data.imageUrl;
          item.productDescription = productResponse.data.description;
        } catch (error) {
          console.error(`Failed to fetch product ${item.productId}:`, error);
          item.productName = `Product #${item.productId}`;
          item.productImage = 'https://via.placeholder.com/100x100';
        }
      }
    }
    
    return order;
  },

  // Get all orders (Admin only) with product details
  getAllOrders: async () => {
    const response = await api.get('/Order/admin/all');
    const orders = response.data;
    
    // Fetch product details for each order item
    for (let order of orders) {
      if (order.orderItems) {
        for (let item of order.orderItems) {
          try {
            const productResponse = await api.get(`/Product/${item.productId}`);
            item.productName = productResponse.data.name;
            item.productImage = productResponse.data.imageUrl;
          } catch (error) {
            console.error(`Failed to fetch product ${item.productId}:`, error);
            item.productName = `Product #${item.productId}`;
            item.productImage = 'https://via.placeholder.com/100x100';
          }
        }
      }
    }
    
    return orders;
  },

  // Update order status (Admin only)
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/Order/${id}/status`, status);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id) => {
    const response = await api.put(`/Order/${id}/cancel`);
    return response.data;
  },
};