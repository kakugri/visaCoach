/* InterviewPage.js */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CountrySelect from '../components/CountrySelect';
import InterviewScreen from '../components/InterviewScreen';
import logoSymbol from '../assets/images/logo-symbol.svg';
import './InterviewPage.css'; // You'll need to create this CSS file

function InterviewPage() {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVisaType, setSelectedVisaType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Add animation class after component mounts
    setAnimateIn(true);
  }, []);

  useEffect(() => {
    // If country and visa are selected, show a loading animation
    if (selectedCountry && selectedVisaType) {
      setIsLoading(true);
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsLoading(false);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [selectedCountry, selectedVisaType]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
  };

  const handleVisaTypeSelect = (visaType) => {
    setSelectedVisaType(visaType);
    // Reset progress for loading animation
    setLoadingProgress(0);
  };

  const handleGoBack = () => {
    setAnimateIn(false);
    setTimeout(() => {
      setSelectedCountry('');
      setSelectedVisaType('');
      setAnimateIn(true);
    }, 300);
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className="interview-page">
      <header className="interview-header">
        <div className="container header-container">
          <div className="logo" onClick={goToHome}>
            <img src={logoSymbol} alt="VisaCoach Logo" className="logo-symbol" />
            <span className="logo-text">VisaCoach</span>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline" onClick={goToHome}>Dashboard</button>
          </div>
        </div>
      </header>

      <main className={`interview-main ${animateIn ? 'animate-in' : 'animate-out'}`}>
        <div className="container">
          {isLoading ? (
            <div className="loading-screen">
              <h2>Preparing Your Interview</h2>
              <div className="loading-bar-container">
                <div 
                  className="loading-bar" 
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p>Loading visa interview for {selectedCountry} - {selectedVisaType}...</p>
            </div>
          ) : !selectedCountry || !selectedVisaType ? (
            <div className="selection-screen">
              <h1 className="page-title">Prepare for Your <span className="gradient-text">Visa Interview</span></h1>
              <p className="page-subtitle">Select your destination country and visa type to start a personalized mock interview</p>
              
              <div className="selection-container">
                <CountrySelect
                  onSelectCountry={handleCountrySelect}
                  onSelectVisaType={handleVisaTypeSelect}
                  selectedCountry={selectedCountry}
                />
              </div>
              
              <div className="interview-info">
                <div className="info-card">
                  <div className="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12" y2="8"></line>
                    </svg>
                  </div>
                  <h3>What to Expect</h3>
                  <p>Our AI will ask you real interview questions based on your selected visa type. Answer as you would in an actual interview for the most accurate feedback.</p>
                </div>
                
                <div className="info-card">
                  <div className="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <h3>How It Works</h3>
                  <p>You'll face 10-15 questions typical for your visa type. After each response, you'll receive instant AI feedback to help improve your answers.</p>
                </div>
              </div>
            </div>
          ) : (
            <InterviewScreen
              selectedCountry={selectedCountry}
              selectedVisaType={selectedVisaType}
              onGoBack={handleGoBack}
            />
          )}
        </div>
      </main>

      <footer className="interview-footer">
        <div className="container">
          <p>© 2025 VisaCoach. All information is simulated for practice purposes only.</p>
        </div>
      </footer>
    </div>
  );
}

export default InterviewPage;