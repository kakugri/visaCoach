/* InterviewPage.js */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CountrySelect from '../components/CountrySelect';
import InterviewScreen from '../components/InterviewScreen';
import logoSymbol from '../assets/images/logo-symbol.svg';
import './InterviewPage.css';

function InterviewPage() {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVisaType, setSelectedVisaType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);
  const [showPremiumBanner, setShowPremiumBanner] = useState(true);
  const [userPlan, setUserPlan] = useState('free'); // 'free', 'premium', 'pro'
  const [interviewsLeft, setInterviewsLeft] = useState(3);
  const selectionRef = useRef(null);

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

  const scrollToSelection = () => {
    if (selectionRef.current) {
      selectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToHome = () => {
    navigate('/');
  };
  
  const handleDismissBanner = () => {
    setShowPremiumBanner(false);
  };
  
  const handleUpgrade = () => {
    navigate('/pricing');
  };
  
  const renderInterviewsLeftBadge = () => {
    return (
      <div className={`interviews-left ${interviewsLeft <= 1 ? 'critical' : interviewsLeft <= 2 ? 'warning' : ''}`}>
        <span className="interviews-icon">🎯</span>
        <span className="interviews-text">{interviewsLeft} {interviewsLeft === 1 ? 'interview' : 'interviews'} left today</span>
      </div>
    );
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
            {userPlan === 'free' && renderInterviewsLeftBadge()}
            <div className="plan-badge">
              <span className={`plan-icon ${userPlan}`}>{userPlan === 'free' ? '🔹' : userPlan === 'premium' ? '⭐' : '🌟'}</span>
              <span className="plan-name">{userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan</span>
            </div>
            <button className="btn btn-outline" onClick={goToHome}>Dashboard</button>
          </div>
        </div>
      </header>

      <main className={`interview-main ${animateIn ? 'animate-in' : 'animate-out'}`}>
        <div className="container">
          {showPremiumBanner && userPlan === 'free' && (
            <div className="premium-banner">
              <div className="banner-content">
                <div className="banner-icon">✨</div>
                <div className="banner-text">
                  <h3>Upgrade to Premium</h3>
                  <p>Get unlimited interviews, expert feedback, and downloadable preparation guides.</p>
                </div>
                <div className="banner-actions">
                  <button className="btn btn-premium" onClick={handleUpgrade}>Upgrade Now</button>
                  <button className="btn-close" onClick={handleDismissBanner} aria-label="Close banner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
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
            <div className="selection-screen" ref={selectionRef}>
              <div className="hero-section">
                <h1 className="page-title">Master Your <span className="gradient-text">Visa Interview</span></h1>
                <p className="page-subtitle">Practice with our AI-powered mock interviews tailored to your specific visa application</p>
                <div className="hero-stats">
                  <div className="stat-item">
                    <div className="stat-value">95%</div>
                    <div className="stat-label">Success Rate</div>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <div className="stat-value">10K+</div>
                    <div className="stat-label">Interviews Conducted</div>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <div className="stat-value">50+</div>
                    <div className="stat-label">Visa Types</div>
                  </div>
                </div>
                <button className="btn btn-cta" onClick={scrollToSelection}>Get Started Now</button>
              </div>
              
              <div className="selection-container">
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
                  <p>Our AI will ask you realistic questions based on your selected visa type. Answer as you would in an actual interview for the most accurate feedback and guidance.</p>
                  <ul className="info-features">
                    <li>
                      <span className="feature-icon">✓</span>
                      <span>Country-specific questions</span>
                    </li>
                    <li>
                      <span className="feature-icon">✓</span>
                      <span>Real interview scenarios</span>
                    </li>
                    <li>
                      <span className="feature-icon">✓</span>
                      <span>Diplomatic officer simulation</span>
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
                  <p>You'll face 10-15 questions typical for your visa type. After each response, you'll receive instant AI feedback to help improve your answers.</p>
                  <ul className="info-features">
                    <li>
                      <span className="feature-icon">✓</span>
                      <span>Personalized feedback</span>
                    </li>
                    <li>
                      <span className="feature-icon">✓</span>
                      <span>Confidence assessment</span>
                    </li>
                    <li>
                      <span className="feature-icon premium-feature">
                        {userPlan === 'free' ? '⭐' : '✓'}
                      </span>
                      <span>
                        Response improvement suggestions
                        {userPlan === 'free' && <span className="premium-tag">Premium</span>}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="testimonials-section">
                <h3 className="testimonials-title">Success Stories</h3>
                <div className="testimonials-container">
                  <div className="testimonial-card">
                    <div className="testimonial-content">
                      <p>"After practicing with VisaCoach, I felt so much more confident in my actual interview. I got my student visa approved on the first try!"</p>
                    </div>
                    <div className="testimonial-author">
                      <div className="author-avatar">MS</div>
                      <div className="author-info">
                        <div className="author-name">Maria S.</div>
                        <div className="author-detail">F1 Student Visa, USA</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="testimonial-card">
                    <div className="testimonial-content">
                      <p>"I was nervous about my business visa interview, but the practice questions here were almost exactly what the officer asked me. Definitely worth it!"</p>
                    </div>
                    <div className="testimonial-author">
                      <div className="author-avatar">RK</div>
                      <div className="author-info">
                        <div className="author-name">Rajiv K.</div>
                        <div className="author-detail">B1 Business Visa, UK</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="testimonial-card">
                    <div className="testimonial-content">
                      <p>"The feedback on my answers helped me refine my responses and avoid common mistakes. Highly recommend for anyone preparing for a visa interview."</p>
                    </div>
                    <div className="testimonial-author">
                      <div className="author-avatar">JP</div>
                      <div className="author-info">
                        <div className="author-name">Julia P.</div>
                        <div className="author-detail">Working Holiday Visa, Australia</div>
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
              onGoBack={handleGoBack}
              userPlan={userPlan}
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
              <a href="/about">About</a>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/contact">Contact Us</a>
            </div>
            <div className="footer-social">
              <a href="https://twitter.com/visacoach" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="https://facebook.com/visacoach" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://instagram.com/visacoach" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
          <p className="copyright">© 2025 VisaCoach. All information is simulated for practice purposes only.</p>
        </div>
      </footer>

      {userPlan === 'free' && (
        <div className="floating-upgrade">
          <button className="upgrade-button" onClick={handleUpgrade}>
            <span className="upgrade-icon">⭐</span>
            <span>Upgrade to Premium</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default InterviewPage;