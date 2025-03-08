import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GoogleAuth from '../components/GoogleAuth';
import { UserContext } from '../App';
import './LandingPage.css';

// Import images and illustrations
import heroIllustration from '../assets/images/hero-illustration.svg';
import logoSymbol from '../assets/images/logo-symbol.svg';
import userAvatar1 from '../assets/images/user-avatar-1.jpg';
import userAvatar2 from '../assets/images/user-avatar-2.jpg';
import userAvatar3 from '../assets/images/user-avatar-3.jpg';
import interviewSimulationImg from '../assets/images/interview-simulation.jpg';
import aiAnalysisImg from '../assets/images/ai-analysis.jpg';
import countryFlagUS from '../assets/images/flags/us.svg';
import countryFlagCA from '../assets/images/flags/ca.svg';
import countryFlagUK from '../assets/images/flags/uk.svg';
import countryFlagAU from '../assets/images/flags/au.svg';
import countryFlagDE from '../assets/images/flags/de.svg';

function LandingPage({ onSelectCountry, onSelectVisaType, selectedCountry, selectedVisaType }) {
  const navigate = useNavigate();
  const { isLoggedIn, handleLogout } = useContext(UserContext);
  const [isInView, setIsInView] = useState({
    features: false,
    testimonials: false,
    stats: false,
    "visa-types": false
  });
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);
  const [activeCountry, setActiveCountry] = useState('United States');
  const [activeVisaType, setActiveVisaType] = useState('B1/B2 Visitor Visa');

  // Demo conversation for the interactive demo
  const demoConversation = [
    {
      question: "Why do you want to visit the United States?",
      answer: "I'm attending a tech conference in San Francisco for 2 weeks and plan to visit some university campuses."
    },
    {
      question: "How will you fund your stay?",
      answer: "My company is sponsoring the trip, and I've saved $3,000 for personal expenses during my visit."
    },
    {
      question: "What ties do you have to your home country?",
      answer: "I have a permanent job at a software company, own property, and my family lives there."
    }
  ];

  const successStories = [
    {
      name: "Maria G.",
      avatar: userAvatar1,
      country: "Brazil",
      destination: "United States",
      quote: "VisaCoach helped me prepare for questions I never expected. My B1/B2 visa interview was a breeze!",
      rating: 5
    },
    {
      name: "Raj P.",
      avatar: userAvatar2,
      country: "India",
      destination: "Canada",
      quote: "After being rejected once, I used VisaCoach and got my study permit on the second try. The AI feedback was invaluable!",
      rating: 5
    },
    {
      name: "Liu W.",
      avatar: userAvatar3,
      country: "China",
      destination: "United Kingdom",
      quote: "The mock interviews felt so real that the actual interview seemed easy. Approved on my first try!",
      rating: 4
    }
  ];

  // Intersection Observer for animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsInView(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.animate-on-scroll');
    sections.forEach(section => {
      observer.observe(section);
    });

    return () => {
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);

  // Auto rotate demo conversation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemoIndex(prev => (prev + 1) % demoConversation.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Tab switching functionality
  useEffect(() => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    const handleTabClick = (index) => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        tabButtons[index].classList.add('active');
        tabContents[index].classList.add('active');
    }

    tabButtons.forEach((button, index) => {
      button.addEventListener('click', () => handleTabClick(index));
    });

    return () => {
        tabButtons.forEach((button, index) => {
            button.removeEventListener('click', () => handleTabClick(index));
          });
    }
  }, []);

  const handleCTAClick = () => {
    if (isLoggedIn) {
      navigate('/interview');
    } else {
      navigate('/register');
    }
  };

  const handleDashboardClick = () => {
    navigate('/profile');
  };

  //useCallback to memoize the handleVisaSelect function
  const handleVisaSelect = useCallback((country, visaType) => {
    setActiveCountry(country);
    setActiveVisaType(visaType);
    onSelectCountry(country);
    onSelectVisaType(visaType);
    
    if (isLoggedIn) {
      navigate('/interview');
    } else {
      navigate('/login');
    }
  },[isLoggedIn, navigate, onSelectCountry, onSelectVisaType]);

  const handleQuickStartInterview = () => {
    onSelectCountry(activeCountry);
    onSelectVisaType(activeVisaType);
    
    if (isLoggedIn) {
      navigate('/interview');
    } else {
      navigate('/login');
    }
  };

  // Fixed Google Auth success and error handlers
  const handleGoogleLoginSuccess = () => {
    handleVisaSelect(activeCountry, activeVisaType);
  };

  const handleGoogleLoginError = (error) => {
    console.error("Google login error:", error);
    // Fallback to regular navigation
    handleVisaSelect(activeCountry, activeVisaType);
  };

  return (
    <div className="landing-page">
      <header className="header">
        <div className="container header-container">
          <div className="logo">
            <img src={logoSymbol} alt="VisaCoach Logo" className="logo-symbol" />
            <span className="logo-text">VisaCoach</span>
          </div>
          <div className="header-actions">
            {isLoggedIn ? (
              <div className="user-controls">
                <button onClick={handleDashboardClick} className="btn btn-outline">My Dashboard</button>
                <button onClick={handleLogout} className="btn btn-outline">Sign Out</button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">Sign In</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="gradient-text">Nail Your</span> Visa Interview
            </h1>
            <p className="hero-subtitle">
              Our AI-powered coach prepares you for success with personalized mock interviews,
              real-time feedback, and expert guidance for your visa application.
            </p>

            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">97%</span>
                <span className="stat-label">Success Rate</span>
              </div>
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Visas Approved</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Countries</span>
              </div>
            </div>

            <div className="hero-cta">
              <button onClick={handleCTAClick} className="btn btn-primary with-shine">
                Start Practicing Now
              </button>
              <p className="hero-cta-note">Free for your first mock interview</p>
            </div>

            <div className="country-flags">
              <img src={countryFlagUS} alt="USA" className="country-flag" onClick={() => setActiveCountry('United States')} />
              <img src={countryFlagCA} alt="Canada" className="country-flag" onClick={() => setActiveCountry('Canada')} />
              <img src={countryFlagUK} alt="UK" className="country-flag" onClick={() => setActiveCountry('United Kingdom')} />
              <img src={countryFlagAU} alt="Australia" className="country-flag" onClick={() => setActiveCountry('Australia')} />
              <img src={countryFlagDE} alt="Germany" className="country-flag" onClick={() => setActiveCountry('Germany')} />
              <span className="more-countries">+45 more</span>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="demo-interview">
              <div className="demo-interview-header">
                <div className="demo-avatar">
                  <span>IO</span>
                </div>
                <div className="demo-info">
                  <span className="demo-officer">Immigration Officer</span>
                  <span className="demo-type">{activeVisaType}</span>
                </div>
              </div>

              <div className="demo-conversation">
                {demoConversation.map((exchange, index) => (
                  <div
                    key={index}
                    className={`demo-exchange ${index === activeDemoIndex ? 'active' : ''}`}
                  >
                    <div className="demo-question">
                      <span className="question-prefix">Q:</span>
                      {exchange.question}
                    </div>
                    <div className="demo-answer">
                      <span className="answer-prefix">A:</span>
                      {exchange.answer}
                    </div>
                    {index === activeDemoIndex && (
                      <div className="demo-feedback">
                        <div className="feedback-score">
                          <span className="score">8.5</span>/10
                        </div>
                        <div className="feedback-text">
                          Good answer! Add specific details about the conference name and dates.
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="demo-status">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
                <div className="demo-controls">
                  {demoConversation.map((_, index) => (
                    <button
                      key={index}
                      className={`demo-dot ${index === activeDemoIndex ? 'active' : ''}`}
                      onClick={() => setActiveDemoIndex(index)}
                    />
                  ))}
                </div>
              </div>
              
              <button onClick={handleQuickStartInterview} className="btn btn-primary btn-quick-start">
                Try This Interview
              </button>
            </div>

            <img src={heroIllustration} alt="Visa interview preparation" className="hero-illustration" />
          </div>
        </div>

        <div className="hero-wave">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,144C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features" className="features animate-on-scroll">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">Prepare for Visa Success in 3 Simple Steps</h2>
            <p className="section-subtitle">
              Our AI-powered platform simulates real visa interviews, providing personalized
              feedback to maximize your chances of approval.
            </p>
          </div>

          <div className={`features-grid ${isInView.features ? 'in-view' : ''}`}>
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3 className="feature-title">1. Select Your Visa Type</h3>
              <p className="feature-description">
                Choose from 20+ visa types for 50+ countries, each with specialized question sets.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2H3v16h5v4l4-4h5l4-4V2z"></path>
                  <path d="M10 8h4"></path>
                  <path d="M10 12h4"></path>
                </svg>
              </div>
              <h3 className="feature-title">2. Practice With AI Officer</h3>
              <p className="feature-description">
                Face authentic questions from a virtual immigration officer in a realistic interview.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                </svg>
              </div>
              <h3 className="feature-title">3. Get Expert Feedback</h3>
              <p className="feature-description">
                Receive immediate analysis of your answers with specific suggestions for improvement.
              </p>
            </div>
          </div>

          {/* Feature showcase */}
          <div className="feature-showcase">
            <div className="feature-showcase-content">
              <h3>Experience a Full Interview Simulation</h3>
              <p>
                Our AI conducts realistic interviews that adapt to your responses, just like a real immigration officer would.
              </p>
              <ul className="feature-showcase-list">
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Dynamic questioning based on your profile and answers
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Practice under time pressure like a real interview
                </li>
              </ul>
              <button onClick={handleCTAClick} className="btn btn-primary">
                Try a Free Interview
              </button>
            </div>
            <div className="feature-showcase-image">
              <img src={interviewSimulationImg} alt="Interview simulation" />
            </div>
          </div>

          <div className="feature-showcase reverse">
            <div className="feature-showcase-content">
              <h3>Get Comprehensive Answer Analysis</h3>
              <p>
                Our AI evaluates your responses on multiple dimensions and provides actionable feedback.
              </p>
              <ul className="feature-showcase-list">
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Content analysis: accuracy, completeness, relevance
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Red flag detection and suggestion removal
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Compare your answers with successful applicants
                </li>
              </ul>
              <button onClick={handleCTAClick} className="btn btn-primary">
                See Example Analysis
              </button>
            </div>
            <div className="feature-showcase-image">
              <img src={aiAnalysisImg} alt="AI analysis dashboard" />
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials animate-on-scroll">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">Success Stories</h2>
            <p className="section-subtitle">
              Join thousands of travelers who secured their visas with confidence using VisaCoach.
            </p>
          </div>

          <div className={`testimonials-grid ${isInView.testimonials ? 'in-view' : ''}`}>
            {successStories.map((story, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <img src={story.avatar} alt={story.name} className="testimonial-avatar" />
                  <div className="testimonial-meta">
                    <h4 className="testimonial-name">{story.name}</h4>
                    <div className="testimonial-journey">
                      <span>{story.country}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                      <span>{story.destination}</span>
                    </div>
                  </div>
                </div>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={i < story.rating ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="testimonial-quote">"{story.quote}"</p>
              </div>
            ))}
          </div>

          <div className="testimonials-stats">
            <div className="stat-card">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Successful Applicants</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">97%</div>
              <div className="stat-label">Approval Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Countries Covered</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">4.8/5</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      <section id="visa-types" className="visa-types animate-on-scroll">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Visa Types</span>
            <h2 className="section-title">Prepare for Any Visa</h2>
            <p className="section-subtitle">
              VisaCoach offers specialized preparation for a wide range of visa types across multiple countries.
            </p>
          </div>

          <div className="visa-tabs">
            <div className="tabs-header">
              <button className="tab-button active">Tourist</button>
              <button className="tab-button">Student</button>
              <button className="tab-button">Work</button>
              <button className="tab-button">Family</button>
              <button className="tab-button">Business</button>
            </div>

            <div className="tabs-content">
              {/* Tourist Tab */}
              <div className="tab-content active">
                <div className="visa-grid">
                  <div className="visa-card" onClick={() => handleVisaSelect('United States', 'B1/B2 Visitor Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
                      <h4>B1/B2 Visitor Visa</h4>
                    </div>
                    <p>For tourism, visiting family, or short business trips to the United States.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('United Kingdom', 'Standard Visitor Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
                      <h4>Standard Visitor Visa</h4>
                    </div>
                    <p>For tourism, visiting family, or attending short courses in the UK.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Canada', 'Temporary Resident Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
                      <h4>Temporary Resident Visa</h4>
                    </div>
                    <p>For visits, tourism or business trips to Canada.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Australia', 'Visitor Visa (600)')}>
                    <div className="visa-card-header">
                      <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
                      <h4>Visitor Visa (600)</h4>
                    </div>
                    <p>For tourism, business visits, or family visits to Australia.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>
                </div>

                <div className="visa-types-cta">
                  <span>We cover 50+ countries and 100+ visa types</span>
                  <button onClick={() => navigate('/interview')} className="btn btn-secondary">
                    Find Your Visa Type
                  </button>
                </div>
              </div>

              {/* Student Tab */}
              <div className="tab-content">
                <div className="visa-grid">
                  <div className="visa-card" onClick={() => handleVisaSelect('United States', 'F-1 Student Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
                      <h4>F-1 Student Visa</h4>
                    </div>
                    <p>For academic studies at US colleges, universities, and language programs.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('United Kingdom', 'Student Visa (Tier 4)')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
                      <h4>Student Visa (Tier 4)</h4>
                    </div>
                    <p>For studying at UK educational institutions for courses longer than 6 months.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Canada', 'Study Permit')}>
                    <div className="visa-card-header">
                      <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
                      <h4>Study Permit</h4>
                    </div>
                    <p>For international students pursuing education at designated Canadian institutions.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Australia', 'Student Visa (500)')}>
                    <div className="visa-card-header">
                      <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
                      <h4>Student Visa (500)</h4>
                    </div>
                    <p>For international students enrolled in courses at Australian educational institutions.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>
                </div>

                <div className="visa-types-cta">
                  <span>We cover 50+ countries and 100+ visa types</span>
                  <button onClick={() => navigate('/interview')} className="btn btn-secondary">
                    Find Your Visa Type
                  </button>
                </div>
              </div>

              {/* Work Tab */}
              <div className="tab-content">
                <div className="visa-grid">
                  <div className="visa-card" onClick={() => handleVisaSelect('United States', 'H-1B Work Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
                      <h4>H-1B Work Visa</h4>
                    </div>
                    <p>For specialized occupations requiring theoretical and practical application of knowledge.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('United Kingdom', 'Skilled Worker Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
                      <h4>Skilled Worker Visa</h4>
                    </div>
                    <p>For qualified professionals with job offers from UK employers.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Canada', 'Work Permit')}>
                    <div className="visa-card-header">
                      <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
                      <h4>Work Permit</h4>
                    </div>
                    <p>For temporary foreign workers with valid job offers from Canadian employers.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Australia', 'Temporary Skill Shortage (482)')}>
                    <div className="visa-card-header">
                      <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
                      <h4>Temporary Skill Shortage (482)</h4>
                    </div>
                    <p>For skilled workers sponsored by Australian businesses to fill critical positions.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>
                </div>

                <div className="visa-types-cta">
                  <span>We cover 50+ countries and 100+ visa types</span>
                  <button onClick={() => navigate('/interview')} className="btn btn-secondary">
                    Find Your Visa Type
                  </button>
                </div>
              </div>

              {/* Family Tab */}
              <div className="tab-content">
                <div className="visa-grid">
                  <div className="visa-card" onClick={() => handleVisaSelect('United States', 'K-1 Fiancé(e) Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
                      <h4>K-1 Fiancé(e) Visa</h4>
                    </div>
                    <p>For foreign-citizen fiancé(e)s of U.S. citizens to enter the United States for marriage.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('United Kingdom', 'Family Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
                      <h4>Family Visa</h4>
                    </div>
                    <p>For joining family members who are settled in the UK.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Canada', 'Family Sponsorship')}>
                    <div className="visa-card-header">
                      <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
                      <h4>Family Sponsorship</h4>
                    </div>
                    <p>For Canadian citizens and permanent residents to sponsor eligible family members.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Australia', 'Partner Visa (309/100)')}>
                    <div className="visa-card-header">
                      <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
                      <h4>Partner Visa (309/100)</h4>
                    </div>
                    <p>For partners of Australian citizens, permanent residents, or eligible New Zealand citizens.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>
                </div>

                <div className="visa-types-cta">
                  <span>We cover 50+ countries and 100+ visa types</span>
                  <button onClick={() => navigate('/interview')} className="btn btn-secondary">
                    Find Your Visa Type
                  </button>
                </div>
              </div>

              {/* Business Tab */}
              <div className="tab-content">
                <div className="visa-grid">
                  <div className="visa-card" onClick={() => handleVisaSelect('United States', 'E-2 Treaty Investor Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
                      <h4>E-2 Treaty Investor Visa</h4>
                    </div>
                    <p>For nationals of treaty countries investing substantial capital in a U.S. business.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('United Kingdom', 'Innovator Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
                      <h4>Innovator Visa</h4>
                    </div>
                    <p>For experienced business people seeking to establish an innovative business in the UK.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Canada', 'Start-up Visa Program')}>
                    <div className="visa-card-header">
                      <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
                      <h4>Start-up Visa Program</h4>
                    </div>
                    <p>For entrepreneurs with innovative business ideas seeking to immigrate to Canada.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Australia', 'Business Innovation (188)')}>
                    <div className="visa-card-header">
                      <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
                      <h4>Business Innovation (188)</h4>
                    </div>
                    <p>For business owners and investors seeking to own and manage a business in Australia.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>
                </div>

                <div className="visa-types-cta">
                  <span>We cover 50+ countries and 100+ visa types</span>
                  <button onClick={() => navigate('/interview')} className="btn btn-secondary">
                    Find Your Visa Type
                  </button>
                </div>
              </div>
              </div>
            </div>
        </div>
        </section>

        <section className="pricing">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Pricing</span>
            <h2 className="section-title">Simple, Transparent Pricing</h2>
            <p className="section-subtitle">
              Choose the plan that fits your needs and start preparing for success.
            </p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-card-header">
                <h3 className="pricing-plan">Free Trial</h3>
                <div className="pricing-price">
                  <span className="price">$0</span>
                </div>
              </div>
              <div className="pricing-features">
                <ul>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    1 complete mock interview
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Basic feedback
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Standard question sets
                  </li>
                </ul>
              </div>
              <div className="pricing-cta">
                <GoogleAuth
                  onLoginSuccess={handleGoogleLoginSuccess}
                  onLoginError={handleGoogleLoginError}
                  buttonText="Start Free Trial"
                  className="btn btn-outline-primary"
                />
              </div>
            </div>

            <div className="pricing-card popular">
              <div className="pricing-card-badge">Most Popular</div>
              <div className="pricing-card-header">
                <h3 className="pricing-plan">Standard</h3>
                <div className="pricing-price">
                  <span className="price">$29</span>
                  <span className="period">one-time</span>
                </div>
              </div>
              <div className="pricing-features">
                <ul>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    5 complete mock interviews
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Advanced AI feedback
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Custom question sets
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Progress tracking
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Document checklists
                  </li>
                </ul>
              </div>
              <div className="pricing-cta">
                <GoogleAuth
                  onLoginSuccess={handleGoogleLoginSuccess}
                  onLoginError={handleGoogleLoginError}
                  buttonText="Get Started"
                  className="btn btn-primary"
                />
              </div>
            </div>

            <div className="pricing-card">
              <div className="pricing-card-header">
                <h3 className="pricing-plan">Premium</h3>
                <div className="pricing-price">
                  <span className="price">$49</span>
                  <span className="period">one-time</span>
                </div>
              </div>
              <div className="pricing-features">
                <ul>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Unlimited mock interviews
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Premium AI feedback
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Priority support
                  </li>
                   <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Personalized interview strategy session
                  </li>
                   <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Visa application review
                  </li>
                </ul>
              </div>
              <div className="pricing-cta">
                <GoogleAuth
                  onLoginSuccess={handleGoogleLoginSuccess}
                  onLoginError={handleGoogleLoginError}
                  buttonText="Go Premium"
                  className="btn btn-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stats" className="stats animate-on-scroll">
        <div className="container">
          <div className="stats-header section-header">
            <span className="section-tag">Stats</span>
            <h2 className="section-title">VisaCoach By The Numbers</h2>
            <p className="section-subtitle">
              Our impact is clear. VisaCoach is helping thousands achieve their travel dreams.
            </p>
          </div>

          <div className={`stats-grid ${isInView.stats ? 'in-view' : ''}`}>
            <div className="stat-card">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Visas Approved</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">97%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Countries Covered</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">4.8/5</div>
              <div className="stat-label">Average User Rating</div>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="footer">
        <div className="container footer-container">
          <div className="footer-logo">
            <img src={logoSymbol} alt="VisaCoach Logo" className="footer-logo-symbol" />
            <span className="footer-logo-text">VisaCoach</span>
          </div>
          <div className="footer-links">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Contact Us</a>
          </div>
          <div className="footer-copyright">
            &copy; 2025 VisaCoach. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
