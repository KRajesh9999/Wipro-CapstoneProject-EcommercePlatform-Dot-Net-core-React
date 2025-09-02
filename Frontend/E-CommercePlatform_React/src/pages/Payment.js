import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCartLocal } from '../redux/slices/cartSlice';
import { cartService } from '../services/cartService';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { orderId, amount, orderDetails } = location.state || {};
  
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'CreditCard',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [loading, setLoading] = useState(false);

  if (!orderId) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Validate payment form
    if (paymentData.paymentMethod === 'CreditCard') {
      if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardName) {
        alert('Please fill all payment details');
        return;
      }
    }
    
    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show confirmation popup
      const confirmed = window.confirm(
        `🛒 Confirm Your Order\n\nOrder ID: #${orderId}\nAmount: $${amount}\nPayment Method: ${paymentData.paymentMethod}\n\nProceed with payment?`
      );
      
      if (!confirmed) {
        setLoading(false);
        return;
      }
      
      // Clear cart after successful payment
      try {
        await cartService.clearCart();
        dispatch(clearCartLocal());
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
      
      // Show success message
      const successMessage = `🎉 Payment Successful!\n\nOrder ID: #${orderId}\nAmount Paid: $${amount}\nPayment Method: ${paymentData.paymentMethod}\n\nYour order has been confirmed and will be processed shortly.`;
      alert(successMessage);
      
      // Navigate to orders page
      navigate('/orders');
    } catch (error) {
      alert('❌ Payment Failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Payment</h2>
      
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5>Payment Details</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handlePayment}>
                <div className="mb-3">
                  <label className="form-label">Payment Method</label>
                  <select 
                    className="form-select"
                    name="paymentMethod"
                    value={paymentData.paymentMethod}
                    onChange={handleInputChange}
                  >
                    <option value="CreditCard">Credit Card</option>
                    <option value="PayPal">PayPal</option>
                    <option value="DebitCard">Debit Card</option>
                  </select>
                </div>

                {paymentData.paymentMethod === 'CreditCard' && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Card Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="cardNumber"
                        value={paymentData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Expiry Date</label>
                          <input
                            type="text"
                            className="form-control"
                            name="expiryDate"
                            value={paymentData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">CVV</label>
                          <input
                            type="text"
                            className="form-control"
                            name="cvv"
                            value={paymentData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Cardholder Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="cardName"
                        value={paymentData.cardName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </>
                )}

                {paymentData.paymentMethod === 'PayPal' && (
                  <div className="text-center p-4">
                    <p>You will be redirected to PayPal to complete your payment.</p>
                    <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-200px.png" alt="PayPal" style={{height: '50px'}} />
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => navigate('/checkout')}
                  >
                    Back to Checkout
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? 'Processing Payment...' : `Pay $${amount}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Order Summary</h5>
            </div>
            <div className="card-body">
              <p><strong>Order ID:</strong> #{orderId}</p>
              <p><strong>Amount:</strong> ${amount}</p>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total to Pay:</strong>
                <strong>${amount}</strong>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-body text-center">
              <small className="text-muted">
                🔒 Your payment information is secure and encrypted
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;