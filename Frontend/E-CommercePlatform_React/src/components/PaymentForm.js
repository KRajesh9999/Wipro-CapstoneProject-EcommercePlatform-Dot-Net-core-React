import React, { useState } from 'react';
import { paymentService } from '../services/paymentService';

const PaymentForm = ({ amount, onPaymentSuccess, onPaymentError }) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardholderName: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real implementation, you would use Stripe Elements
      // This is a simplified version for demonstration
      const paymentPayload = {
        amount: amount,
        paymentToken: `pm_card_${Date.now()}`, // Mock payment method
        currency: 'usd',
        description: `Payment for order - $${amount}`
      };

      const result = await paymentService.processPayment(paymentPayload);
      
      if (result.success) {
        onPaymentSuccess(result);
      } else {
        onPaymentError(result.message);
      }
    } catch (error) {
      onPaymentError(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form">
      <h4 className="mb-3">Payment Information</h4>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12 mb-3">
            <label className="form-label">Cardholder Name</label>
            <input
              type="text"
              className="form-control"
              name="cardholderName"
              value={paymentData.cardholderName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="col-12 mb-3">
            <label className="form-label">Card Number</label>
            <input
              type="text"
              className="form-control"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={paymentData.cardNumber}
              onChange={handleInputChange}
              maxLength="19"
              required
            />
          </div>
          
          <div className="col-6 mb-3">
            <label className="form-label">Expiry Month</label>
            <select
              className="form-select"
              name="expiryMonth"
              value={paymentData.expiryMonth}
              onChange={handleInputChange}
              required
            >
              <option value="">Month</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                  {String(i + 1).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-6 mb-3">
            <label className="form-label">Expiry Year</label>
            <select
              className="form-select"
              name="expiryYear"
              value={paymentData.expiryYear}
              onChange={handleInputChange}
              required
            >
              <option value="">Year</option>
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
          
          <div className="col-12 mb-3">
            <label className="form-label">CVC</label>
            <input
              type="text"
              className="form-control"
              name="cvc"
              placeholder="123"
              value={paymentData.cvc}
              onChange={handleInputChange}
              maxLength="4"
              required
            />
          </div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <div className="payment-amount">
            <strong>Total: ${amount}</strong>
          </div>
          <button
            type="submit"
            className="btn btn-success btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-credit-card me-2"></i>
                Pay ${amount}
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-3 text-center">
        <small className="text-muted">
          <i className="fas fa-lock me-1"></i>
          Your payment information is secure and encrypted
        </small>
      </div>
    </div>
  );
};

export default PaymentForm;