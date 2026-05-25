import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import InterviewPage from './pages/InterviewPage';
import Login from './components/Login';
import Register from './components/Register';
import GoogleAuth from './components/GoogleAuth';
import ProfilePage from './components/ProfilePage';
import CountrySelect from './components/CountrySelect';
import Navbar from './components/Navbar'; // Create this component for consistent navigation
import InfoPage from './pages/InfoPage';
import { migrateLocalSessionToAccount } from './services/sessionMigration';

export const UserContext = createContext();

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
};

function App() {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(token));
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVisaType, setSelectedVisaType] = useState('');

  useEffect(() => {
    setIsLoggedIn(Boolean(token));
  }, [token]);

  const handleLoginSuccess = async (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    return migrateLocalSessionToAccount(token);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
            <Route path="/" element={<InterviewPage />} />
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
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/about" element={<InfoPage type="about" />} />
            <Route path="/privacy" element={<InfoPage type="privacy" />} />
            <Route path="/terms" element={<InfoPage type="terms" />} />
            <Route path="/contact" element={<InfoPage type="contact" />} />
            
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
              <Route path="/profile" element={<ProfilePage user={user} initialTab="profile" />} />
              <Route path="/history" element={<ProfilePage user={user} initialTab="sessions" />} />
              <Route path="/settings" element={<ProfilePage user={user} initialTab="settings" />} />
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
