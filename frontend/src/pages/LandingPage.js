import React, { useState } from 'react';
import GoogleAuth from '../components/GoogleAuth';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/interview'); // Redirect to interview page after login
  };

  const handleLoginError = (error) => {
    setLoginError(error);
  };

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1>Ace Your Visa Interview</h1>
        <p className="tagline">Prepare with confidence. Get personalized feedback and practice to succeed in your visa interview.</p>
        <div className="features">
          <div className="feature">
            <h3>Realistic Simulation</h3>
            <p>Experience a true-to-life visa interview setting.</p>
          </div>
          <div className="feature">
            <h3>AI-Powered Feedback</h3>
            <p>Get instant feedback to refine your responses.</p>
          </div>
          <div className="feature">
            <h3>Anytime, Anywhere</h3>
            <p>Practice on your own schedule, from any device.</p>
          </div>
        </div>
        <div className="cta-section">
          {loginError && <p className="error-message">{loginError}</p>}
          <GoogleAuth onLoginSuccess={handleLogin} onLoginError={handleLoginError} />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
