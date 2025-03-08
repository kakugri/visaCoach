import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import logoSymbol from '../assets/images/logo-symbol.svg';

const Navbar = () => {
  const { isLoggedIn, handleLogout, user } = useContext(UserContext);
  const navigate = useNavigate();

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
              <Link to="/interview" className="nav-link">New Interview</Link>
              <Link to="/profile" className="nav-link">My Profile</Link>
              
              <div className="user-dropdown">
                <button className="dropdown-toggle">
                  <span className="user-name">{user?.name || 'User'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <Link to="/history" className="dropdown-item">Interview History</Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-button">
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;