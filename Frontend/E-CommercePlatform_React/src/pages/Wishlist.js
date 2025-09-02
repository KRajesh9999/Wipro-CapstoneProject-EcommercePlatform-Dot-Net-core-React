import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromWishlist } from '../redux/slices/wishlistSlice';
import { addToCartLocal } from '../redux/slices/cartSlice';
import { cartService } from '../services/cartService';

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector(state => state.wishlist);
  const { isAuthenticated } = useSelector(state => state.auth);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      await cartService.addToCart(product.id, 1);
      dispatch(addToCartLocal({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        subtotal: product.price,
        imageUrl: product.imageUrl
      }));
      alert('Item added to cart!');
    } catch (error) {
      alert('Failed to add item to cart');
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          <i className="fas fa-heart text-danger me-2"></i>
          My Wishlist
        </h2>
        <button className="btn btn-outline-primary" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left me-2"></i>Continue Shopping
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-heart fa-4x text-muted mb-3"></i>
          <h4 className="text-muted">Your wishlist is empty</h4>
          <p className="text-muted">Save items you love for later!</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
            <i className="fas fa-shopping-bag me-2"></i>Start Shopping
          </button>
        </div>
      ) : (
        <div className="row">
          {items.map(product => (
            <div key={product.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
              <div className="card h-100">
                <div className="position-relative">
                  <img 
                    src={product.imageUrl || `https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&h=250&fit=crop&auto=format`}
                    className="card-img-top"
                    alt={product.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                  <button 
                    className="btn btn-danger position-absolute"
                    style={{ 
                      top: '10px', 
                      right: '10px', 
                      width: '35px', 
                      height: '35px', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      zIndex: 10
                    }}
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    title="Remove from wishlist"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title">{product.name}</h6>
                  <p className="card-text text-muted small flex-grow-1">
                    {product.description?.substring(0, 60)}...
                  </p>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="h6 text-primary fw-bold">${product.price}</span>
                    <small className="text-muted">{product.stock} left</small>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <i className="fas fa-cart-plus me-2"></i>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;