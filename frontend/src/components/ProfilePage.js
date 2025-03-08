import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import logoSymbol from '../assets/images/logo-symbol.svg';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './ProfilePage.css';

// Register Chart.js components (add this before your component function)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, token, handleLogout } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgScore: 0,
    completedCountries: [],
    improvementRate: 0
  });

  // Use useMemo to prevent recreation of mockInterviews on every render
  const mockInterviews = useMemo(() => [
    {
      id: 1,
      date: '2024-02-15',
      country: 'United States',
      visaType: 'B1/B2 Visitor Visa',
      score: 85,
      status: 'Completed',
      strengths: ['Clear purpose of visit', 'Strong financial documentation'],
      weaknesses: ['Insufficient ties to home country']
    },
    {
      id: 2,
      date: '2024-02-10',
      country: 'Canada',
      visaType: 'Study Permit',
      score: 78,
      status: 'Completed',
      strengths: ['Educational background relevance', 'Language proficiency'],
      weaknesses: ['Vague post-study plans', 'Financing explanation']
    },
    {
      id: 3,
      date: '2024-01-28',
      country: 'United Kingdom',
      visaType: 'Standard Visitor Visa',
      score: 92,
      status: 'Completed',
      strengths: ['Travel history', 'Return intentions', 'Financial stability'],
      weaknesses: ['Minor inconsistencies in timeline']
    }
  ], []);

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch profile data');
        }
      } catch (e) {
        console.error('Error fetching profile data:', e);
      } finally {
        setIsLoading(false);
      }
    };
  
    // Fetch interview history
    const fetchInterviews = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/interviews/history', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          const interviewData = data.length > 0 ? data : mockInterviews;
          setInterviews(interviewData);
          calculateStats(interviewData);
        } else {
          setInterviews(mockInterviews);
          calculateStats(mockInterviews);
        }
      } catch (e) {
        console.error('Error fetching interview history:', e);
        setInterviews(mockInterviews);
        calculateStats(mockInterviews);
      }
    };
  
    if (token) {
      fetchUserData();
      fetchInterviews();
    }
  }, [token, mockInterviews]); // Include mockInterviews in dependencies since now it won't change

  // Calculate user statistics from interview data
  const calculateStats = (interviewData) => {
    if (!interviewData || interviewData.length === 0) {
      setStats({
        totalInterviews: 0,
        avgScore: 0,
        completedCountries: [],
        improvementRate: 0
      });
      return;
    }

    const totalInterviews = interviewData.length;
    
    // Average score calculation
    const avgScore = interviewData.reduce((sum, interview) => sum + interview.score, 0) / totalInterviews;
    
    // Unique countries
    const uniqueCountries = [...new Set(interviewData.map(interview => interview.country))];
    
    // Calculate improvement rate (comparing first and last interview scores)
    let improvementRate = 0;
    if (totalInterviews >= 2) {
      const firstInterview = interviewData[totalInterviews - 1];
      const lastInterview = interviewData[0];
      improvementRate = ((lastInterview.score - firstInterview.score) / firstInterview.score) * 100;
    }
    
    setStats({
      totalInterviews,
      avgScore: Math.round(avgScore * 10) / 10,
      completedCountries: uniqueCountries,
      improvementRate: Math.round(improvementRate)
    });
  };

  // Chart data for progress visualization
  const prepareChartData = () => {
    if (!interviews || interviews.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Interview Score',
          data: [],
          fill: false,
          backgroundColor: '#4F46E5',
          borderColor: '#4F46E5',
          tension: 0.1
        }]
      };
    }

    // Sort interviews by date (newest to oldest)
    const sortedInterviews = [...interviews].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return {
      labels: sortedInterviews.map(interview => new Date(interview.date).toLocaleDateString()),
      datasets: [{
        label: 'Interview Score',
        data: sortedInterviews.map(interview => interview.score),
        fill: false,
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
        tension: 0.1
      }]
    };
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: false,
        min: 50,
        max: 100
      }
    },
    plugins: {
      legend: {
        display: false
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  const renderProfileContent = () => (
    <div className="profile-info">
      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner-icon"></div>
          <span>Loading your profile data...</span>
        </div>
      ) : (
        <>
          <div className="profile-header">
            <div className="profile-avatar">
              {(userData?.name?.charAt(0) || user?.name?.charAt(0) || 'U').toUpperCase()}
            </div>
            <div className="profile-title">
              <h2>{userData?.name || user?.name || 'User'}</h2>
              <p className="profile-membership">
                <span className={`subscription-badge ${userData?.subscription || 'free'}`}>
                  {userData?.subscription || 'Free'} Plan
                </span>
                {(userData?.subscription !== 'Premium' && userData?.subscription !== 'premium') && (
                  <Link to="/upgrade" className="upgrade-link">
                    <span className="upgrade-icon">⭐</span>
                    Upgrade to Premium
                  </Link>
                )}
              </p>
            </div>
          </div>
          
          <div className="profile-stats-grid">
            <div className="stat-card">
              <span className="stat-value">{stats.totalInterviews}</span>
              <span className="stat-label">Interviews Completed</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.avgScore}%</span>
              <span className="stat-label">Average Score</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.completedCountries.length}</span>
              <span className="stat-label">Countries Practiced</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.improvementRate > 0 ? '+' : ''}{stats.improvementRate}%</span>
              <span className="stat-label">Improvement Rate</span>
            </div>
          </div>
          
          <div className="profile-details">
            <h3>Personal Information</h3>
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{userData?.email || user?.email || 'Not available'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Member Since</span>
              <span className="detail-value">
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Plan</span>
              <span className="detail-value">
                {userData?.subscription || 'Free'}
                {userData?.subscription !== 'Premium' && userData?.subscription !== 'premium' && (
                  <span className="plan-limit">(1/3 interviews used)</span>
                )}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Next Billing Date</span>
              <span className="detail-value">{userData?.nextBillingDate || 'N/A'}</span>
            </div>
          </div>
          
          <div className="profile-actions">
            <button className="btn btn-primary" onClick={() => navigate('/interview')}>New Interview</button>
            <button className="btn btn-outline" onClick={handleLogout}>Sign Out</button>
          </div>
        </>
      )}
    </div>
  );

  const renderInterviewsContent = () => (
    <div className="interview-history">
      <div className="interview-progress">
        <h3>Your Progress</h3>
        <div className="chart-container">
          {interviews.length > 1 ? (
            <div className="progress-chart">
              {/* Only render chart when data is ready */}
              {prepareChartData().labels.length > 0 && (
                <Line data={prepareChartData()} options={chartOptions} />
              )}
            </div>
          ) : (
            <div className="no-chart-data">
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <p>Complete more interviews to see your progress over time</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <h3>Interview History</h3>
      
      {interviews.length > 0 ? (
        <div className="interview-table">
          <div className="interview-table-header">
            <div className="interview-cell">Date</div>
            <div className="interview-cell">Country</div>
            <div className="interview-cell">Visa Type</div>
            <div className="interview-cell">Score</div>
            <div className="interview-cell">Actions</div>
          </div>
          
          {interviews.map(interview => (
            <div className="interview-row" key={interview.id}>
              <div className="interview-cell">{new Date(interview.date).toLocaleDateString()}</div>
              <div className="interview-cell">{interview.country}</div>
              <div className="interview-cell">{interview.visaType}</div>
              <div className="interview-cell">
                <div className="score-badge" style={{ backgroundColor: getScoreColor(interview.score) }}>
                  {interview.score}%
                </div>
              </div>
              <div className="interview-cell actions-cell">
                <button onClick={() => navigate(`/interview/review/${interview.id}`)} className="review-link">
                  Review
                </button>
                <button onClick={() => navigate('/interview')} className="retry-link">
                  Retry
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-interviews">
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p>You haven't completed any interview sessions yet.</p>
            <button onClick={() => navigate('/interview')} className="btn btn-primary">
              Start Your First Interview
            </button>
          </div>
        </div>
      )}
      
      {interviews.length > 0 && (
        <div className="insights-section">
          <h3>Performance Insights</h3>
          
          <div className="insights-grid">
            <div className="insight-card">
              <h4>
                <span className="insight-icon success">✓</span>
                Strongest Areas
              </h4>
              <ul className="insight-list">
                {interviews.flatMap(interview => interview.strengths || [])
                  .reduce((acc, strength) => {
                    // Count occurrences of each strength
                    const existing = acc.find(s => s.name === strength);
                    if (existing) {
                      existing.count++;
                    } else {
                      acc.push({ name: strength, count: 1 });
                    }
                    return acc;
                  }, [])
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 3)
                  .map((strength, index) => (
                    <li key={index} className="success-item">{strength.name}</li>
                  ))
                }
              </ul>
            </div>
            
            <div className="insight-card">
              <h4>
                <span className="insight-icon warning">!</span>
                Areas for Improvement
              </h4>
              <ul className="insight-list">
                {interviews.flatMap(interview => interview.weaknesses || [])
                  .reduce((acc, weakness) => {
                    // Count occurrences of each weakness
                    const existing = acc.find(w => w.name === weakness);
                    if (existing) {
                      existing.count++;
                    } else {
                      acc.push({ name: weakness, count: 1 });
                    }
                    return acc;
                  }, [])
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 3)
                  .map((weakness, index) => (
                    <li key={index} className="improvement-item">{weakness.name}</li>
                  ))
                }
              </ul>
            </div>
            
            <div className="insight-card">
              <h4>
                <span className="insight-icon info">i</span>
                Recommended Practice
              </h4>
              <div className="recommendation">
                {interviews.length > 0 && (
                  <>
                    <p className="recommendation-text">
                      Based on your history, we recommend practicing:
                    </p>
                    <button onClick={() => {
                      navigate('/interview', { 
                        state: { 
                          country: interviews[0].country, 
                          visaType: interviews[0].visaType 
                        }
                      });
                    }} className="btn btn-secondary">
                      {interviews[0].country} - {interviews[0].visaType}
                    </button>
                    <p className="recommendation-reason">
                      Focus on strengthening your ties to home country explanation.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettingsContent = () => (
    <div className="profile-settings">
      <h3>Account Settings</h3>
      
      <div className="settings-section">
        <h4>Notification Preferences</h4>
        <div className="settings-option">
          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span className="slider round"></span>
          </label>
          <span>Email notifications for new features</span>
        </div>
        <div className="settings-option">
          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span className="slider round"></span>
          </label>
          <span>Interview reminders</span>
        </div>
        <div className="settings-option">
          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span className="slider round"></span>
          </label>
          <span>Weekly progress reports</span>
        </div>
      </div>
      
      <div className="settings-section">
        <h4>Security</h4>
        <div className="settings-buttons">
          <button className="btn btn-outline">Change Password</button>
          <button className="btn btn-outline">Two-Factor Authentication</button>
        </div>
      </div>
      
      <div className="settings-section">
        <h4>Subscription Management</h4>
        {userData?.subscription === 'Premium' || userData?.subscription === 'premium' ? (
          <>
            <div className="current-plan">
              <div className="plan-info">
                <span className="plan-name">Premium Plan</span>
                <span className="plan-features">Unlimited interviews • Priority feedback • Expert tips</span>
              </div>
              <p><strong>Next Billing Date:</strong> {userData?.nextBillingDate || 'N/A'}</p>
            </div>
            <button className="btn btn-danger">Cancel Subscription</button>
          </>
        ) : (
          <div className="plan-upgrade-card">
            <div className="plan-badge">Recommended</div>
            <h5>Premium Plan</h5>
            <ul className="plan-features-list">
              <li>✓ Unlimited interview sessions</li>
              <li>✓ Advanced AI feedback</li>
              <li>✓ Document review & preparation</li>
              <li>✓ Priority support</li>
            </ul>
            <Link to="/upgrade" className="btn btn-primary btn-block">Upgrade to Premium</Link>
          </div>
        )}
      </div>
      
      <div className="settings-section">
        <h4>Data & Privacy</h4>
        <div className="settings-buttons">
          <button className="btn btn-outline">Download My Data</button>
          <button className="btn btn-danger">Delete Account</button>
        </div>
      </div>
    </div>
  );

  const renderDocumentsContent = () => (
    <div className="documents-section">
      <h3>Your Documents</h3>
      <p className="documents-intro">
        Upload and organize your visa application documents for easy reference during interviews.
      </p>
      
      <div className="document-list">
        <div className="document-card empty">
          <div className="document-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <div className="document-upload">
            <p>Upload passport or ID</p>
            <button className="btn btn-outline btn-sm">Select File</button>
          </div>
        </div>
        
        {userData?.subscription === 'Premium' || userData?.subscription === 'premium' ? (
          <>
            <div className="document-card empty">
              <div className="document-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </div>
              <div className="document-upload">
                <p>Travel itinerary</p>
                <button className="btn btn-outline btn-sm">Select File</button>
              </div>
            </div>
            <div className="document-card empty">
              <div className="document-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </div>
              <div className="document-upload">
                <p>Financial statements</p>
                <button className="btn btn-outline btn-sm">Select File</button>
              </div>
            </div>
          </>
        ) : (
          <div className="premium-document-upsell">
            <div className="upsell-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.91 8.84L8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a1.93 1.93 0 0 0-.97 1.68v4.8a1.93 1.93 0 0 0 .97 1.68l3.65 1.9"></path>
                <path d="M22 17.5a2.5 2.5 0 0 1-2.5 2.5h-9a2.5 2.5 0 0 1 0-5h9a2.5 2.5 0 0 1 2.5 2.5Z"></path>
                <path d="M15 22v-9"></path>
              </svg>
            </div>
            <div className="upsell-content">
              <h4>Premium Feature</h4>
              <p>Upgrade to Premium for document storage, organization, and analysis to improve your interview preparation.</p>
              <Link to="/upgrade" className="btn btn-primary btn-sm">Upgrade Now</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileContent();
      case 'interviews':
        return renderInterviewsContent();
      case 'settings':
        return renderSettingsContent();
      case 'documents':
        return renderDocumentsContent();
      default:
        return renderProfileContent();
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 80) return '#3B82F6'; // Blue
    if (score >= 70) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="sidebar-header">
          <img src={logoSymbol} alt="VisaCoach Logo" className="sidebar-logo" />
          <h3>My Account</h3>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Profile
          </button>
          
          <button 
            className={`sidebar-nav-item ${activeTab === 'interviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('interviews')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            Interview History
          </button>
          
          <button 
            className={`sidebar-nav-item ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Documents
          </button>
          
          <button 
            className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Settings
          </button>
        </nav>
        
        <div className="sidebar-actions">
          <button onClick={() => navigate('/interview')} className="btn btn-primary btn-block">
            New Interview
          </button>
          
          {(userData?.subscription !== 'Premium' && userData?.subscription !== 'premium') && (
            <Link to="/upgrade" className="btn btn-premium btn-block">
              <span className="premium-icon">⭐</span>
              Upgrade to Premium
            </Link>
          )}
        </div>
      </div>
      
      <div className="profile-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfilePage;