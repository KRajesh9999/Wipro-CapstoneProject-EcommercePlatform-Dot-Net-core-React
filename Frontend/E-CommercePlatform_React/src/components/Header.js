import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { items } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary" to="/" style={{fontSize: '1.5rem'}}>
            The Z-Mart
          </Link>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <div className="navbar-nav ms-auto align-items-center">
              <Link className="nav-link px-3 rounded-pill mx-1 hover-bg" to="/">
                <i className="fas fa-home me-1"></i> Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link className="nav-link px-3 rounded-pill mx-1 position-relative" to="/cart">
                    <i className="fas fa-shopping-cart me-1"></i> Cart
                    {cartItemCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.7rem'}}>
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                  <Link className="nav-link px-3 rounded-pill mx-1" to="/orders">
                    <i className="fas fa-box me-1"></i> Orders
                  </Link>
                  <Link className="nav-link px-3 rounded-pill mx-1" to="/admin">
                    <i className="fas fa-cog me-1"></i> Admin
                  </Link>
                  <div className="dropdown ms-2">
                    <button className="btn btn-outline-primary dropdown-toggle rounded-pill" type="button" data-bs-toggle="dropdown">
                      <i className="fas fa-user me-1"></i> {user?.username}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><span className="dropdown-item-text">Welcome, {user?.username}!</span></li>
                      <li><hr className="dropdown-divider"/></li>
                      <li><button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt me-1"></i> Logout
                      </button></li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <Link className="nav-link px-3 rounded-pill mx-1" to="/login">
                    <i className="fas fa-sign-in-alt me-1"></i> Login
                  </Link>
                  <Link className="btn btn-primary rounded-pill px-4 ms-2" to="/register">
                    <i className="fas fa-user-plus me-1"></i> Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <style jsx>{`
        .hover-bg:hover {
          background-color: rgba(255, 255, 255, 0.08); /* subtle space glow */
          transition: all 0.3s ease;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.3),
                      0 0 15px rgba(138, 43, 226, 0.2);
        }

        .navbar-brand:hover {
          transform: scale(1.05);
          transition: all 0.3s ease;
          text-shadow: 0 0 6px #ffffff, 0 0 10px #a78bfa;
        }

        /* Glitter Twinkling Animation */
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .hover-bg::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(2px 2px at 20% 30%, #fff, transparent),
                            radial-gradient(1px 1px at 70% 80%, #a78bfa, transparent),
                            radial-gradient(1.5px 1.5px at 40% 60%, #f0f0f0, transparent);
          background-size: cover;
          pointer-events: none;
          animation: twinkle 4s infinite ease-in-out alternate;
        }
      `}</style>

    </>
  );
};

export default Header;