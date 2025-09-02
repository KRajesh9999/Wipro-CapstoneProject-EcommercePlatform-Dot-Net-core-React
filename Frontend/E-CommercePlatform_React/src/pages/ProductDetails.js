import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { addToCartLocal } from '../redux/slices/cartSlice';
import Loading from '../components/Loading';


const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);



  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await productService.getProductById(id);
        setProduct(productData);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        alert('Product not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await cartService.addToCart(product.id, quantity);
      dispatch(addToCartLocal({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: quantity,
        subtotal: product.price * quantity
      }));
      alert('Product added to cart!');
    } catch (error) {
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <Loading />;
  if (!product) return <div>Product not found</div>;



  return (
    <div className="mt-2">
      <button 
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <img 
              src={product.imageUrl || `https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&h=500&fit=crop&auto=format`} 
              alt={product.name}
              className="card-img-top"
              style={{ height: '500px', objectFit: 'contain', padding: '20px', backgroundColor: '#f8f9fa' }}
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/500x500/f8f9fa/6c757d?text=${encodeURIComponent(product.name)}`;
              }}
            />
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <button className="btn btn-link p-0" onClick={() => navigate('/')}>
                      Home
                    </button>
                  </li>
                  <li className="breadcrumb-item active">{product.name}</li>
                </ol>
              </nav>
              
              <h1 className="card-title">{product.name}</h1>
              <p className="text-muted mb-3">Category: {product.category}</p>
              
              <div className="mb-4">
                <h3 className="text-primary">${product.price}</h3>
                <p className="text-success">
                  <strong>In Stock:</strong> {product.stock} items available
                </p>
              </div>
              
              <div className="mb-4">
                <h5>Description</h5>
                <p>{product.description || 'No description available.'}</p>
              </div>
              
              <div className="mb-4">
                <h5>Product Features</h5>
                <ul>
                  <li>High quality materials</li>
                  <li>Fast shipping available</li>
                  <li>30-day return policy</li>
                  <li>Customer support included</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <label className="form-label">Quantity:</label>
                <div className="d-flex align-items-center">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    className="form-control mx-2" 
                    style={{ width: '80px' }}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={product.stock}
                  />
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-primary btn-lg flex-grow-1"
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                >
                  {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
                </button>
                <button 
                  className="btn btn-outline-secondary btn-lg"
                  onClick={() => navigate(-1)}
                >
                  ← Back
                </button>
              </div>
              
              {product.stock === 0 && (
                <div className="alert alert-warning mt-3">
                  This product is currently out of stock.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Information & Reviews */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs" role="tablist">
                <li className="nav-item">
                  <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#specifications">
                    <i className="fas fa-info-circle me-2"></i>Specifications
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-link" data-bs-toggle="tab" data-bs-target="#reviews">
                    <i className="fas fa-star me-2"></i>Reviews (12)
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-link" data-bs-toggle="tab" data-bs-target="#shipping">
                    <i className="fas fa-truck me-2"></i>Shipping & Returns
                  </button>
                </li>
              </ul>
            </div>
            <div className="card-body">
              <div className="tab-content">
                {/* Specifications Tab */}
                <div className="tab-pane fade show active" id="specifications">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Product Details</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Product ID:</strong></td>
                            <td>{product.id}</td>
                          </tr>
                          <tr>
                            <td><strong>Category:</strong></td>
                            <td>{product.category}</td>
                          </tr>
                          <tr>
                            <td><strong>Stock:</strong></td>
                            <td>{product.stock} units</td>
                          </tr>
                          <tr>
                            <td><strong>Added:</strong></td>
                            <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6>Features</h6>
                      <ul className="list-unstyled">
                        <li><i className="fas fa-check text-success me-2"></i>Premium quality materials</li>
                        <li><i className="fas fa-check text-success me-2"></i>Durable construction</li>
                        <li><i className="fas fa-check text-success me-2"></i>Easy to use</li>
                        <li><i className="fas fa-check text-success me-2"></i>Eco-friendly packaging</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Reviews Tab */}
                <div className="tab-pane fade" id="reviews">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="text-center p-4 bg-light rounded">
                        <h2 className="display-4 text-warning mb-0">4.5</h2>
                        <div className="text-warning mb-2">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star-half-alt"></i>
                        </div>
                        <p className="text-muted mb-0">Based on 12 reviews</p>
                      </div>
                      
                      <div className="mt-3">
                        <div className="d-flex align-items-center mb-1">
                          <span className="me-2">5</span>
                          <i className="fas fa-star text-warning me-2"></i>
                          <div className="progress flex-grow-1 me-2" style={{height: '8px'}}>
                            <div className="progress-bar bg-warning" style={{width: '70%'}}></div>
                          </div>
                          <span className="text-muted">8</span>
                        </div>
                        <div className="d-flex align-items-center mb-1">
                          <span className="me-2">4</span>
                          <i className="fas fa-star text-warning me-2"></i>
                          <div className="progress flex-grow-1 me-2" style={{height: '8px'}}>
                            <div className="progress-bar bg-warning" style={{width: '20%'}}></div>
                          </div>
                          <span className="text-muted">3</span>
                        </div>
                        <div className="d-flex align-items-center mb-1">
                          <span className="me-2">3</span>
                          <i className="fas fa-star text-warning me-2"></i>
                          <div className="progress flex-grow-1 me-2" style={{height: '8px'}}>
                            <div className="progress-bar bg-warning" style={{width: '8%'}}></div>
                          </div>
                          <span className="text-muted">1</span>
                        </div>
                        <div className="d-flex align-items-center mb-1">
                          <span className="me-2">2</span>
                          <i className="fas fa-star text-warning me-2"></i>
                          <div className="progress flex-grow-1 me-2" style={{height: '8px'}}>
                            <div className="progress-bar bg-warning" style={{width: '0%'}}></div>
                          </div>
                          <span className="text-muted">0</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <span className="me-2">1</span>
                          <i className="fas fa-star text-warning me-2"></i>
                          <div className="progress flex-grow-1 me-2" style={{height: '8px'}}>
                            <div className="progress-bar bg-warning" style={{width: '0%'}}></div>
                          </div>
                          <span className="text-muted">0</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-8">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6>Customer Reviews</h6>
                        {isAuthenticated && (
                          <button className="btn btn-primary btn-sm">
                            <i className="fas fa-plus me-2"></i>Write Review
                          </button>
                        )}
                      </div>
                      
                      {/* Sample Reviews */}
                      <div className="review-item border-bottom pb-3 mb-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <strong>John D.</strong>
                            <div className="text-warning">
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                            </div>
                          </div>
                          <small className="text-muted">2 days ago</small>
                        </div>
                        <p className="mb-0">"Excellent product! Great quality and fast shipping. Highly recommended!"</p>
                      </div>
                      
                      <div className="review-item border-bottom pb-3 mb-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <strong>Sarah M.</strong>
                            <div className="text-warning">
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                              <i className="far fa-star"></i>
                            </div>
                          </div>
                          <small className="text-muted">1 week ago</small>
                        </div>
                        <p className="mb-0">"Good value for money. Works as expected. Delivery was quick."</p>
                      </div>
                      
                      <div className="review-item">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <strong>Mike R.</strong>
                            <div className="text-warning">
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                            </div>
                          </div>
                          <small className="text-muted">2 weeks ago</small>
                        </div>
                        <p className="mb-0">"Amazing product! Exceeded my expectations. Will definitely buy again."</p>
                      </div>
                      
                      <div className="text-center mt-3">
                        <button className="btn btn-outline-primary">
                          <i className="fas fa-chevron-down me-2"></i>Load More Reviews
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Shipping Tab */}
                <div className="tab-pane fade" id="shipping">
                  <div className="row">
                    <div className="col-md-6">
                      <h6><i className="fas fa-truck text-primary me-2"></i>Shipping Information</h6>
                      <ul className="list-unstyled">
                        <li className="mb-2"><i className="fas fa-check text-success me-2"></i>Free shipping on orders over $50</li>
                        <li className="mb-2"><i className="fas fa-check text-success me-2"></i>Standard delivery: 3-5 business days</li>
                        <li className="mb-2"><i className="fas fa-check text-success me-2"></i>Express delivery: 1-2 business days</li>
                        <li className="mb-2"><i className="fas fa-check text-success me-2"></i>International shipping available</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h6><i className="fas fa-undo text-primary me-2"></i>Returns & Warranty</h6>
                      <ul className="list-unstyled">
                        <li className="mb-2"><i className="fas fa-check text-success me-2"></i>30-day return policy</li>
                        <li className="mb-2"><i className="fas fa-check text-success me-2"></i>1-year manufacturer warranty</li>
                        <li className="mb-2"><i className="fas fa-check text-success me-2"></i>Free return shipping</li>
                        <li className="mb-2"><i className="fas fa-check text-success me-2"></i>24/7 customer support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;