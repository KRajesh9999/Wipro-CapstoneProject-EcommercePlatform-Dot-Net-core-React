import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import Loading from '../components/Loading';

const Orders = () => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const userOrders = await orderService.getUserOrders();
        setOrders(userOrders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancellingOrder(orderId);
    try {
      await orderService.cancelOrder(orderId);
      // Refresh orders
      const userOrders = await orderService.getUserOrders();
      setOrders(userOrders);
      alert('Order cancelled successfully!');
    } catch (error) {
      alert('Failed to cancel order: ' + error.message);
    } finally {
      setCancellingOrder(null);
    }
  };

  const handleReturnOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to return this order?')) {
      return;
    }

    try {
      await orderService.updateOrderStatus(orderId, 'Return Requested');
      // Refresh orders
      const userOrders = await orderService.getUserOrders();
      setOrders(userOrders);
      alert('Return request submitted successfully! We will contact you soon.');
    } catch (error) {
      alert('Failed to submit return request: ' + error.message);
    }
  };

  if (!isAuthenticated) return null;
  if (loading) return <Loading />;

  return (
    <div className="container mt-4">
      <h2>My Orders</h2>
      
      {orders.length === 0 ? (
        <div className="text-center mt-5">
          <p>You haven't placed any orders yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="row">
          {orders.map(order => (
            <div key={order.id} className="col-12 mb-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5>Order #{order.id}</h5>
                  <span className={`badge ${
                    order.status === 'Pending' ? 'bg-warning' :
                    order.status === 'Processing' ? 'bg-info' :
                    order.status === 'Shipped' ? 'bg-primary' :
                    order.status === 'Delivered' ? 'bg-success' : 'bg-secondary'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                      <p><strong>Total Amount:</strong> ${order.totalAmount}</p>
                      <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                    </div>
                    <div className="col-md-6">
                      <h6>Items:</h6>
                      {order.orderItems && order.orderItems.map(item => (
                        <div key={item.id} className="d-flex align-items-center mb-2 p-2 bg-light rounded">
                          <img 
                            src={item.productImage || 'https://via.placeholder.com/50x50'} 
                            alt={item.productName}
                            className="me-3 rounded"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                          <div className="flex-grow-1">
                            <div className="fw-medium" style={{ fontSize: '0.9rem' }}>{item.productName || `Product #${item.productId}`}</div>
                            <small className="text-muted">Qty: {item.quantity} × ${item.price}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-3 d-flex gap-2">
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => navigate(`/order/${order.id}`)}
                    >
                      View Details
                    </button>
                    
                    {/* Cancel Order - Only for Pending/Processing orders */}
                    {(order.status === 'Pending' || order.status === 'Processing') && (
                      <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrder === order.id}
                      >
                        {cancellingOrder === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                    
                    {/* Return Order - Only for Delivered orders */}
                    {order.status === 'Delivered' && (
                      <button 
                        className="btn btn-outline-warning btn-sm"
                        onClick={() => handleReturnOrder(order.id)}
                      >
                        Return Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;