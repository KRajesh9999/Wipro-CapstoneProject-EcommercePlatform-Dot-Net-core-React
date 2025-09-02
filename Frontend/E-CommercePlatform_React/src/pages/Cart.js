import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/cartService';
import { setCart, updateCartItemLocal, removeFromCartLocal } from '../redux/slices/cartSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount } = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchCart = async () => {
      try {
        const cartData = await cartService.getCart();
        dispatch(setCart(cartData));
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      }
    };

    fetchCart();
  }, [dispatch, isAuthenticated, navigate]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Update UI immediately
    dispatch(updateCartItemLocal({ productId, quantity: newQuantity }));
    
    try {
      await cartService.updateCartItem(productId, newQuantity);
    } catch (error) {
      alert('Failed to update quantity');
      // Refresh cart to revert changes on error
      const cartData = await cartService.getCart();
      dispatch(setCart(cartData));
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await cartService.removeFromCart(productId);
      dispatch(removeFromCartLocal(productId));
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          <i className="fas fa-shopping-cart text-primary me-2"></i>
          Shopping Cart
        </h2>
        <button className="btn btn-outline-primary" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left me-2"></i>Continue Shopping
        </button>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
            <h4 className="text-muted">Your cart is empty</h4>
            <p className="text-muted">Looks like you haven't added any items to your cart yet.</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
            <i className="fas fa-shopping-bag me-2"></i>Start Shopping
          </button>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="fas fa-list me-2"></i>
                  Cart Items ({items.length})
                </h5>
              </div>
              <div className="card-body p-0">
                {items.map((item, index) => (
                  <div key={item.productId} className={`p-4 ${index !== items.length - 1 ? 'border-bottom' : ''}`}>
                    <div className="row align-items-center">
                      <div className="col-md-2">
                        <img 
                          src={item.imageUrl || `https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100&h=100&fit=crop&auto=format`}
                          alt={item.productName}
                          className="img-fluid rounded"
                          style={{width: '80px', height: '80px', objectFit: 'cover'}}
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/100x100/f8f9fa/6c757d?text=${encodeURIComponent(item.productName.substring(0, 2))}`;
                          }}
                        />
                      </div>
                      <div className="col-md-4">
                        <h6 className="fw-bold mb-1">{item.productName}</h6>
                        <p className="text-muted mb-0">
                          <i className="fas fa-tag me-1"></i>
                          ${item.price} each
                        </p>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small text-muted">Quantity</label>
                        <div className="d-flex align-items-center">
                          <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <i className="fas fa-minus"></i>
                          </button>
                          <span className="mx-3 fw-bold">{item.quantity}</span>
                          <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="text-end">
                          <p className="fw-bold text-primary mb-2">${item.subtotal}</p>
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleRemoveItem(item.productId)}
                            title="Remove item"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card shadow-sm sticky-top" style={{top: '100px'}}>
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-calculator me-2"></i>
                  Order Summary
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal ({items.length} items):</span>
                  <span>${totalAmount}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span className="text-success">Free</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax:</span>
                  <span>${(totalAmount * 0.08).toFixed(2)}</span>
                </div>
                <hr/>
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total:</strong>
                  <strong className="text-primary">${(totalAmount * 1.08).toFixed(2)}</strong>
                </div>
                
                <button 
                  className="btn btn-success w-100 btn-lg mb-3" 
                  onClick={handleCheckout}
                >
                  <i className="fas fa-credit-card me-2"></i>
                  Proceed to Checkout
                </button>
                
                <div className="text-center">
                  <small className="text-muted">
                    <i className="fas fa-shield-alt me-1"></i>
                    Secure checkout with SSL encryption
                  </small>
                </div>
              </div>
            </div>
            
            {/* Promo Code Section */}
            <div className="card shadow-sm mt-3">
              <div className="card-body">
                <h6 className="card-title">
                  <i className="fas fa-percent me-2"></i>
                  Promo Code
                </h6>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter promo code"
                  />
                  <button className="btn btn-outline-primary">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;