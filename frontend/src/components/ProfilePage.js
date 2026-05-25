import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../App';
import logoSymbol from '../assets/images/logo-symbol.svg';
import { API_BASE_URL } from '../services/apiConfig';
import {
  getEffectiveAnswer,
  getFactConsistencyInsights,
  getProgressInsights,
} from '../utils/practiceInsights.js';
import './ProfilePage.css';

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : 'Unknown date';
};

const getSessionScore = (session) => session.stats?.overallScore || session.score || 0;

const getSessionQuestions = (session) => session.questions || session.interviewHistory || [];

const getSessionStrengths = (session) => session.stats?.strongAreas || session.strengths || [];

const getSessionImprovements = (session) => session.stats?.improvementAreas || session.weaknesses || [];

const getSessionDateValue = (session) => {
  const date = new Date(session.date || session.savedAt || 0);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const CONTEXT_FIELD_LABELS = {
  homeCountry: 'Home country or current residence',
  institutionOrHost: 'School, employer, host, or program',
  programOrPurpose: 'Program, role, or trip purpose',
  fundingSource: 'Funding source',
  sponsorDetails: 'Sponsor or financial evidence',
  returnPlan: 'Return plan or home ties',
  importantDates: 'Important dates or timeline',
  notes: 'Application notes',
};

const CONCERN_LABELS = {
  answering: 'Answering',
  documentation: 'Documents',
  english: 'English clarity',
  nervousness: 'Nervousness',
};

const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
];

const VISA_OPTIONS = {
  US: [
    { value: 'F1', label: 'F1 Student Visa' },
    { value: 'B1/B2', label: 'B1/B2 Tourist/Business Visa' },
    { value: 'H1B', label: 'H1B Work Visa' },
    { value: 'O1', label: 'O1 Extraordinary Ability Visa' },
    { value: 'J1', label: 'J1 Exchange Visitor Visa' },
  ],
  CA: [
    { value: 'student', label: 'Student Visa' },
    { value: 'work', label: 'Work Permit' },
    { value: 'visitor', label: 'Visitor Visa' },
    { value: 'business', label: 'Business Visa' },
    { value: 'express', label: 'Express Entry' },
  ],
  UK: [
    { value: 'student', label: 'Student Visa' },
    { value: 'skilled', label: 'Skilled Worker Visa' },
    { value: 'visitor', label: 'Standard Visitor Visa' },
    { value: 'startup', label: 'Start-up Visa' },
    { value: 'family', label: 'Family Visa' },
  ],
  AU: [
    { value: 'student', label: 'Student Visa (Subclass 500)' },
    { value: 'work', label: 'Temporary Skill Shortage Visa' },
    { value: 'visitor', label: 'Visitor Visa' },
    { value: 'working-holiday', label: 'Working Holiday Visa' },
  ],
  NZ: [
    { value: 'student', label: 'Student Visa' },
    { value: 'work', label: 'Work Visa' },
    { value: 'visitor', label: 'Visitor Visa' },
  ],
  DE: [
    { value: 'student', label: 'Student Visa' },
    { value: 'work', label: 'Work Visa' },
    { value: 'jobseeker', label: 'Job Seeker Visa' },
  ],
  FR: [
    { value: 'student', label: 'Student Visa' },
    { value: 'work', label: 'Work Visa' },
    { value: 'visitor', label: 'Visitor Visa' },
  ],
  JP: [
    { value: 'student', label: 'Student Visa' },
    { value: 'work', label: 'Work Visa' },
    { value: 'tourist', label: 'Tourist Visa' },
  ],
};

const DEFAULT_PRACTICE_PROFILE = {
  destinationCountry: 'US',
  visaType: 'F1',
  sessionContext: {
    homeCountry: '',
    institutionOrHost: '',
    programOrPurpose: '',
    fundingSource: '',
    sponsorDetails: '',
    returnPlan: '',
    importantDates: '',
    notes: '',
  },
  confidence: {
    before: 5,
  },
  concerns: [],
  feedbackLevel: 'detailed',
};

const getVisaOptions = (country) => VISA_OPTIONS[country] || VISA_OPTIONS.US;

