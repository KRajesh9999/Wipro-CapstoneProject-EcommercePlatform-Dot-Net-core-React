import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { items } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    // Initialize Bootstrap tooltips when collapsed
    if (isCollapsed) {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipTriggerList.forEach(tooltipTriggerEl => {
        if (window.bootstrap && window.bootstrap.Tooltip) {
          new window.bootstrap.Tooltip(tooltipTriggerEl);
        }
      });
    }
  }, [isCollapsed]);

  return (
    <div className="text-white" style={{ 
      width: isCollapsed ? '70px' : '280px', 
      height: 'calc(100vh - 60px)', 
      position: 'fixed', 
      left: 0, 
      top: '60px', 
      background: 'linear-gradient(135deg, #21221eff 0%, #131512ff 50%, #090a0aff 100%)', 
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
      transition: 'width 0.3s ease',
      overflow: 'hidden'
    }}>
      {/* Brand & Toggle */}
      <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
        {!isCollapsed && (
          <div>
            <h3 className="mb-0 fw-bold" style={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              The Z-Mart
            </h3>
            <small className="text-light opacity-75">–Shop smarter, live better!</small>
          </div>
        )}
        <button 
          className="btn btn-link text-white p-0"
          onClick={toggleSidebar}
          style={{ fontSize: '1.5rem', textDecoration: 'none' }}
        >
          {isCollapsed ? '>' : '<'}
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="p-4">
        {/* Main Navigation */}
        <div className="mb-4">
          {!isCollapsed && (
            <h6 className="mb-3 fw-semibold" style={{ color: '#f8f9fa', fontSize: '0.75rem', letterSpacing: '1px' }}>SHOPPING</h6>
          )}
          
          <Link 
            to="/" 
            className="d-flex align-items-center text-decoration-none text-white rounded-3 mb-2"
            title={isCollapsed ? 'Home' : ''}
            data-bs-toggle={isCollapsed ? 'tooltip' : ''}
            data-bs-placement="right"
            style={{ 
              transition: 'all 0.3s ease',
              backgroundColor: isActive('/') ? 'rgba(178, 222, 67, 0.8)' : 'transparent',
              backdropFilter: isActive('/') ? 'blur(10px)' : 'none',
              border: isActive('/') ? '1px solid rgba(52, 152, 219, 0.5)' : '1px solid transparent',
              boxShadow: isActive('/') ? '0 4px 15px rgba(52, 152, 219, 0.3)' : 'none',
              padding: isCollapsed ? '15px' : '12px',
              minHeight: '50px'
            }}
            onMouseEnter={(e) => {
              if (!isActive('/')) {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/')) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div className={`d-flex align-items-center ${isCollapsed ? 'justify-content-center w-100' : ''}`}>
              <span className={isCollapsed ? '' : 'me-3'} style={{ fontSize: isCollapsed ? '1.8rem' : '1.2rem' }}>H</span>
              {!isCollapsed && <span className="fw-medium">Home</span>}
            </div>
          </Link>

          {isAuthenticated && (
            <>
              <Link 
                to="/cart" 
                className="d-flex align-items-center text-decoration-none text-white rounded-3 mb-2"
                title={isCollapsed ? 'Cart' : ''}
                data-bs-toggle={isCollapsed ? 'tooltip' : ''}
                data-bs-placement="right"
                style={{ 
                  transition: 'all 0.3s ease',
                  backgroundColor: isActive('/cart') ? 'rgba(46, 204, 113, 0.8)' : 'transparent',
                  backdropFilter: isActive('/cart') ? 'blur(10px)' : 'none',
                  border: isActive('/cart') ? '1px solid rgba(46, 204, 113, 0.5)' : '1px solid transparent',
                  boxShadow: isActive('/cart') ? '0 4px 15px rgba(46, 204, 113, 0.3)' : 'none',
                  padding: isCollapsed ? '15px' : '12px',
                  minHeight: '50px'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/cart')) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/cart')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div className={`d-flex align-items-center ${isCollapsed ? 'justify-content-center w-100' : 'justify-content-between w-100'}`}>
                  <div className="d-flex align-items-center">
                    <span className={isCollapsed ? '' : 'me-3'} style={{ fontSize: isCollapsed ? '1.8rem' : '1.2rem' }}>C</span>
                    {!isCollapsed && <span className="fw-medium">Cart</span>}
                  </div>
                  {!isCollapsed && cartItemCount > 0 && (
                    <span className="badge rounded-pill" style={{ backgroundColor: '#ff6b6b', color: 'white' }}>
                      {cartItemCount}
                    </span>
                  )}
                  {isCollapsed && cartItemCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </Link>

              <Link 
                to="/orders" 
                className="d-flex align-items-center text-decoration-none text-white rounded-3 mb-2"
                title={isCollapsed ? 'My Orders' : ''}
                data-bs-toggle={isCollapsed ? 'tooltip' : ''}
                data-bs-placement="right"
                style={{ 
                  transition: 'all 0.3s ease',
                  backgroundColor: isActive('/orders') ? 'rgba(155, 229, 90, 0.8)' : 'transparent',
                  backdropFilter: isActive('/orders') ? 'blur(10px)' : 'none',
                  border: isActive('/orders') ? '1px solid rgba(155, 89, 182, 0.5)' : '1px solid transparent',
                  boxShadow: isActive('/orders') ? '0 4px 15px rgba(155, 89, 182, 0.3)' : 'none',
                  padding: isCollapsed ? '15px' : '12px',
                  minHeight: '50px'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/orders')) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/orders')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div className={`d-flex align-items-center ${isCollapsed ? 'justify-content-center w-100' : ''}`}>
                  <span className={isCollapsed ? '' : 'me-3'} style={{ fontSize: isCollapsed ? '1.8rem' : '1.2rem' }}>O</span>
                  {!isCollapsed && <span className="fw-medium">Orders</span>}
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Management Section */}
        {isAuthenticated && (
          <div className="mb-4">
            {!isCollapsed && (
              <h6 className="mb-3 fw-semibold" style={{ color: '#f8f9fa', fontSize: '0.75rem', letterSpacing: '1px' }}>MANAGEMENT</h6>
            )}
            
            <Link 
              to="/admin" 
              className="d-flex align-items-center text-decoration-none text-white rounded-3 mb-2"
              title={isCollapsed ? 'Admin Panel' : ''}
              data-bs-toggle={isCollapsed ? 'tooltip' : ''}
              data-bs-placement="right"
              style={{ 
                transition: 'all 0.3s ease',
                backgroundColor: isActive('/admin') ? 'rgba(255,255,255,0.2)' : 'transparent',
                backdropFilter: isActive('/admin') ? 'blur(10px)' : 'none',
                border: isActive('/admin') ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                padding: isCollapsed ? '15px' : '12px',
                minHeight: '50px'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/admin')) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/admin')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div className={`d-flex align-items-center ${isCollapsed ? 'justify-content-center w-100' : ''}`}>
                <span className={isCollapsed ? '' : 'me-3'} style={{ fontSize: isCollapsed ? '1.8rem' : '1.2rem' }}>A</span>
                {!isCollapsed && <span className="fw-medium">Admin Panel</span>}
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;