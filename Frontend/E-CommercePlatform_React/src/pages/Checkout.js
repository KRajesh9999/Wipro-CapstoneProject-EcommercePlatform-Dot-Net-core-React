import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { clearCartLocal } from '../redux/slices/cartSlice';

const Checkout = () => {
  const { items, totalAmount } = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      alert('Please enter shipping address');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const order = await orderService.createOrder(shippingAddress, orderItems);
      // Don't clear cart yet - clear after payment
      
      // Navigate to payment page with order details
      navigate('/payment', { 
        state: { 
          orderId: order.id, 
          amount: totalAmount,
          orderDetails: order 
        } 
      });
    } catch (error) {
      alert('Failed to create order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Checkout</h2>
      
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5>Order Summary</h5>
            </div>
            <div className="card-body">
              {items.map(item => (
                <div key={item.productId} className="row mb-2">
                  <div className="col-6">{item.productName}</div>
                  <div className="col-2">Qty: {item.quantity}</div>
                  <div className="col-2">${item.price}</div>
                  <div className="col-2">${item.subtotal}</div>
                </div>
              ))}
              <hr />
              <div className="row">
                <div className="col-8"><strong>Total:</strong></div>
                <div className="col-4"><strong>${totalAmount}</strong></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5>Shipping Information</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handlePlaceOrder}>
                <div className="mb-3">
                  <label className="form-label">Shipping Address *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your complete shipping address..."
                    required
                  />
                </div>
                
                <div className="d-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => navigate('/cart')}
                  >
                    Back to Cart
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Payment Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <span>Subtotal:</span>
                <span>${totalAmount}</span>
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
                <strong>${totalAmount}</strong>
              </div>
              <hr />
              <div className="text-center">
                <small className="text-muted">
                  💳 Payment will be processed on next page<br/>
                  🔒 Secure checkout with SSL encryption
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;