const buildPracticeProfileState = (account = {}) => {
  const savedProfile = account.practiceProfile || {};
  const destinationCountry = savedProfile.destinationCountry || 'US';
  const visaOptions = getVisaOptions(destinationCountry);
  const savedVisaType = savedProfile.visaType || account.visaType || visaOptions[0]?.value || 'F1';

  return {
    ...DEFAULT_PRACTICE_PROFILE,
    ...savedProfile,
    destinationCountry,
    visaType: visaOptions.some((option) => option.value === savedVisaType) ? savedVisaType : visaOptions[0]?.value || savedVisaType,
    sessionContext: {
      ...DEFAULT_PRACTICE_PROFILE.sessionContext,
      ...(savedProfile.sessionContext || {}),
      homeCountry: savedProfile.sessionContext?.homeCountry || account.countryOfOrigin || '',
    },
    confidence: {
      before: savedProfile.confidence?.before || 5,
    },
    concerns: Array.isArray(savedProfile.concerns) ? savedProfile.concerns : [],
    feedbackLevel: savedProfile.feedbackLevel || 'detailed',
  };
};

const hasPracticeProfileDetails = (practiceProfile = {}) => Boolean(
  practiceProfile.updatedAt ||
  practiceProfile.sessionContext?.homeCountry ||
  practiceProfile.sessionContext?.institutionOrHost ||
  practiceProfile.sessionContext?.programOrPurpose ||
  practiceProfile.sessionContext?.fundingSource ||
  practiceProfile.sessionContext?.sponsorDetails ||
  practiceProfile.sessionContext?.returnPlan ||
  practiceProfile.sessionContext?.importantDates ||
  practiceProfile.sessionContext?.notes
);

const PROFILE_COMPLETENESS_FIELDS = [
  {
    key: 'destinationCountry',
    label: 'Destination',
    getValue: (profile) => profile.destinationCountry,
  },
  {
    key: 'visaType',
    label: 'Visa type',
    getValue: (profile) => profile.visaType,
  },
  {
    key: 'homeCountry',
    label: CONTEXT_FIELD_LABELS.homeCountry,
    getValue: (profile) => profile.sessionContext?.homeCountry,
  },
  {
    key: 'institutionOrHost',
    label: CONTEXT_FIELD_LABELS.institutionOrHost,
    getValue: (profile) => profile.sessionContext?.institutionOrHost,
  },
  {
    key: 'programOrPurpose',
    label: CONTEXT_FIELD_LABELS.programOrPurpose,
    getValue: (profile) => profile.sessionContext?.programOrPurpose,
  },
  {
    key: 'fundingSource',
    label: CONTEXT_FIELD_LABELS.fundingSource,
    getValue: (profile) => profile.sessionContext?.fundingSource,
  },
  {
    key: 'returnPlan',
    label: CONTEXT_FIELD_LABELS.returnPlan,
    getValue: (profile) => profile.sessionContext?.returnPlan,
  },
];

const getPracticeProfileCompleteness = (practiceProfile = {}) => {
  const completed = PROFILE_COMPLETENESS_FIELDS.filter((field) => String(field.getValue(practiceProfile) || '').trim());
  const missing = PROFILE_COMPLETENESS_FIELDS.filter((field) => !String(field.getValue(practiceProfile) || '').trim());
  const percent = Math.round((completed.length / PROFILE_COMPLETENESS_FIELDS.length) * 100);

  return {
    completed,
    missing,
    percent,
    completedCount: completed.length,
    totalCount: PROFILE_COMPLETENESS_FIELDS.length,
    label: missing.length ? `Add ${missing.length} more detail${missing.length === 1 ? '' : 's'}` : 'Ready for personalized practice',
  };
};

const sessionMatchesSearch = (session, searchTerm) => {
  if (!searchTerm) return true;
  const questions = getSessionQuestions(session);
  const searchable = [
    session.country,
    session.visaType,
    ...Object.values(session.sessionContext || {}),
    ...questions.flatMap((item) => [
      item.question,
      item.answer,
      item.userResponse,
      item.revisedAnswer,
      item.revisedResponse,
      item.feedback,
      item.agentResponse,
    ]),
  ].filter(Boolean).join(' ').toLowerCase();

  return searchable.includes(searchTerm.toLowerCase());
};

