/* InterviewPage.js */

import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CountrySelect from '../components/CountrySelect';
import InterviewScreen from '../components/InterviewScreen';
import logoSymbol from '../assets/images/logo-symbol.svg';
import { UserContext } from '../App';
import './InterviewPage.css';

function InterviewPage() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useContext(UserContext);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVisaType, setSelectedVisaType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);
  const [practiceDraft, setPracticeDraft] = useState(null);
  const selectionRef = useRef(null);

  useEffect(() => {
    // Add animation class after component mounts
    setAnimateIn(true);

    try {
      const draft = JSON.parse(localStorage.getItem('visaCoach:practiceDraft') || 'null');
      if (draft?.country && draft?.visaType) {
        setPracticeDraft(draft);
        setSelectedCountry(draft.country);
        setSelectedVisaType(draft.visaType);
        setLoadingProgress(0);
        localStorage.removeItem('visaCoach:practiceDraft');
      }
    } catch (error) {
      console.error('Unable to read practice draft:', error);
      localStorage.removeItem('visaCoach:practiceDraft');
    }
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
      setPracticeDraft(null);
      setAnimateIn(true);
    }, 300);
  };

  const scrollToSelection = () => {
    if (selectionRef.current) {
      const headerHeight = document.querySelector('.interview-header')?.offsetHeight || 0;
      const selectionTop = selectionRef.current.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: Math.max(selectionTop - headerHeight - 20, 0),
        behavior: 'smooth',
      });
    }
  };

  const goToHome = () => {
    setSelectedCountry('');
    setSelectedVisaType('');
    setPracticeDraft(null);
    setLoadingProgress(0);
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
            <span className="beta-badge">Public Beta</span>
            {isLoggedIn ? (
              <button className="btn btn-outline" onClick={() => navigate('/history')}>
                {user?.name ? 'Saved Sessions' : 'My Sessions'}
              </button>
            ) : (
              <>
                <button className="btn btn-outline" onClick={() => navigate('/login')}>Sign In</button>
                <button className="btn btn-primary" onClick={() => navigate('/register')}>Create Profile</button>
              </>
            )}
            <button className="btn btn-outline" onClick={goToHome}>Home</button>
          </div>
        </div>
      </header>

      <main className={`interview-main ${animateIn ? 'animate-in' : 'animate-out'}`}>
        <div className="container">
          {isLoading ? (
            <div className="loading-screen">
              <h2>Preparing Your Interview</h2>
              <div className="loading-container">
                <div className="loading-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                </div>
                <div className="loading-details">
                  <div className="loading-bar-container">
                    <div 
                      className="loading-bar" 
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  <div className="loading-steps">
                    <div className={`loading-step ${loadingProgress >= 25 ? 'complete' : ''}`}>
                      <div className="step-icon">📋</div>
                      <div className="step-text">Loading visa requirements</div>
                    </div>
                    <div className={`loading-step ${loadingProgress >= 50 ? 'complete' : ''}`}>
                      <div className="step-icon">🔍</div>
                      <div className="step-text">Analyzing interview patterns</div>
                    </div>
                    <div className={`loading-step ${loadingProgress >= 75 ? 'complete' : ''}`}>
                      <div className="step-icon">🤖</div>
                      <div className="step-text">Setting up your interviewer</div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="loading-country-info">Preparing {selectedVisaType} visa interview for {selectedCountry}...</p>
            </div>
          ) : !selectedCountry || !selectedVisaType ? (
            <div className="selection-screen">
              <div className="hero-section">
                <h1 className="page-title">Practice a <span className="gradient-text">Visa Interview</span> in Five Minutes</h1>
                <p className="page-subtitle">Choose a destination and visa type, answer a short set of realistic questions, then review focused feedback you can use before the real appointment.</p>
                <div className="hero-stats">
                  <div className="stat-item">
                    <div className="stat-value">5</div>
                    <div className="stat-label">Question Sprint</div>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <div className="stat-value">0</div>
                    <div className="stat-label">Login Required</div>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <div className="stat-value">1</div>
                    <div className="stat-label">Shareable Summary</div>
                  </div>
                </div>
                <div className="hero-actions">
                  <button className="btn btn-cta" onClick={scrollToSelection}>Choose Visa Path</button>
                  {!isLoggedIn && (
                    <button className="btn btn-secondary-cta" onClick={() => navigate('/register')}>
                      Create Profile First
                    </button>
                  )}
                </div>
                <p className="practice-note">Practice support only. This does not predict or guarantee any visa decision.</p>
              </div>
              
              <div className="selection-container" ref={selectionRef} id="visa-path">
                <div className="section-header">
                  <span className="section-number">1</span>
                  <h2 className="section-title">Select your destination & visa type</h2>
                </div>
                
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
                  <p>The coach asks a short sequence of interview-style questions based on your selected visa type. Answer as you would at the appointment so the feedback can focus on clarity, consistency, and preparedness.</p>
                  <ul className="info-features">
                    <li>
                      <span className="feature-icon">✓</span>
                      <span>Country and visa-type prompts</span>
                    </li>
                    <li>
                      <span className="feature-icon">✓</span>
                      <span>Concise answer feedback</span>
                    </li>
                    <li>
                      <span className="feature-icon">✓</span>
                      <span>End-of-session review</span>
                    </li>
                  </ul>
                </div>
                
                <div className="info-card">
                  <div className="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <h3>How It Works</h3>
                  <p>You will answer five questions. After each response, you get practical feedback, then the app creates a summary you can save locally or copy.</p>
                  <ul className="info-features">
                    <li>
                      <span className="feature-icon">✓</span>
                      <span>No account needed for the first practice session</span>
                    </li>
                    <li>
                      <span className="feature-icon">✓</span>
                      <span>Local fallback feedback for demos</span>
                    </li>
                    <li>
                      <span className="feature-icon">✓</span>
                      <span>Expandable later for job and founder interviews</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="testimonials-section">
                <h3 className="testimonials-title">Built for Practice</h3>
                <div className="testimonials-container">
                  <div className="testimonial-card">
                    <div className="testimonial-content">
                      <p>Immediate value: users should be able to open the app, select a visa path, answer one question, and learn something useful in the first minute.</p>
                    </div>
                    <div className="testimonial-author">
                      <div className="author-avatar">01</div>
                      <div className="author-info">
                        <div className="author-name">Fast Start</div>
                        <div className="author-detail">No onboarding wall</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="testimonial-card">
                    <div className="testimonial-content">
                      <p>Honest boundaries: the app helps applicants practice communication. It does not offer legal advice or promise outcomes.</p>
                    </div>
                    <div className="testimonial-author">
                      <div className="author-avatar">02</div>
                      <div className="author-info">
                        <div className="author-name">Safe Claims</div>
                        <div className="author-detail">Practice, not prediction</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="testimonial-card">
                    <div className="testimonial-content">
                      <p>Reusable foundation: the same interview engine can later support job, school, investor, or immigration-style practice modes.</p>
                    </div>
                    <div className="testimonial-author">
                      <div className="author-avatar">03</div>
                      <div className="author-info">
                        <div className="author-name">Expandable Core</div>
                        <div className="author-detail">Visa first, general later</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <InterviewScreen
              selectedCountry={selectedCountry}
              selectedVisaType={selectedVisaType}
              initialDraft={practiceDraft}
              onGoBack={handleGoBack}
            />
          )}
        </div>
      </main>

      <footer className="interview-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <img src={logoSymbol} alt="VisaCoach Logo" className="footer-logo-symbol" />
              <span className="footer-logo-text">VisaCoach</span>
            </div>
            <div className="footer-links">
              <Link to="/about">About</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
          </div>
          <p className="copyright">VisaCoach is a practice tool. It is not legal advice and does not guarantee an application outcome.</p>
        </div>
      </footer>
    </div>
  );
}

export default InterviewPage;
