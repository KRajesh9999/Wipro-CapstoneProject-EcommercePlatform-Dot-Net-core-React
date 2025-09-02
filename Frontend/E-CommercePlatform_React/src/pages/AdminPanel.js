import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import Loading from '../components/Loading';


const AdminPanel = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [products, setProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchAllOrders = async () => {
      try {
        const allOrders = await orderService.getAllOrders();
        setOrders(allOrders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        alert('Failed to load orders. Please login as admin.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const allProducts = await productService.getAllProducts();
        setProducts(allProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchAllOrders();
    fetchProducts();
  }, [isAuthenticated, navigate]);

  const showToast = (message, type = 'success') => {
    alert(message);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      showToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
    } catch (error) {
      showToast('Failed to update order status: ' + error.message, 'error');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Processing': return 'info';
      case 'Shipped': return 'primary';
      case 'Delivered': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending': return 'Processing';
      case 'Processing': return 'Shipped';
      case 'Shipped': return 'Delivered';
      default: return null;
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock)
      };
      
      await productService.createProduct(productData);
      
      // Refresh products list
      const allProducts = await productService.getAllProducts();
      setProducts(allProducts);
      
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        imageUrl: ''
      });
      setShowAddProduct(false);
      
      showToast('Product added successfully!', 'success');
    } catch (error) {
      showToast('Failed to add product: ' + error.message, 'error');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      imageUrl: product.imageUrl || ''
    });
    setShowAddProduct(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock)
      };
      
      await productService.updateProduct(editingProduct.id, productData);
      
      // Update local state
      setProducts(products.map(p => 
        p.id === editingProduct.id ? { ...p, ...productData } : p
      ));
      
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        imageUrl: ''
      });
      setEditingProduct(null);
      setShowAddProduct(false);
      
      showToast('Product updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update product: ' + error.message, 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        
        // Remove from local state
        setProducts(products.filter(p => p.id !== productId));
        
        showToast('Product deleted successfully!', 'success');
      } catch (error) {
        showToast('Failed to delete product: ' + error.message, 'error');
      }
    }
  };

  const getOrderStats = () => {
    const pending = orders.filter(o => o.status === 'Pending').length;
    const processing = orders.filter(o => o.status === 'Processing').length;
    const shipped = orders.filter(o => o.status === 'Shipped').length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    return { pending, processing, shipped, delivered, totalRevenue, total: orders.length };
  };

  if (!isAuthenticated) return null;
  if (loading) return <Loading />;

  const stats = getOrderStats();

  return (
    <div className="admin-dashboard">
      {/* Admin Sidebar */}
      <div className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="d-flex align-items-center">
            <div className="admin-logo">
              <i className="fas fa-shield-alt"></i>
            </div>
            {!sidebarCollapsed && (
              <div className="ms-3">
                <h5 className="mb-0 text-white">Admin Panel</h5>
                <small className="text-light opacity-75">Z-Mart Management</small>
              </div>
            )}
          </div>
          <button 
            className="btn btn-link text-white p-0"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <i className={`fas fa-${sidebarCollapsed ? 'chevron-right' : 'chevron-left'}`}></i>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-title">MAIN</div>
            <a 
              href="#" 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <i className="fas fa-tachometer-alt"></i>
              {!sidebarCollapsed && <span>Dashboard</span>}
            </a>
            <a 
              href="#" 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="fas fa-shopping-bag"></i>
              {!sidebarCollapsed && <span>Orders</span>}
              {!sidebarCollapsed && <span className="badge bg-warning ms-auto">{stats.pending}</span>}
            </a>
            <a 
              href="#" 
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <i className="fas fa-box"></i>
              {!sidebarCollapsed && <span>Products</span>}
            </a>
            <a 
              href="#" 
              className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <i className="fas fa-users"></i>
              {!sidebarCollapsed && <span>Customers</span>}
            </a>
          </div>
          
          <div className="nav-section">
            <div className="nav-title">ANALYTICS</div>
            <a 
              href="#" 
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <i className="fas fa-chart-bar"></i>
              {!sidebarCollapsed && <span>Analytics</span>}
            </a>
            <a 
              href="#" 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <i className="fas fa-cog"></i>
              {!sidebarCollapsed && <span>Settings</span>}
            </a>
          </div>
          
          <div className="nav-section mt-auto">
            <a href="#" className="nav-item" onClick={() => navigate('/')}>
              <i className="fas fa-store"></i>
              {!sidebarCollapsed && <span>Back to Store</span>}
            </a>
            <a href="#" className="nav-item text-danger">
              <i className="fas fa-sign-out-alt"></i>
              {!sidebarCollapsed && <span>Logout</span>}
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {/* Top Bar */}
        <div className="admin-topbar">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">Welcome back, {user?.username}!</h4>
              <small className="text-muted">Explore more Deals in your store today.</small>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="position-relative">
                <i className="fas fa-bell text-muted"></i>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.6rem'}}>
                  {stats.pending}
                </span>
              </div>
              <div className="admin-user">
                <img 
                  src={`https://ui-avatars.com/api/?name=${user?.username}&background=6366f1&color=fff`}
                  alt="Admin"
                  className="rounded-circle"
                  width="40"
                  height="40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="admin-main">
          {activeTab === 'dashboard' && (
            <div>
              {/* Stats Cards */}
              <div className="row mb-4">
                <div className="col-xl-3 col-md-6">
                  <div className="stat-card bg-primary">
                    <div className="stat-icon">
                      <i className="fas fa-shopping-cart"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{stats.total}</h3>
                      <p>Total Orders</p>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-md-6">
                  <div className="stat-card bg-warning">
                    <div className="stat-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{stats.pending}</h3>
                      <p>Pending Orders</p>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-md-6">
                  <div className="stat-card bg-success">
                    <div className="stat-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{stats.delivered}</h3>
                      <p>Delivered</p>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-md-6">
                  <div className="stat-card bg-info">
                    <div className="stat-icon">
                      <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="stat-content">
                      <h3>${stats.totalRevenue.toFixed(2)}</h3>
                      <p>Total Revenue</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="admin-card">
                <div className="card-header">
                  <h5><i className="fas fa-list me-2"></i>Recent Orders</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(order => (
                          <tr key={order.id}>
                            <td><strong>#{order.id}</strong></td>
                            <td>{order.userEmail || 'N/A'}</td>
                            <td><strong>${order.totalAmount}</strong></td>
                            <td>
                              <span className={`badge bg-${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                              <button className="btn btn-sm btn-outline-primary">
                                <i className="fas fa-eye"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="admin-card">
              <div className="card-header">
                <h5><i className="fas fa-shopping-bag me-2"></i>Order Management</h5>
              </div>
              <div className="card-body">
                {orders.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No orders found</h5>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>Order Details</th>
                          <th>Customer Info</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td>
                              <div>
                                <strong>Order #{order.id}</strong>
                                <br/>
                                <small className="text-muted">
                                  ${order.totalAmount} • {new Date(order.createdAt).toLocaleDateString()}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div>
                                {order.userEmail || 'N/A'}
                                <br/>
                                <small className="text-muted">{order.shippingAddress}</small>
                              </div>
                            </td>
                            <td>
                              <span className={`badge bg-${getStatusColor(order.status)} fs-6`}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                {getNextStatus(order.status) && (
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status))}
                                    disabled={updatingOrder === order.id}
                                  >
                                    {updatingOrder === order.id ? (
                                      <i className="fas fa-spinner fa-spin"></i>
                                    ) : (
                                      `→ ${getNextStatus(order.status)}`
                                    )}
                                  </button>
                                )}
                                <button className="btn btn-sm btn-outline-primary">
                                  <i className="fas fa-eye"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="admin-card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5><i className="fas fa-box me-2"></i>Product Management</h5>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setEditingProduct(null);
                      setNewProduct({
                        name: '',
                        description: '',
                        price: '',
                        stock: '',
                        category: '',
                        imageUrl: ''
                      });
                      setShowAddProduct(!showAddProduct);
                    }}
                  >
                    <i className="fas fa-plus me-2"></i>Add Product
                  </button>
                </div>
                
                {/* Add Product Form */}
                {showAddProduct && (
                  <div className="card-body border-top">
                    <h6 className="mb-3">
                      <i className={`fas fa-${editingProduct ? 'edit' : 'plus'} me-2`}></i>
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h6>
                    <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Product Name *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newProduct.name}
                              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Price *</label>
                            <div className="input-group">
                              <span className="input-group-text">$</span>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Stock Quantity *</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newProduct.stock}
                              onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Category *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newProduct.category}
                              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Image URL</label>
                            <input
                              type="url"
                              className="form-control"
                              value={newProduct.imageUrl}
                              onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea
                              className="form-control"
                              rows="3"
                              value={newProduct.description}
                              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-success">
                          <i className="fas fa-save me-2"></i>
                          {editingProduct ? 'Update Product' : 'Save Product'}
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowAddProduct(false);
                            setEditingProduct(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
              
              {/* Products List */}
              <div className="admin-card">
                <div className="card-header">
                  <h5><i className="fas fa-list me-2"></i>Products ({products.length})</h5>
                </div>
                <div className="card-body">
                  {products.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">No products found</h5>
                      <p className="text-muted">Start Your Shopping today with Z-Mart Products.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(product => (
                            <tr key={product.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img 
                                    src={product.imageUrl || `https://images.unsplash.com/photo-1541167760496-1628856ab772?w=50&h=50&fit=crop&auto=format`}
                                    alt={product.name}
                                    className="rounded me-3"
                                    style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                    onError={(e) => {
                                      e.target.src = `https://via.placeholder.com/50x50/f8f9fa/6c757d?text=${encodeURIComponent(product.name.substring(0, 2))}`;
                                    }}
                                  />
                                  <div>
                                    <strong>{product.name}</strong>
                                    <br/>
                                    <small className="text-muted">{product.description?.substring(0, 50)}...</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-light text-dark">{product.category}</span>
                              </td>
                              <td>
                                <strong>${product.price}</strong>
                              </td>
                              <td>
                                <span className={`badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>
                                  {product.stock} units
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  <button 
                                    className="btn btn-sm btn-outline-primary" 
                                    title="Edit"
                                    onClick={() => handleEditProduct(product)}
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger" 
                                    title="Delete"
                                    onClick={() => handleDeleteProduct(product.id)}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div>
              <div className="admin-card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5><i className="fas fa-users me-2"></i>Customer Management</h5>
                  <div>
                    <button className="btn btn-sm btn-outline-primary me-2">
                      <i className="fas fa-download me-1"></i>Export
                    </button>
                    <button className="btn btn-sm btn-primary">
                      <i className="fas fa-user-plus me-1"></i>Add Customer
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>Customer</th>
                          <th>Email</th>
                          <th>Orders</th>
                          <th>Total Spent</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center">
                              <img src="https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff" className="rounded-circle me-2" width="32" height="32" />
                              <div>
                                <strong>John Doe</strong>
                                <br/><small className="text-muted">Joined: Jan 2024</small>
                              </div>
                            </div>
                          </td>
                          <td>john@example.com</td>
                          <td><span className="badge bg-info">5 orders</span></td>
                          <td><strong>$450.00</strong></td>
                          <td><span className="badge bg-success">Active</span></td>
                          <td>
                            <div className="btn-group">
                              <button className="btn btn-sm btn-outline-primary" title="View">
                                <i className="fas fa-eye"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-warning" title="Edit">
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger" title="Block">
                                <i className="fas fa-ban"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div>
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="admin-card">
                    <div className="card-header">
                      <h6><i className="fas fa-chart-line me-2"></i>Sales Analytics</h6>
                    </div>
                    <div className="card-body">
                      <div className="row text-center">
                        <div className="col-6">
                          <h4 className="text-success">$12,450</h4>
                          <small>This Month</small>
                        </div>
                        <div className="col-6">
                          <h4 className="text-info">$8,320</h4>
                          <small>Last Month</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="admin-card">
                    <div className="card-header">
                      <h6><i className="fas fa-users me-2"></i>User Activity</h6>
                    </div>
                    <div className="card-body">
                      <div className="row text-center">
                        <div className="col-6">
                          <h4 className="text-primary">1,234</h4>
                          <small>Active Users</small>
                        </div>
                        <div className="col-6">
                          <h4 className="text-warning">89</h4>
                          <small>New Signups</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="admin-card">
                <div className="card-header">
                  <h5><i className="fas fa-chart-bar me-2"></i>Performance Metrics</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 text-center">
                      <div className="metric-card">
                        <i className="fas fa-eye fa-2x text-primary mb-2"></i>
                        <h4>15,678</h4>
                        <p>Page Views</p>
                      </div>
                    </div>
                    <div className="col-md-3 text-center">
                      <div className="metric-card">
                        <i className="fas fa-shopping-cart fa-2x text-success mb-2"></i>
                        <h4>2.4%</h4>
                        <p>Conversion Rate</p>
                      </div>
                    </div>
                    <div className="col-md-3 text-center">
                      <div className="metric-card">
                        <i className="fas fa-clock fa-2x text-warning mb-2"></i>
                        <h4>3m 45s</h4>
                        <p>Avg Session</p>
                      </div>
                    </div>
                    <div className="col-md-3 text-center">
                      <div className="metric-card">
                        <i className="fas fa-undo fa-2x text-danger mb-2"></i>
                        <h4>1.2%</h4>
                        <p>Return Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <div className="row">
                <div className="col-md-6">
                  <div className="admin-card mb-4">
                    <div className="card-header">
                      <h5><i className="fas fa-store me-2"></i>Store Settings</h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label">Store Name</label>
                        <input type="text" className="form-control" defaultValue="ShopHub" />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Store Email</label>
                        <input type="email" className="form-control" defaultValue="admin@shophub.com" />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Currency</label>
                        <select className="form-select">
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                          <option>GBP (£)</option>
                        </select>
                      </div>
                      <button className="btn btn-primary">Save Changes</button>
                    </div>
                  </div>
                  
                  <div className="admin-card">
                    <div className="card-header">
                      <h5><i className="fas fa-shield-alt me-2"></i>Security</h5>
                    </div>
                    <div className="card-body">
                      <div className="form-check form-switch mb-3">
                        <input className="form-check-input" type="checkbox" defaultChecked />
                        <label className="form-check-label">Two-Factor Authentication</label>
                      </div>
                      <div className="form-check form-switch mb-3">
                        <input className="form-check-input" type="checkbox" defaultChecked />
                        <label className="form-check-label">Login Notifications</label>
                      </div>
                      <div className="form-check form-switch mb-3">
                        <input className="form-check-input" type="checkbox" />
                        <label className="form-check-label">Maintenance Mode</label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="admin-card mb-4">
                    <div className="card-header">
                      <h5><i className="fas fa-bell me-2"></i>Notifications</h5>
                    </div>
                    <div className="card-body">
                      <div className="form-check form-switch mb-3">
                        <input className="form-check-input" type="checkbox" defaultChecked />
                        <label className="form-check-label">New Order Alerts</label>
                      </div>
                      <div className="form-check form-switch mb-3">
                        <input className="form-check-input" type="checkbox" defaultChecked />
                        <label className="form-check-label">Low Stock Warnings</label>
                      </div>
                      <div className="form-check form-switch mb-3">
                        <input className="form-check-input" type="checkbox" />
                        <label className="form-check-label">Customer Reviews</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="admin-card">
                    <div className="card-header">
                      <h5><i className="fas fa-database me-2"></i>System</h5>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span>Database Size</span>
                        <span className="badge bg-info">245 MB</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span>Cache Status</span>
                        <span className="badge bg-success">Active</span>
                      </div>
                      <div className="d-grid gap-2">
                        <button className="btn btn-outline-warning btn-sm">Clear Cache</button>
                        <button className="btn btn-outline-info btn-sm">Backup Database</button>
                        <button className="btn btn-outline-danger btn-sm">System Logs</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Styles */}
      <style jsx>{`
  .admin-dashboard {
    display: flex;
    min-height: 100vh;
    background: #f1f5f9; /* lighter slate-gray background */
  }

  .admin-sidebar {
    width: 280px;
    background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
    transition: all 0.3s ease;
    position: fixed;
    height: 100vh;
    z-index: 1000;
  }

  .admin-sidebar.collapsed {
    width: 80px;
  }

  .sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .admin-logo {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
  }

  .sidebar-nav {
    padding: 1rem 0;
    height: calc(100vh - 100px);
    display: flex;
    flex-direction: column;
  }

  .nav-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    padding: 0 1.5rem;
    margin-bottom: 0.5rem;
    letter-spacing: 0.05em;
  }

  .nav-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    color: rgba(255,255,255,0.8);
    text-decoration: none;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
  }

  .nav-item:hover {
    background: rgba(99,102,241,0.15);
    color: #fff;
  }

  .nav-item.active {
    background: rgba(99, 102, 241, 0.25);
    border-left-color: #6366f1;
    color: #fff;
    font-weight: 600;
  }

  .nav-item i {
    width: 20px;
    margin-right: 12px;
  }

  .admin-content {
    flex: 1;
    margin-left: 280px;
    transition: all 0.3s ease;
  }

  .admin-sidebar.collapsed + .admin-content {
    margin-left: 80px;
  }

  .admin-topbar {
    background: white;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  .admin-main {
    padding: 2rem;
  }

  .stat-card {
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    position: relative;
    overflow: hidden;
    color: #fff;
  }

  .stat-card.bg-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6) !important; }
  .stat-card.bg-warning { background: linear-gradient(135deg, #f59e0b, #f97316) !important; }
  .stat-card.bg-success { background: linear-gradient(135deg, #10b981, #059669) !important; }
  .stat-card.bg-info { background: linear-gradient(135deg, #06b6d4, #0891b2) !important; }

  .stat-card .stat-icon {
    position: absolute;
    right: 1rem;
    top: 1rem;
    font-size: 2rem;
    opacity: 0.25;
    color: #fff;
  }

  .stat-card .stat-content h3 {
    color: #fff;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .stat-card .stat-content p {
    color: rgba(255,255,255,0.85);
    margin: 0;
    font-size: 0.9rem;
  }

  .admin-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    border: none;
    overflow: hidden;
  }

  .admin-card .card-header {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 1.25rem 1.5rem;
    font-weight: 600;
    color: #334155;
  }

  .admin-card .card-body {
    padding: 1.5rem;
  }

  .table th {
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #475569;
  }

  .btn-group .btn {
    border-radius: 6px;
    margin-right: 0.25rem;
  }

  .metric-card {
    padding: 1.5rem;
    border-radius: 8px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #1e293b;
  }
`}</style>
 </div>
  );
};

export default AdminPanel;