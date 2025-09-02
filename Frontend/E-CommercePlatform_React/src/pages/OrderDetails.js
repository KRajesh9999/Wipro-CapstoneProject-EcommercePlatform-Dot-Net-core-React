import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { orderService } from '../services/orderService';
import Loading from '../components/Loading';

const OrderDetails = () => {
  const { orderId } = useParams();
  const { isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error('Failed to fetch order details:', error);
        alert('Order not found');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, isAuthenticated, navigate]);

  const getTrackingSteps = (currentStatus) => {
    const steps = [
      { status: 'Pending', label: 'Order Placed', icon: '📝' },
      { status: 'Processing', label: 'Processing', icon: '⚙️' },
      { status: 'Shipped', label: 'Shipped', icon: '🚚' },
      { status: 'Delivered', label: 'Delivered', icon: '📦' }
    ];

    const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
      date: index <= currentIndex ? new Date().toLocaleDateString() : null,
      time: index <= currentIndex ? new Date().toLocaleTimeString() : null
    }));
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await orderService.updateOrderStatus(order.id, 'Cancelled');
      setOrder({ ...order, status: 'Cancelled' });
      alert('Order cancelled successfully!');
    } catch (error) {
      alert('Failed to cancel order: ' + error.message);
    }
  };

  const handleReturnOrder = async () => {
    if (!window.confirm('Are you sure you want to return this order?')) {
      return;
    }

    try {
      await orderService.updateOrderStatus(order.id, 'Return Requested');
      setOrder({ ...order, status: 'Return Requested' });
      alert('Return request submitted successfully!');
    } catch (error) {
      alert('Failed to submit return request: ' + error.message);
    }
  };

  if (!isAuthenticated) return null;
  if (loading) return <Loading />;
  if (!order) return <div>Order not found</div>;

  const trackingSteps = getTrackingSteps(order.status);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Details</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/orders')}>
          Back to Orders
        </button>
      </div>

      <div className="row">
        <div className="col-md-8">
          {/* Order Information */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between">
              <h5>Order #{order.id}</h5>
              <span className={`badge ${
                order.status === 'Pending' ? 'bg-warning' :
                order.status === 'Processing' ? 'bg-info' :
                order.status === 'Shipped' ? 'bg-primary' :
                order.status === 'Delivered' ? 'bg-success' :
                order.status === 'Cancelled' ? 'bg-danger' :
                order.status === 'Return Requested' ? 'bg-warning' : 'bg-secondary'
              }`}>
                {order.status}
              </span>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p><strong>Total Amount:</strong> ${order.totalAmount}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Shipping Address:</strong></p>
                  <p>{order.shippingAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Tracking */}
          {order.status !== 'Cancelled' && order.status !== 'Return Requested' && (
            <div className="card mb-4">
              <div className="card-header">
                <h5>📍 Order Tracking</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {trackingSteps.map((step, index) => (
                    <div key={step.status} className="col-3 text-center">
                      <div className={`mb-2 ${step.completed ? 'text-success' : 'text-muted'}`}>
                        <div style={{ fontSize: '2rem' }}>{step.icon}</div>
                        <div className={`badge ${step.completed ? 'bg-success' : 'bg-light text-dark'}`}>
                          {step.label}
                        </div>
                      </div>
                      {step.completed && (
                        <div className="small text-muted">
                          <div>{step.date}</div>
                          <div>{step.time}</div>
                        </div>
                      )}
                      {index < trackingSteps.length - 1 && (
                        <div className={`border-top mt-2 ${step.completed ? 'border-success' : 'border-light'}`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="card">
            <div className="card-header">
              <h5>Order Items</h5>
            </div>
            <div className="card-body">
              {order.orderItems && order.orderItems.map(item => (
                <div key={item.id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                  <img 
                    src={item.productImage || 'https://via.placeholder.com/80x80'} 
                    alt={item.productName}
                    className="me-4 rounded"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.productName || `Product #${item.productId}`}</h6>
                    <p className="text-muted mb-1">Price: ${item.price}</p>
                    <p className="mb-0">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-end">
                    <h5 className="mb-0 text-primary">${(item.price * item.quantity).toFixed(2)}</h5>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          {/* Order Actions */}
          <div className="card">
            <div className="card-header">
              <h5>Order Actions</h5>
            </div>
            <div className="card-body">
              {/* Cancel Order */}
              {(order.status === 'Pending' || order.status === 'Processing') && (
                <button 
                  className="btn btn-danger w-100 mb-2"
                  onClick={handleCancelOrder}
                >
                  Cancel Order
                </button>
              )}
              
              {/* Return Order */}
              {order.status === 'Delivered' && (
                <button 
                  className="btn btn-warning w-100 mb-2"
                  onClick={handleReturnOrder}
                >
                  Return Order
                </button>
              )}

              {/* Download Invoice */}
              <button className="btn btn-outline-primary w-100 mb-2">
                Download Invoice
              </button>

              {/* Contact Support */}
              <button className="btn btn-outline-secondary w-100">
                Contact Support
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card mt-3">
            <div className="card-header">
              <h5>Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <span>Subtotal:</span>
                <span>${order.totalAmount}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Tax:</span>
                <span>$0.00</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong>${order.totalAmount}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;