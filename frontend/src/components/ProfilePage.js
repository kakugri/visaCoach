import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import logoSymbol from '../assets/images/logo-symbol.svg';
import { API_BASE_URL } from '../services/apiConfig';
import './ProfilePage.css';

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : 'Unknown date';
};

const getSessionScore = (session) => session.stats?.overallScore || session.score || 0;

const getSessionQuestions = (session) => session.questions || session.interviewHistory || [];

const getSessionStrengths = (session) => session.stats?.strongAreas || session.strengths || [];

const getSessionImprovements = (session) => session.stats?.improvementAreas || session.weaknesses || [];

const buildSessionSummary = (session) => {
  const questions = getSessionQuestions(session);
  const context = session.sessionContext || {};
  const contextLines = Object.entries(context)
    .filter(([, value]) => value)
    .map(([key, value]) => `- ${key}: ${value}`);

  return [
    'VisaCoach Saved Session',
    `Date: ${formatDate(session.date || session.savedAt)}`,
    `Country: ${session.country || 'N/A'}`,
    `Visa type: ${session.visaType || 'N/A'}`,
    `Practice readiness: ${getSessionScore(session)}%`,
    session.confidence ? `Confidence: ${session.confidence.before || 'N/A'}/10 to ${session.confidence.after || 'N/A'}/10` : '',
    contextLines.length ? '\nContext:' : '',
    ...contextLines,
    '\nStrengths:',
    ...getSessionStrengths(session).map((item) => `- ${item}`),
    '\nFocus areas:',
    ...getSessionImprovements(session).map((item) => `- ${item}`),
    '\nAnswers:',
    ...questions.flatMap((item, index) => [
      `${index + 1}. ${item.question}`,
      `Answer: ${item.answer || item.userResponse || 'No answer saved.'}`,
      `Feedback: ${item.feedback || item.agentResponse || 'No feedback saved.'}`,
      '',
    ]),
    'Note: This is practice support only. It is not legal advice and does not predict or guarantee a visa decision.',
  ].filter(Boolean).join('\n');
};