const buildSessionSummary = (session) => {
  const questions = getSessionQuestions(session);
  const context = session.sessionContext || {};
  const contextLines = Object.entries(context)
    .filter(([, value]) => value)
    .map(([key, value]) => `- ${key}: ${value}`);
  const consistencyInsights = getFactConsistencyInsights({
    sessionContext: context,
    conversationHistory: questions,
  });
  const revisionCount = questions.filter((item) => item.revisedAnswer || item.revisedResponse).length;

  return [
    'VisaCoach Saved Session',
    `Date: ${formatDate(session.date || session.savedAt)}`,
    `Country: ${session.country || 'N/A'}`,
    `Visa type: ${session.visaType || 'N/A'}`,
    `Practice readiness: ${getSessionScore(session)}%`,
    session.confidence ? `Confidence: ${session.confidence.before || 'N/A'}/10 to ${session.confidence.after || 'N/A'}/10` : '',
    `Revised answers: ${revisionCount}`,
    contextLines.length ? '\nContext:' : '',
    ...contextLines,
    '\nStrengths:',
    ...getSessionStrengths(session).map((item) => `- ${item}`),
    '\nFocus areas:',
    ...getSessionImprovements(session).map((item) => `- ${item}`),
    '\nConsistency prep:',
    ...(consistencyInsights.gaps.length
      ? consistencyInsights.gaps.map((field) => `- Gap: ${field.gap}`)
      : ['- No obvious prepared-fact gaps from this session.']),
    '\nAnswers:',
    ...questions.flatMap((item, index) => {
      const answerLines = [
        `${index + 1}. ${item.question}`,
        `Answer: ${item.answer || item.userResponse || 'No answer saved.'}`,
      ];

      if (item.revisedAnswer || item.revisedResponse) {
        answerLines.push(`Revised answer: ${getEffectiveAnswer(item)}`);
      }

      answerLines.push(`Feedback: ${item.feedback || item.agentResponse || 'No feedback saved.'}`);
      answerLines.push('');
      return answerLines;
    }),
    'Note: This is practice support only. It is not legal advice and does not predict or guarantee a visa decision.',
  ].filter(Boolean).join('\n');
};

