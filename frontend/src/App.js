import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import InterviewPage from './pages/InterviewPage';
import LandingPage from './pages/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import GoogleAuth from './components/GoogleAuth';
import ProfilePage from './components/ProfilePage';
import CountrySelect from './components/CountrySelect';
import Navbar from './components/Navbar'; // Create this component for consistent navigation

export const UserContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVisaType, setSelectedVisaType] = useState('');

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      // Add token validation logic here
      // Consider adding a function to fetch user data with the token
      const validateToken = async () => {
        try {
          // Replace with your actual API endpoint
          const response = await fetch('/api/validate-token', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token invalid
            handleLogout();
          }
        } catch (error) {
          console.error('Token validation error:', error);
        }
      };
      
      // validateToken();
    }
  }, [token]);

  const handleLoginSuccess = (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
  };

  const handleVisaTypeSelect = (visaType) => {
    setSelectedVisaType(visaType);
  };

  // Protected route component
  const ProtectedRoute = () => {
    return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
  };

  // Authentication context value
  const authContextValue = {
    user,
    token,
    isLoggedIn,
    handleLoginSuccess,
    handleLogout
  };

  return (
    <UserContext.Provider value={authContextValue}>
      <BrowserRouter>
        <div className="app-container">
          {/* Navbar will only show on routes other than landing page */}
          <Routes>
            <Route path="/" element={null} />
            <Route path="*" element={<Navbar />} />
          </Routes>
          
          <Routes>
            {/* Public routes */}
            <Route 
              path="/" 
              element={
                <LandingPage 
                  onSelectCountry={handleCountrySelect} 
                  onSelectVisaType={handleVisaTypeSelect}
                  selectedCountry={selectedCountry}
                  selectedVisaType={selectedVisaType}
                />
              } 
            />
            <Route 
              path="/login" 
              element={
                isLoggedIn ? 
                <Navigate to="/interview" /> : 
                <Login onLoginSuccess={handleLoginSuccess} />
              } 
            />
            <Route 
              path="/register" 
              element={
                isLoggedIn ? 
                <Navigate to="/interview" /> : 
                <Register onRegistrationSuccess={handleLoginSuccess} />
              } 
            />
            <Route
              path="/google"
              element={<GoogleAuth onLoginSuccess={handleLoginSuccess} />}
            />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route 
                path="/selection" 
                element={
                  <CountrySelect 
                    onSelectCountry={handleCountrySelect}
                    onSelectVisaType={handleVisaTypeSelect}
                    selectedCountry={selectedCountry}
                    selectedVisaType={selectedVisaType}
                  />
                } 
              />
              <Route 
                path="/interview" 
                element={
                  <InterviewPage 
                    selectedCountry={selectedCountry} 
                    selectedVisaType={selectedVisaType}
                  />
                } 
              />
              <Route path="/profile" element={<ProfilePage user={user} />} />
            </Route>
            
            {/* Fallback for undefined routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;