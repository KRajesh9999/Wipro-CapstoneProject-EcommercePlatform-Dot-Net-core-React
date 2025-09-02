import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/cartService';
import { addToCartLocal } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  const wishlistItems = useSelector(state => state.wishlist.items);
  const isInWishlist = wishlistItems.some(item => item.id === product.id);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [quantity, setQuantity] = useState(0);


  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (quantity === 0) {
      setQuantity(1);
      return;
    }

    setIsAdding(true);
    try {
      await cartService.addToCart(product.id, quantity);
      dispatch(addToCartLocal({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: quantity,
        subtotal: product.price * quantity,
        imageUrl: product.imageUrl || product.ImageUrl
      }));
      
      alert(`${quantity} item(s) added to cart!`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      alert('Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  const handleProductClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/product/${product.id}`);
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
      <div className="card h-100 product-card" onClick={handleProductClick}>
        <div className="position-relative overflow-hidden">
          <img 
            src={product.imageUrl || product.ImageUrl || `https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&h=250&fit=crop&auto=format`} 
            className="card-img-top product-image" 
            alt={product.name}
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/300x250/f8f9fa/6c757d?text=${encodeURIComponent(product.name)}`;
            }}
          />
          {product.stock === 0 && (
            <div className="position-absolute top-0 end-0 m-2">
              <span className="badge bg-danger">Out of Stock</span>
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="position-absolute top-0 end-0 m-2">
              <span className="badge bg-warning text-dark">Low Stock</span>
            </div>
          )}
          <button 
            className={`btn position-absolute wishlist-btn ${isInWishlist ? 'text-danger' : 'text-muted'}`}
            onClick={handleWishlistToggle}
            style={{ top: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '35px', height: '35px' }}
          >
            <i className={`fas fa-heart ${isInWishlist ? '' : 'far'}`}></i>
          </button>
        </div>
        
        <div className="card-body d-flex flex-column">
          <div className="mb-2">
            <span className="badge bg-light text-dark border">{product.category}</span>
          </div>
          
          <h5 className="card-title fw-bold text-truncate" title={product.name}>
            {product.name}
          </h5>
          
          <p className="card-text text-muted small flex-grow-1">
            {truncateText(product.description, 80)}
          </p>
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className="h5 text-primary fw-bold mb-0">${product.price}</span>
            </div>
            <small className="text-muted">
              <i className="fas fa-box me-1"></i>{product.stock} left
            </small>
          </div>
          
          {product.stock > 0 && (
            <div className="d-flex align-items-center mb-2">
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(Math.max(0, quantity - 1));
                }}
                disabled={quantity <= 0}
              >
                -
              </button>
              <span className="mx-3 fw-bold">{quantity}</span>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(Math.min(product.stock, quantity + 1));
                }}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          )}
          
          <button 
            className={`btn w-100 ${showSuccess ? 'btn-success' : 'btn-primary'} position-relative`}
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdding || (quantity === 0 && product.stock === 0)}
          >
            {isAdding ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Adding...
              </>
            ) : showSuccess ? (
              <>
                <i className="fas fa-check me-2"></i>
                Added to Cart!
              </>
            ) : product.stock === 0 ? (
              <>
                <i className="fas fa-times me-2"></i>
                Out of Stock
              </>
            ) : quantity === 0 ? (
              <>
                <i className="fas fa-cart-plus me-2"></i>
                Add to Cart
              </>
            ) : (
              <>
                <i className="fas fa-cart-plus me-2"></i>
                Add {quantity} to Cart
              </>
            )}
          </button>
        </div>
      </div>
      

      

    </div>
  );
};

export default ProductCard;