const ProfilePage = ({ initialTab = 'sessions' }) => {
  const navigate = useNavigate();
  const { user, token, handleLogout } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const fetchAccount = async () => {
      setIsLoading(true);
      setStatusMessage('');

      try {
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, historyResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/auth/profile`, { headers }),
          fetch(`${API_BASE_URL}/api/interview/history`, { headers }),
        ]);

        if (profileResponse.ok) {
          setUserData(await profileResponse.json());
        }

        if (historyResponse.ok) {
          const history = await historyResponse.json();
          setSessions(Array.isArray(history) ? history.reverse() : []);
        } else {
          setStatusMessage('Saved sessions could not be loaded.');
        }
      } catch (error) {
        console.error('Error loading account:', error);
        setStatusMessage('Saved sessions could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchAccount();
    }
  }, [token]);

  const stats = useMemo(() => {
    const scoredSessions = sessions.filter((session) => getSessionScore(session));
    const countries = [...new Set(sessions.map((session) => session.country).filter(Boolean))];
    const averageScore = scoredSessions.length
      ? Math.round(scoredSessions.reduce((sum, session) => sum + getSessionScore(session), 0) / scoredSessions.length)
      : 0;

    return {
      totalSessions: sessions.length,
      averageScore,
      countries,
      questionsAnswered: sessions.reduce((sum, session) => sum + getSessionQuestions(session).length, 0),
    };
  }, [sessions]);

  const handleCopySession = async (session) => {
    try {
      await navigator.clipboard.writeText(buildSessionSummary(session));
      setStatusMessage('Session summary copied.');
    } catch (error) {
      console.error('Unable to copy saved session:', error);
      setStatusMessage('Clipboard was unavailable.');
    }
  };

  const renderProfile = () => (
    <section className="profile-info">
      <div className="profile-header">
        <div className="profile-avatar">
          {(userData?.name?.charAt(0) || user?.name?.charAt(0) || 'U').toUpperCase()}
        </div>
        <div className="profile-title">
          <h2>{userData?.name || user?.name || 'User'}</h2>
          <p className="profile-membership">{userData?.email || user?.email || 'Signed in'}</p>
        </div>
      </div>

      <div className="profile-stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.totalSessions}</span>
          <span className="stat-label">Saved Sessions</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.averageScore}%</span>
          <span className="stat-label">Average Readiness</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.countries.length}</span>
          <span className="stat-label">Countries Practiced</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.questionsAnswered}</span>
          <span className="stat-label">Answers Saved</span>
        </div>
      </div>

      <div className="profile-details">
        <h3>Account</h3>
        <div className="detail-row">
          <span className="detail-label">Email</span>
          <span className="detail-value">{userData?.email || user?.email || 'Not available'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Member since</span>
          <span className="detail-value">{formatDate(userData?.createdAt)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Last login</span>
          <span className="detail-value">{formatDate(userData?.lastLogin)}</span>
        </div>
      </div>

      <div className="profile-actions">
        <button className="btn btn-primary" onClick={() => navigate('/interview')}>New Practice Session</button>
        <button className="btn btn-outline" onClick={handleLogout}>Sign Out</button>
      </div>
    </section>
  );

  const renderSessions = () => (
    <section className="interview-history">
      <div className="section-heading">
        <h3>Saved Sessions</h3>
        <button className="btn btn-primary" onClick={() => navigate('/interview')}>New Practice Session</button>
      </div>

      {sessions.length ? (
        <div className="saved-session-list">
          {sessions.map((session, index) => {
            const questions = getSessionQuestions(session);
            const strengths = getSessionStrengths(session);
            const improvements = getSessionImprovements(session);

            return (
              <article className="saved-session-card" key={session._id || index}>
                <div className="saved-session-header">
                  <div>
                    <h4>{session.country || 'Visa'} {session.visaType || 'Practice'}</h4>
                    <p>{formatDate(session.date || session.savedAt)} · {questions.length} answers</p>
                  </div>
                  <span className="score-badge">{getSessionScore(session)}%</span>
                </div>

                <div className="session-meta-grid">
                  {session.sessionContext?.homeCountry && (
                    <div>
                      <span>Home context</span>
                      <p>{session.sessionContext.homeCountry}</p>
                    </div>
                  )}
                  {session.sessionContext?.programOrPurpose && (
                    <div>
                      <span>Purpose</span>
                      <p>{session.sessionContext.programOrPurpose}</p>
                    </div>
                  )}
                  {session.confidence && (
                    <div>
                      <span>Confidence</span>
                      <p>{session.confidence.before || 'N/A'}/10 to {session.confidence.after || 'N/A'}/10</p>
                    </div>
                  )}
                </div>

                <div className="session-insights">
                  <div>
                    <h5>Strengths</h5>
                    <ul>
                      {(strengths.length ? strengths : ['Session completed']).slice(0, 3).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5>Focus Areas</h5>
                    <ul>
                      {(improvements.length ? improvements : ['Keep practicing with concrete answers']).slice(0, 3).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <details className="session-answers">
                  <summary>Review answers</summary>
                  {questions.map((item, questionIndex) => (
                    <div className="session-answer" key={`${item.question}-${questionIndex}`}>
                      <strong>{item.question}</strong>
                      <p>{item.answer || item.userResponse || 'No answer saved.'}</p>
                      <small>{item.feedback || item.agentResponse || 'No feedback saved.'}</small>
                    </div>
                  ))}
                </details>

                <div className="session-actions">
                  <button className="btn btn-outline" onClick={() => handleCopySession(session)}>Copy Summary</button>
                  <button className="btn btn-primary" onClick={() => navigate('/interview')}>Practice Again</button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="no-interviews">
          <div className="empty-state">
            <h4>No saved sessions yet</h4>
            <p>Complete a practice session while signed in and it will appear here.</p>
            <button onClick={() => navigate('/interview')} className="btn btn-primary">
              Start Practice
            </button>
          </div>
        </div>
      )}
    </section>
  );

  const renderSettings = () => (
    <section className="profile-settings">
      <h3>Settings</h3>
      <div className="settings-section">
        <h4>Data</h4>
        <p>Your saved sessions include practice answers, AI feedback, context you entered, and readiness summaries.</p>
        <div className="settings-buttons">
          <button className="btn btn-outline" onClick={() => setActiveTab('sessions')}>View Saved Sessions</button>
          <button className="btn btn-outline" onClick={handleLogout}>Sign Out</button>
        </div>
      </div>
    </section>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-spinner">
          <div className="spinner-icon"></div>
          <span>Loading account...</span>
        </div>
      );
    }

    if (activeTab === 'profile') return renderProfile();
    if (activeTab === 'settings') return renderSettings();
    return renderSessions();
  };

  return (
    <div className="profile-container">
      <aside className="profile-sidebar">
        <div className="sidebar-header">
          <img src={logoSymbol} alt="VisaCoach Logo" className="sidebar-logo" />
          <h3>My Account</h3>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            Saved Sessions
          </button>
          <button
            className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </nav>

        <div className="sidebar-actions">
          <button onClick={() => navigate('/interview')} className="btn btn-primary btn-block">
            New Practice Session
          </button>
        </div>
      </aside>

      <main className="profile-content">
        {statusMessage && <p className="profile-status">{statusMessage}</p>}
        {renderContent()}
      </main>
    </div>
  );
};

export default ProfilePage;