const ProfilePage = ({ initialTab = 'sessions' }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token, handleLogout } = useContext(UserContext);
  const practiceProfileRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accountLoadError, setAccountLoadError] = useState('');
  const [accountReloadKey, setAccountReloadKey] = useState(0);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [statusMessage, setStatusMessage] = useState('');
  const [deletingSessionId, setDeletingSessionId] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isExportingAccount, setIsExportingAccount] = useState(false);
  const [sessionSearch, setSessionSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [visaFilter, setVisaFilter] = useState('all');
  const [sessionSort, setSessionSort] = useState('newest');
  const [practiceProfile, setPracticeProfile] = useState(() => buildPracticeProfileState(user || {}));
  const [isSavingPracticeProfile, setIsSavingPracticeProfile] = useState(false);
  const [isFirstRunPromptDismissed, setIsFirstRunPromptDismissed] = useState(() => (
    localStorage.getItem('visaCoach:firstRunProfilePromptDismissed') === 'true'
  ));

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (userData || user) {
      setPracticeProfile(buildPracticeProfileState(userData || user));
    }
  }, [userData, user]);

  useEffect(() => {
    const fetchAccount = async () => {
      setIsLoading(true);
      setStatusMessage('');
      setAccountLoadError('');

      try {
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, historyResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/auth/profile`, { headers }),
          fetch(`${API_BASE_URL}/api/interview/history`, { headers }),
        ]);

        let profileLoaded = false;
        let historyLoaded = false;
        const authExpired = [profileResponse.status, historyResponse.status].some((status) => status === 401 || status === 403);

        if (profileResponse.ok) {
          setUserData(await profileResponse.json());
          profileLoaded = true;
        }

        if (historyResponse.ok) {
          const history = await historyResponse.json();
          setSessions(Array.isArray(history) ? history.reverse() : []);
          historyLoaded = true;
        }

        if (!profileLoaded && !historyLoaded) {
          setAccountLoadError(authExpired
            ? 'Your sign-in could not be verified. Sign out, then sign in again.'
            : 'We could not load your account data. Check your connection and try again.');
        } else if (!profileLoaded) {
          setStatusMessage('Profile details could not be loaded. Showing saved browser info.');
        } else if (!historyLoaded) {
          setStatusMessage('Saved sessions could not be loaded.');
        }
      } catch (error) {
        console.error('Error loading account:', error);
        setAccountLoadError('We could not load your account data. Check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchAccount();
    }
  }, [accountReloadKey, token]);

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

  const progressInsights = useMemo(() => getProgressInsights(sessions), [sessions]);

  const filterOptions = useMemo(() => ({
    countries: [...new Set(sessions.map((session) => session.country).filter(Boolean))].sort(),
    visaTypes: [...new Set(sessions.map((session) => session.visaType).filter(Boolean))].sort(),
  }), [sessions]);

  const filteredSessions = useMemo(() => {
    const filtered = sessions.filter((session) => (
      (countryFilter === 'all' || session.country === countryFilter) &&
      (visaFilter === 'all' || session.visaType === visaFilter) &&
      sessionMatchesSearch(session, sessionSearch.trim())
    ));

    return [...filtered].sort((a, b) => {
      if (sessionSort === 'score') return getSessionScore(b) - getSessionScore(a);
      if (sessionSort === 'oldest') return getSessionDateValue(a) - getSessionDateValue(b);
      return getSessionDateValue(b) - getSessionDateValue(a);
    });
  }, [countryFilter, sessionSearch, sessionSort, sessions, visaFilter]);

  const profileCompleteness = useMemo(() => getPracticeProfileCompleteness(practiceProfile), [practiceProfile]);
  const isSetupRoute = searchParams.get('setup') === '1';
  const hasSavedPracticeProfile = hasPracticeProfileDetails(userData?.practiceProfile);
  const shouldShowFirstRunPrompt = activeTab === 'profile' && !isLoading && !hasSavedPracticeProfile && (
    isSetupRoute || (!isFirstRunPromptDismissed && stats.totalSessions === 0)
  );

  const clearSetupSearchParam = () => {
    if (!isSetupRoute) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('setup');
    setSearchParams(nextParams, { replace: true });
  };

  const handleDismissFirstRunPrompt = () => {
    localStorage.setItem('visaCoach:firstRunProfilePromptDismissed', 'true');
    setIsFirstRunPromptDismissed(true);
    clearSetupSearchParam();
  };

  const handleRetryAccountLoad = () => {
    setAccountReloadKey((currentKey) => currentKey + 1);
  };

  const handleFocusPracticeProfile = () => {
    practiceProfileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    clearSetupSearchParam();
  };

  const handleCopySession = async (session) => {
    try {
      await navigator.clipboard.writeText(buildSessionSummary(session));
      setStatusMessage('Session summary copied.');
    } catch (error) {
      console.error('Unable to copy saved session:', error);
      setStatusMessage('Clipboard was unavailable.');
    }
  };

  const handleDeleteSession = async (session) => {
    const savedSessionId = session.sessionId || session._id;

    if (!savedSessionId) {
      setStatusMessage('This saved session cannot be deleted because it is missing an ID.');
      return;
    }

    const confirmed = window.confirm('Delete this saved practice session? This cannot be undone.');
    if (!confirmed) return;

    setDeletingSessionId(savedSessionId);
    setStatusMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/interview/history/${encodeURIComponent(savedSessionId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Delete failed');
      }

      setSessions((currentSessions) => currentSessions.filter((item) => (
        item.sessionId !== savedSessionId && item._id !== savedSessionId
      )));
      setStatusMessage('Saved session deleted.');

      try {
        const lastSession = JSON.parse(localStorage.getItem('visaCoach:lastSession') || '{}');
        if (lastSession.sessionId === savedSessionId) {
          localStorage.removeItem('visaCoach:lastSession');
        }
      } catch (error) {
        console.error('Unable to clear deleted local session:', error);
      }
    } catch (error) {
      console.error('Unable to delete saved session:', error);
      setStatusMessage('Saved session could not be deleted.');
    } finally {
      setDeletingSessionId('');
    }
  };

  const handlePracticeAgain = (session) => {
    if (session.country && session.visaType) {
      localStorage.setItem('visaCoach:practiceDraft', JSON.stringify({
        country: session.country,
        visaType: session.visaType,
        sessionContext: session.sessionContext || {},
        confidence: session.confidence || {},
        concerns: Array.isArray(session.concerns) ? session.concerns : [],
        feedbackLevel: session.feedbackLevel || 'detailed',
      }));
    }

    navigate('/interview');
  };

  const handlePracticeProfileCountryChange = (destinationCountry) => {
    const visaOptions = getVisaOptions(destinationCountry);
    setPracticeProfile((currentProfile) => ({
      ...currentProfile,
      destinationCountry,
      visaType: visaOptions[0]?.value || currentProfile.visaType,
    }));
  };

  const handlePracticeProfileContextChange = (field, value) => {
    setPracticeProfile((currentProfile) => ({
      ...currentProfile,
      sessionContext: {
        ...currentProfile.sessionContext,
        [field]: value,
      },
    }));
  };

  const handlePracticeProfileConcernToggle = (concern) => {
    setPracticeProfile((currentProfile) => ({
      ...currentProfile,
      concerns: currentProfile.concerns.includes(concern)
        ? currentProfile.concerns.filter((item) => item !== concern)
        : [...currentProfile.concerns, concern],
    }));
  };

  const handleSavePracticeProfile = async () => {
    setIsSavingPracticeProfile(true);
    setStatusMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ practiceProfile }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Save failed');
      }

      const data = await response.json();
      setPracticeProfile(buildPracticeProfileState({ practiceProfile: data.practiceProfile }));
      setUserData((currentData) => ({
        ...(currentData || user || {}),
        practiceProfile: data.practiceProfile,
        countryOfOrigin: data.practiceProfile?.sessionContext?.homeCountry || currentData?.countryOfOrigin,
        visaType: data.practiceProfile?.visaType || currentData?.visaType,
      }));
      localStorage.setItem('visaCoach:firstRunProfilePromptDismissed', 'true');
      setIsFirstRunPromptDismissed(true);
      clearSetupSearchParam();
      setStatusMessage('Practice profile saved.');
    } catch (error) {
      console.error('Unable to save practice profile:', error);
      setStatusMessage('Practice profile could not be saved.');
    } finally {
      setIsSavingPracticeProfile(false);
    }
  };

  const handleStartProfilePractice = () => {
    localStorage.setItem('visaCoach:practiceDraft', JSON.stringify({
      country: practiceProfile.destinationCountry,
      visaType: practiceProfile.visaType,
      sessionContext: practiceProfile.sessionContext || {},
      confidence: practiceProfile.confidence || {},
      concerns: practiceProfile.concerns || [],
      feedbackLevel: practiceProfile.feedbackLevel || 'detailed',
    }));
    navigate('/interview');
  };

  const handleExportData = async () => {
    const fallbackExportData = {
      exportedAt: new Date().toISOString(),
      profile: userData || user || null,
      sessionCount: sessions.length,
      sessions,
    };

    setIsExportingAccount(true);
    setStatusMessage('');

    try {
      let exportData = fallbackExportData;
      let usedLocalFallback = false;

      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/export`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            exportData = await response.json();
          } else {
            usedLocalFallback = true;
          }
        } catch (error) {
          console.error('Unable to fetch server account export:', error);
          usedLocalFallback = true;
        }
      }

      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      setStatusMessage(usedLocalFallback ? 'Account data copied from local cache.' : 'Account data copied.');
    } catch (error) {
      console.error('Unable to copy account data:', error);
      localStorage.setItem('visaCoach:accountExport', JSON.stringify(fallbackExportData));
      setStatusMessage('Export was saved locally because copy was unavailable.');
    } finally {
      setIsExportingAccount(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Delete your VisaCoach account and all saved sessions? This cannot be undone.');
    if (!confirmed) return;

    setIsDeletingAccount(true);
    setStatusMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Delete failed');
      }

      localStorage.removeItem('visaCoach:lastSession');
      localStorage.removeItem('visaCoach:practiceDraft');
      localStorage.removeItem('visaCoach:accountExport');
      handleLogout();
      window.location.replace('/');
    } catch (error) {
      console.error('Unable to delete account:', error);
      setStatusMessage('Account could not be deleted.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const renderFirstRunPrompt = () => (
    <div className="first-run-profile-card">
      <div>
        <span className="first-run-kicker">First setup</span>
        <h3>Set your practice defaults</h3>
        <p>Choose your visa path and add the facts you want reused in practice.</p>
      </div>
      <div className="first-run-actions">
        <button className="btn btn-primary" onClick={handleFocusPracticeProfile}>Set Defaults</button>
        <button className="btn btn-outline" onClick={handleStartProfilePractice}>Start With Defaults</button>
        <button className="btn btn-link" onClick={handleDismissFirstRunPrompt}>Dismiss</button>
      </div>
    </div>
  );

  const renderPracticeProfile = () => (
    <div className="practice-profile-card" ref={practiceProfileRef}>
      <div className="section-heading">
        <div>
          <h3>Practice Profile</h3>
          <p className="section-subtitle">Saved defaults for your next interview setup.</p>
        </div>
        <button className="btn btn-primary" onClick={handleStartProfilePractice}>Start Practice</button>
      </div>

      <div className="practice-profile-summary" aria-label="Practice profile completeness">
        <div className="profile-completeness-header">
          <div>
            <span className="profile-summary-kicker">Personalization</span>
            <h4>{profileCompleteness.label}</h4>
            <p>
              These details prefill setup and help personalize your next question set and feedback.
            </p>
          </div>
          <strong>{profileCompleteness.completedCount}/{profileCompleteness.totalCount}</strong>
        </div>
        <div
          className="profile-completeness-bar"
          role="progressbar"
          aria-label="Practice profile completeness"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={profileCompleteness.percent}
        >
          <span style={{ width: `${profileCompleteness.percent}%` }}></span>
        </div>
        <div className="profile-summary-lists">
          <div>
            <span>Will prefill</span>
            <div className="profile-summary-chips">
              {profileCompleteness.completed.map((field) => (
                <span className="summary-chip ready" key={field.key}>{field.label}</span>
              ))}
            </div>
          </div>
          {profileCompleteness.missing.length > 0 && (
            <div>
              <span>Still useful to add</span>
              <div className="profile-summary-chips">
                {profileCompleteness.missing.map((field) => (
                  <span className="summary-chip missing" key={field.key}>{field.label}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="practice-profile-form">
        <label>
          <span>Destination</span>
          <select
            value={practiceProfile.destinationCountry}
            onChange={(event) => handlePracticeProfileCountryChange(event.target.value)}
          >
            {COUNTRY_OPTIONS.map((country) => (
              <option key={country.value} value={country.value}>{country.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Visa type</span>
          <select
            value={practiceProfile.visaType}
            onChange={(event) => setPracticeProfile((currentProfile) => ({
              ...currentProfile,
              visaType: event.target.value,
            }))}
          >
            {getVisaOptions(practiceProfile.destinationCountry).map((visa) => (
              <option key={visa.value} value={visa.value}>{visa.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span>{CONTEXT_FIELD_LABELS.homeCountry}</span>
          <input
            type="text"
            value={practiceProfile.sessionContext.homeCountry}
            onChange={(event) => handlePracticeProfileContextChange('homeCountry', event.target.value)}
            placeholder="Ghana"
          />
        </label>

        <label>
          <span>{CONTEXT_FIELD_LABELS.institutionOrHost}</span>
          <input
            type="text"
            value={practiceProfile.sessionContext.institutionOrHost}
            onChange={(event) => handlePracticeProfileContextChange('institutionOrHost', event.target.value)}
            placeholder="University, employer, host, or program"
          />
        </label>

        <label>
          <span>{CONTEXT_FIELD_LABELS.programOrPurpose}</span>
          <input
            type="text"
            value={practiceProfile.sessionContext.programOrPurpose}
            onChange={(event) => handlePracticeProfileContextChange('programOrPurpose', event.target.value)}
            placeholder="MS Computer Science"
          />
        </label>

        <label>
          <span>{CONTEXT_FIELD_LABELS.fundingSource}</span>
          <input
            type="text"
            value={practiceProfile.sessionContext.fundingSource}
            onChange={(event) => handlePracticeProfileContextChange('fundingSource', event.target.value)}
            placeholder="Family sponsor, savings, scholarship"
          />
        </label>

        <label>
          <span>{CONTEXT_FIELD_LABELS.sponsorDetails}</span>
          <input
            type="text"
            value={practiceProfile.sessionContext.sponsorDetails}
            onChange={(event) => handlePracticeProfileContextChange('sponsorDetails', event.target.value)}
            placeholder="Parent sponsor, bank statements, scholarship letter"
          />
        </label>

        <label className="profile-field-wide">
          <span>{CONTEXT_FIELD_LABELS.returnPlan}</span>
          <input
            type="text"
            value={practiceProfile.sessionContext.returnPlan}
            onChange={(event) => handlePracticeProfileContextChange('returnPlan', event.target.value)}
            placeholder="Job, family, business, property, or career plan at home"
          />
        </label>

        <label className="profile-field-wide">
          <span>{CONTEXT_FIELD_LABELS.importantDates}</span>
          <input
            type="text"
            value={practiceProfile.sessionContext.importantDates}
            onChange={(event) => handlePracticeProfileContextChange('importantDates', event.target.value)}
            placeholder="Program start date, trip duration, expected return timeline"
          />
        </label>

        <label className="profile-field-wide">
          <span>{CONTEXT_FIELD_LABELS.notes}</span>
          <textarea
            value={practiceProfile.sessionContext.notes}
            onChange={(event) => handlePracticeProfileContextChange('notes', event.target.value)}
            placeholder="Short SOP, resume, DS-160, or application notes"
            rows="3"
          />
        </label>
      </div>

      <div className="practice-profile-controls">
        <label className="profile-confidence">
          <span>Starting confidence: {practiceProfile.confidence.before}/10</span>
          <input
            type="range"
            min="1"
            max="10"
            value={practiceProfile.confidence.before}
            onChange={(event) => setPracticeProfile((currentProfile) => ({
              ...currentProfile,
              confidence: { before: parseInt(event.target.value, 10) },
            }))}
          />
        </label>

        <label>
          <span>Feedback style</span>
          <select
            value={practiceProfile.feedbackLevel}
            onChange={(event) => setPracticeProfile((currentProfile) => ({
              ...currentProfile,
              feedbackLevel: event.target.value,
            }))}
          >
            <option value="brief">Brief</option>
            <option value="detailed">Detailed</option>
            <option value="realistic">Realistic</option>
          </select>
        </label>
      </div>

      <div className="profile-concerns">
        <span>Focus areas</span>
        <div className="profile-concern-options">
          {Object.entries(CONCERN_LABELS).map(([value, label]) => (
            <label key={value}>
              <input
                type="checkbox"
                checked={practiceProfile.concerns.includes(value)}
                onChange={() => handlePracticeProfileConcernToggle(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="profile-actions">
        <button className="btn btn-primary" onClick={handleSavePracticeProfile} disabled={isSavingPracticeProfile}>
          {isSavingPracticeProfile ? 'Saving...' : 'Save Practice Profile'}
        </button>
        <button className="btn btn-outline" onClick={handleStartProfilePractice}>Start Practice</button>
      </div>
    </div>
  );

  const renderProgressDashboard = () => {
    const feedbackSources = Object.entries(progressInsights.feedbackSourceCounts);
    const questionSources = Object.entries(progressInsights.questionSourceCounts);

    return (
      <section className="progress-dashboard">
        <div className="section-heading">
          <div>
            <h3>Progress</h3>
            <p className="section-subtitle">Signals from saved sessions, not a visa outcome prediction.</p>
          </div>
        </div>

        <div className="progress-grid">
          <div className="progress-card">
            <span>Average readiness</span>
            <strong>{progressInsights.averageScore || stats.averageScore}%</strong>
            <p>Across {stats.totalSessions} saved session{stats.totalSessions === 1 ? '' : 's'}.</p>
          </div>
          <div className="progress-card">
            <span>Confidence change</span>
            <strong>{progressInsights.averageConfidenceDelta > 0 ? '+' : ''}{progressInsights.averageConfidenceDelta}</strong>
            <p>Average before-to-after self assessment.</p>
          </div>
          <div className="progress-card">
            <span>Revisions saved</span>
            <strong>{progressInsights.totalRevisions}</strong>
            <p>{progressInsights.sessionsWithRevisions} session{progressInsights.sessionsWithRevisions === 1 ? '' : 's'} include revised answers.</p>
          </div>
        </div>

        <div className="progress-detail-grid">
          <div className="progress-detail-card">
            <h4>Recurring Focus Areas</h4>
            {progressInsights.recurringImprovements.length ? (
              <ul>
                {progressInsights.recurringImprovements.map((item) => (
                  <li key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.count}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No recurring focus areas yet. Complete more saved sessions to see patterns.</p>
            )}
          </div>
          <div className="progress-detail-card">
            <h4>Source History</h4>
            <div className="source-history">
              <div>
                <span>Feedback</span>
                {feedbackSources.length ? feedbackSources.map(([source, count]) => (
                  <p key={source}>{source}: {count}</p>
                )) : <p>No feedback saved yet.</p>}
              </div>
              <div>
                <span>Questions</span>
                {questionSources.length ? questionSources.map(([source, count]) => (
                  <p key={source}>{source}: {count}</p>
                )) : <p>No question-source data yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
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

      {shouldShowFirstRunPrompt && renderFirstRunPrompt()}

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

      {renderProgressDashboard()}

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

      {renderPracticeProfile()}

      <div className="profile-actions">
        <button className="btn btn-primary" onClick={handleStartProfilePractice}>Start Practice With Profile</button>
        <button className="btn btn-outline" onClick={handleLogout}>Sign Out</button>
      </div>
    </section>
  );

  const renderSessions = () => (
    <section className="interview-history">
      <div className="section-heading">
        <h3>Saved Sessions</h3>
        <button className="btn btn-primary" onClick={handleStartProfilePractice}>New Practice Session</button>
      </div>

      {sessions.length ? (
        <>
          <div className="session-toolbar">
            <label className="session-search">
              <span>Search</span>
              <input
                type="search"
                value={sessionSearch}
                onChange={(event) => setSessionSearch(event.target.value)}
                placeholder="Search sessions"
              />
            </label>
            <label>
              <span>Country</span>
              <select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)}>
                <option value="all">All countries</option>
                {filterOptions.countries.map((country) => (
                  <option value={country} key={country}>{country}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Visa</span>
              <select value={visaFilter} onChange={(event) => setVisaFilter(event.target.value)}>
                <option value="all">All visas</option>
                {filterOptions.visaTypes.map((visaType) => (
                  <option value={visaType} key={visaType}>{visaType}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Sort</span>
              <select value={sessionSort} onChange={(event) => setSessionSort(event.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="score">Highest score</option>
              </select>
            </label>
          </div>

          {filteredSessions.length ? (
            <div className="saved-session-list">
              {filteredSessions.map((session, index) => {
                const questions = getSessionQuestions(session);
                const strengths = getSessionStrengths(session);
                const improvements = getSessionImprovements(session);
                const revisionCount = questions.filter((item) => item.revisedAnswer || item.revisedResponse).length;
                const consistency = getFactConsistencyInsights({
                  sessionContext: session.sessionContext || {},
                  conversationHistory: questions,
                });

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
                      <div>
                        <span>Revisions</span>
                        <p>{revisionCount} answer{revisionCount === 1 ? '' : 's'}</p>
                      </div>
                      <div>
                        <span>Fact coverage</span>
                        <p>{consistency.preparedFacts.length ? `${consistency.coveredFacts.length}/${consistency.preparedFacts.length} prepared facts` : 'No facts prepared'}</p>
                      </div>
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
                          {(item.revisedAnswer || item.revisedResponse) && (
                            <div className="session-revised-answer">
                              <span>Revised answer</span>
                              <p>{getEffectiveAnswer(item)}</p>
                            </div>
                          )}
                          <small>{item.feedback || item.agentResponse || 'No feedback saved.'}</small>
                        </div>
                      ))}
                    </details>

                    <div className="session-actions">
                      <button className="btn btn-outline" onClick={() => handleCopySession(session)}>Copy Summary</button>
                      <button className="btn btn-primary" onClick={() => handlePracticeAgain(session)}>Practice Again</button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteSession(session)}
                        disabled={deletingSessionId === (session.sessionId || session._id)}
                      >
                        {deletingSessionId === (session.sessionId || session._id) ? 'Deleting...' : 'Delete Session'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="no-interviews">
              <div className="empty-state">
                <h4>No matching sessions</h4>
                <p>Adjust your search or filters.</p>
                <button
                  onClick={() => {
                    setSessionSearch('');
                    setCountryFilter('all');
                    setVisaFilter('all');
                    setSessionSort('newest');
                  }}
                  className="btn btn-outline"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="no-interviews">
          <div className="empty-state">
            <h4>No saved sessions yet</h4>
            <p>Complete a practice session while signed in and it will appear here.</p>
            <button onClick={handleStartProfilePractice} className="btn btn-primary">
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
          <button className="btn btn-primary" onClick={handleExportData} disabled={isExportingAccount}>
            {isExportingAccount ? 'Copying...' : 'Copy Account Data'}
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/history')}>View Saved Sessions</button>
          <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={isDeletingAccount}>
            {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
          </button>
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

    if (accountLoadError) {
      return (
        <div className="account-error-state">
          <h3>Account data unavailable</h3>
          <p>{accountLoadError}</p>
          <div className="account-error-actions">
            <button className="btn btn-primary" onClick={handleRetryAccountLoad}>Try Again</button>
            <button className="btn btn-outline" onClick={handleLogout}>Sign Out</button>
          </div>
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
            onClick={() => navigate('/history')}
          >
            Saved Sessions
          </button>
          <button
            className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => navigate('/profile')}
          >
            Profile
          </button>
          <button
            className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
          >
            Settings
          </button>
        </nav>

        <div className="sidebar-actions">
          <button onClick={handleStartProfilePractice} className="btn btn-primary btn-block">
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
