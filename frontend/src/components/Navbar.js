import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../App';
import logoSymbol from '../assets/images/logo-symbol.svg';

const Navbar = () => {
  const { isLoggedIn, handleLogout, user } = useContext(UserContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    handleLogout();
  };

  return (
    <header className="app-navbar">
      <div className="container navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            <img src={logoSymbol} alt="VisaCoach Logo" className="logo-symbol" />
            <span className="logo-text">VisaCoach</span>
          </Link>
        </div>
        
        <nav className="navbar-navigation">
          {isLoggedIn ? (
            <>
              <Link to="/interview" className="nav-link">New Practice</Link>
              <Link to="/history" className="nav-link">Saved Sessions</Link>
              
              <div className="user-dropdown" ref={dropdownRef}>
                <button
                  type="button"
                  className="dropdown-toggle"
                  aria-haspopup="menu"
                  aria-expanded={isDropdownOpen}
                  onClick={() => setIsDropdownOpen((isOpen) => !isOpen)}
                >
                  <span className="user-name">{user?.name || 'User'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <div className={`dropdown-menu ${isDropdownOpen ? 'open' : ''}`} role="menu">
                  <Link to="/profile" className="dropdown-item" role="menuitem">Profile</Link>
                  <Link to="/settings" className="dropdown-item" role="menuitem">Settings</Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleSignOut} className="dropdown-item logout-button" role="menuitem">
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Sign in</Link>
              <Link to="/register" className="btn btn-primary">Create account</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
