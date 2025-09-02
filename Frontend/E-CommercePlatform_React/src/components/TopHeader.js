import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const TopHeader = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <>
      <div className="modern-header" style={{ height: '70px', position: 'fixed', top: 0, right: 0, left: 0, zIndex: 1000 }}>
        <div className="d-flex justify-content-between align-items-center h-100 px-4">
          <div className="d-flex align-items-center">
            <div className="logo-container">
              <span className="logo-text">Z-Mart</span>
            </div>
          </div>
          <div>
        {isAuthenticated ? (
          <div className="dropdown">
            <button 
              className="btn btn-link text-decoration-none d-flex align-items-center"
              type="button" 
              onClick={toggleDropdown}
              style={{ border: 'none' }}>
                
              <div className="text-start">
                <div className="fw-medium text-dark" style={{ fontSize: '0.9rem' }}>
                  Namaste, {user?.username || user?.email?.split('@')[0] || 'User'}
                </div>
                <small className="text-muted">Active</small>
              </div>
            </button>
            <ul className={`dropdown-menu dropdown-menu-end ${dropdownOpen ? 'show' : ''}`} style={{ position: 'absolute', right: 0, top: '100%' }}>
              <li><h6 className="dropdown-header"> Account Info</h6></li>
              <li><span className="dropdown-item-text">
                <strong>Username:</strong> {user?.username || user?.email?.split('@')[0] || 'User'}<br/>
                <strong>Status:</strong> <span className="text-success">Online</span><br/>
                <strong>Role:</strong> Customer
              </span></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item" onClick={() => { navigate('/orders'); setDropdownOpen(false); }}> My Orders</button></li>
              <li><button className="dropdown-item" onClick={() => { navigate('/wishlist'); setDropdownOpen(false); }}> My Wishlist</button></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item text-danger" onClick={handleLogout}> Logout</button></li>
            </ul>
          </div>
        ) : (
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
              Register
            </button>
          </div>
          )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .modern-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #3a1236ff 0%, #2d1830ff 100%); /* Sky blue gradient */
          border-radius: 25px;
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(0, 114, 255, 0.3); /* Sky blue glow */
          transition: all 0.3s ease;
        }
        
        .logo-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 114, 255, 0.4); /* Stronger hover glow */
        }
        
        .logo-text {
          font-size: 1.2rem;
          letter-spacing: 0.5px;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-3px); }
          60% { transform: translateY(-2px); }
        }
      `}</style>
    </>
  );
};

export default TopHeader;