import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { aiInterviewService } from '../services/aiInterviewService.js';
import { trackEvent } from '../services/analytics.js';
import {
  buildPracticeSummary,
  CONTEXT_FIELD_LABELS,
  getStructuredFeedbackRows,
} from '../utils/interviewSummary.js';
import './InterviewScreen.css';

const SESSION_QUESTION_LIMIT = 5;
const AUTO_ADVANCE_DELAY_MS = 900;
const DEFAULT_SESSION_CONTEXT = {
  homeCountry: '',
  institutionOrHost: '',
  programOrPurpose: '',
  fundingSource: '',
  returnPlan: '',
  notes: '',
};

const DEFAULT_GENERAL_TIPS = [
  'Answer truthfully and keep each response focused.',
  'Use concrete facts that match your forms and documents.',
  'Pause briefly before answering if you need to organize your thoughts.',
];

const DEFAULT_SPECIFIC_TIPS = [
  'Know why this destination and visa path fit your plan.',
  'Be ready to explain funding, purpose, and plans after the visa period.',
];

const DEFAULT_COMMON_MISTAKES = [
  'Giving very short or vague answers.',
  'Saying something that conflicts with your application materials.',
];

function renderInlineMarkdown(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function FormattedFeedback({ text }) {
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="formatted-feedback">
      {lines.map((line, index) => {
        const bullet = line.match(/^[-*]\s+(.*)/);
        const numbered = line.match(/^\d+\.\s+(.*)/);
        const content = bullet?.[1] || numbered?.[1] || line;

        return (
          <div
            className={`feedback-line ${bullet || numbered ? 'feedback-list-line' : ''}`}
            key={`${content}-${index}`}
          >
            {(bullet || numbered) && <span className="feedback-dot"></span>}
            <span>{renderInlineMarkdown(content)}</span>
          </div>
        );
      })}
    </div>
  );
}

function StructuredFeedback({ feedback, fallbackText, brief }) {
  if (!feedback) {
    return <FormattedFeedback text={brief ? `${fallbackText.split('.')[0]}.` : fallbackText} />;
  }

  const rows = getStructuredFeedbackRows(feedback, { brief });

  return (
    <div className="structured-feedback">
      {rows.map(([label, value]) => (
        <div className="structured-feedback-row" key={label}>
          <span>{label}</span>
          <p>{value}</p>
        </div>
      ))}
    </div>
  );
}

const getQuestionSetNotice = (questionSetMeta) => {
  if (questionSetMeta.source === 'gemini' || questionSetMeta.sourceReason === 'static') {
    return '';
  }

  if (questionSetMeta.sourceReason === 'quota' || questionSetMeta.sourceReason === 'quota_cooldown') {
    return 'Personalized questions are cooling down because Gemini quota was reached. Using the built-in question bank.';
  }

  if (questionSetMeta.sourceReason === 'network') {
    return 'Personalized questions are unavailable right now. Using the built-in question bank.';
  }

  return 'Personalized questions could not be prepared. Using the built-in question bank.';
};

function InterviewScreen({ selectedCountry, selectedVisaType, initialDraft = null, onGoBack }) {
  // State variables
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [agentResponse, setAgentResponse] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [preparationTips, setPreparationTips] = useState({general: [], specific: []});
  const [commonMistakes, setCommonMistakes] = useState([]);
  const [showPrep, setShowPrep] = useState(true);
  const [userConfidence, setUserConfidence] = useState(initialDraft?.confidence?.after || initialDraft?.confidence?.before || 5);
  const [postSessionConfidence, setPostSessionConfidence] = useState(initialDraft?.confidence?.after || initialDraft?.confidence?.before || 5);
  const [userNeeds, setUserNeeds] = useState(Array.isArray(initialDraft?.concerns) ? initialDraft.concerns : []);
  const [sessionContext, setSessionContext] = useState({
    ...DEFAULT_SESSION_CONTEXT,
    ...(initialDraft?.sessionContext || {}),
  });
  const [feedbackLevel, setFeedbackLevel] = useState(initialDraft?.feedbackLevel || 'detailed');
  const [usePersonalizedQuestions, setUsePersonalizedQuestions] = useState(true);
  const [isPreparingQuestions, setIsPreparingQuestions] = useState(false);
  const [questionSetMeta, setQuestionSetMeta] = useState({
    source: 'local',
    sourceReason: 'static',
    model: 'local-question-bank',
  });
  const [interviewStats, setInterviewStats] = useState({
    strongAreas: [],
    improvementAreas: [],
    overallScore: 0
  });
  const [showAnimation, setShowAnimation] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  
  const conversationEndRef = useRef(null);
  const textAreaRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);
  const firstAnswerTrackedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Load questions based on country and visa type
    loadQuestions();
    
    // Load preparation tips and handle the Promise correctly
    async function fetchTips() {
      try {
        const tips = await aiInterviewService.getPreInterviewTips(selectedCountry, selectedVisaType);
        setPreparationTips(tips || {general: [], specific: []});
      } catch (error) {
        console.error("Error loading preparation tips:", error);
        setPreparationTips({general: [], specific: []});
      }
    }
    
    // Load common mistakes and handle the Promise correctly
    async function fetchMistakes() {
      try {
        const mistakes = await aiInterviewService.getCommonMistakes(selectedCountry, selectedVisaType);
        setCommonMistakes(mistakes || []);
      } catch (error) {
        console.error("Error loading common mistakes:", error);
        setCommonMistakes([]);
      }
    }
    
    fetchTips();
    fetchMistakes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, selectedVisaType]);

  useEffect(() => {
    // Auto-scroll to the bottom of the conversation
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory, agentResponse]);

  useEffect(() => {
    // Loading animation effect
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingDots(prev => {
          if (prev.length >= 3) return '';
          return prev + '.';
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'inherit';
      textAreaRef.current.style.height = `${Math.max(textAreaRef.current.scrollHeight, 100)}px`;
    }
  }, [userResponse]);

  useEffect(() => {
    if (!interviewComplete) return;

    try {
      const savedSession = JSON.parse(localStorage.getItem('visaCoach:lastSession') || '{}');
      if (!savedSession.interviewHistory) return;

      localStorage.setItem('visaCoach:lastSession', JSON.stringify({
        ...savedSession,
        confidence: {
          ...(savedSession.confidence || {}),
          before: userConfidence,
          after: postSessionConfidence,
        },
      }));
    } catch (error) {
      console.error('Unable to update saved confidence:', error);
    }
  }, [interviewComplete, postSessionConfidence, userConfidence]);

  const loadQuestions = () => {
    // Enhanced question sets - organized by country and visa type
    const questionSets = {
      US: {
        F1: [
          "What are your plans after completing your studies in the US?",
          "Why did you choose to study in the United States instead of your home country or other countries?",
          "How will you finance your education and living expenses while in the US?",
          "What is your intended major of study and why did you choose this field?",
          "Have you researched your university's location? Where do you plan to stay?",
          "Can you describe your academic background and how it relates to your chosen field of study?",
          "Do you have family members currently in the United States?",
          "How will this degree help your career when you return to your home country?",
          "Have you taken the TOEFL or IELTS? What was your score?",
          "Have you been offered any scholarships or financial aid?",
          "What specific classes or projects are you looking forward to at your university?",
          "Have you traveled to the US before? If so, when and for what purpose?"
        ],
        'B1/B2': [
          "What is the purpose of your visit to the United States?",
          "How long do you plan to stay in the US?",
          "Where will you be staying during your visit?",
          "Have you visited the United States before?",
          "Who will you be visiting in the United States?",
          "What is your occupation in your home country?",
          "How will your responsibilities be handled while you're away?",
          "How are you financing this trip?",
          "What ties do you have to your home country that will ensure your return?",
          "Do you have family members in the United States?",
          "What places do you plan to visit during your stay?"
        ]
      },
      CA: {
        student: [
          "Why have you chosen to study in Canada?",
          "How will your studies in Canada benefit your future career?",
          "How do you plan to finance your studies and living expenses in Canada?",
          "Why did you choose this specific institution and program?",
          "What are your plans after completing your studies in Canada?",
          "Do you have family members currently in Canada?",
          "Have you researched the city where your institution is located?",
          "How does this program relate to your previous education or work experience?",
          "Have you applied for a Canadian study permit before?",
          "Do you plan to work part-time during your studies?",
          "How do educational options in Canada compare to those in your home country?"
        ]
      },
      UK: {
        student: [
          "Why do you want to study in the UK?",
          "How will you support yourself financially during your studies?",
          "What are your plans after completing your course in the UK?",
          "Why did you choose this specific institution and course?",
          "How does this course relate to your previous education?",
          "What are your career goals and how will this course help you achieve them?",
          "Have you previously studied or applied to study in the UK?",
          "Do you have family members currently in the UK?",
          "How will you accommodate yourself during your studies?",
          "Have you taken an English language test? What was your score?",
          "How do educational options in the UK compare to those in your home country?"
        ]
      }
    };

    const genericVisaQuestions = [
      "What is the purpose of your trip or visa application?",
      "Why did you choose this destination instead of another country?",
      "How will you fund your stay, studies, or planned activities?",
      "What ties do you have to your home country or current country of residence?",
      "What are your plans after the visa period ends?",
    ];

    const questions = questionSets[selectedCountry]?.[selectedVisaType] || genericVisaQuestions;
    setInterviewQuestions(questions.slice(0, SESSION_QUESTION_LIMIT));
    setQuestionSetMeta({
      source: 'local',
      sourceReason: 'static',
      model: 'local-question-bank',
    });
    setAgentResponse('');
  };

  const calculateInterviewStats = (history, context = sessionContext) => {
    const answers = history.map(item => item.userResponse || '');
    const combinedAnswers = answers.join(' ').toLowerCase();
    const averageWords = answers.length
      ? answers.reduce((sum, answer) => sum + answer.trim().split(/\s+/).filter(Boolean).length, 0) / answers.length
      : 0;

    const strongAreas = [];
    const improvementAreas = [];

    if (averageWords >= 25) {
      strongAreas.push("Provides enough detail for review");
    } else {
      improvementAreas.push("Add specific details instead of short general answers");
    }

    if (/(because|therefore|so that|my plan|i plan|after|return|continue)/.test(combinedAnswers)) {
      strongAreas.push("Connects answers to a clear plan");
    } else {
      improvementAreas.push("Explain the plan behind each answer");
    }

    if (context.fundingSource?.trim()) {
      strongAreas.push("Prepared a funding source before practice");
    } else if (/(fund|sponsor|scholarship|salary|savings|bank|tuition|employer|company)/.test(combinedAnswers)) {
      strongAreas.push("Mentions financial support");
    } else {
      improvementAreas.push("Clarify how the visit or program will be funded");
    }

    if (context.returnPlan?.trim()) {
      strongAreas.push("Prepared a return plan or home-ties story");
    } else if (/(home|return|family|job|employer|property|business|country|community)/.test(combinedAnswers)) {
      strongAreas.push("Addresses return ties or home context");
    } else {
      improvementAreas.push("State the ties that support your return plan");
    }

    if (userNeeds.includes('english') && averageWords > 45) {
      improvementAreas.push("Keep answers shorter so they are easier to deliver clearly");
    }

    const completionBoost = Math.min(20, history.length * 4);
    const detailBoost = Math.min(25, Math.round(averageWords));
    const overallScore = Math.min(90, 40 + completionBoost + detailBoost + (strongAreas.length * 5));

    return {
      strongAreas: strongAreas.length ? strongAreas : ["Completed the current practice step"],
      improvementAreas: improvementAreas.length ? improvementAreas : ["Keep answers concise and consistent"],
      overallScore
    };
  };

  const handleUserResponse = async () => {
    if (!userResponse.trim()) {
      setFeedbackMessage("Please provide an answer before continuing.");
      return;
    }

    if (!firstAnswerTrackedRef.current) {
      trackEvent('first_answer_submitted', {
        sessionId,
        country: selectedCountry,
        visaType: selectedVisaType,
        answerLength: userResponse.trim().length,
      });
      firstAnswerTrackedRef.current = true;
    }

    setFeedbackMessage("");
    setIsLoading(true);
    
    // Add user's response to conversation history
    const newHistory = [...conversationHistory, {
      question: interviewQuestions[currentQuestionIndex],
      userResponse: userResponse,
      agentResponse: "",
      feedbackSource: "",
      feedback: null
    }];
    
    setConversationHistory(newHistory);

    try {
      // Get agent's response to user's answer
      const feedback = await aiInterviewService.getAgentResponse(
        interviewQuestions[currentQuestionIndex], 
        userResponse,
        selectedCountry,
        selectedVisaType,
        feedbackLevel,
        {
          confidence: userConfidence,
          concerns: userNeeds,
          context: sessionContext,
        }
      );
      const responseText = typeof feedback === 'string' ? feedback : feedback.text;
      
      // Update history with agent's response
      newHistory[newHistory.length - 1].agentResponse = responseText;
      newHistory[newHistory.length - 1].feedbackSource = typeof feedback === 'string' ? 'unknown' : feedback.source;
      newHistory[newHistory.length - 1].feedbackSourceReason = typeof feedback === 'string' ? '' : feedback.sourceReason;
      newHistory[newHistory.length - 1].feedbackRetryAfterSeconds = typeof feedback === 'string' ? 0 : feedback.retryAfterSeconds;
      newHistory[newHistory.length - 1].feedbackModel = typeof feedback === 'string' ? '' : feedback.model;
      newHistory[newHistory.length - 1].feedbackStyle = feedbackLevel;
      newHistory[newHistory.length - 1].feedback = typeof feedback === 'string' ? null : feedback.feedback;
      setConversationHistory(newHistory);
      setAgentResponse(responseText);
      trackEvent('feedback_source_used', {
        sessionId,
        country: selectedCountry,
        visaType: selectedVisaType,
        source: typeof feedback === 'string' ? 'unknown' : feedback.source,
        model: typeof feedback === 'string' ? '' : feedback.model,
        feedbackStyle: feedbackLevel,
      });
      
      const nextStats = updateInterviewStats(newHistory);

      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }

      autoAdvanceTimerRef.current = setTimeout(() => {
        handleNextQuestion(newHistory, nextStats);
      }, AUTO_ADVANCE_DELAY_MS);
    } catch (error) {
      console.error("Error getting agent response:", error);
      const fallbackResponse = 'I could not process that answer with the remote service, so keep going and use the final summary to review your response.';
      const failedHistory = [...newHistory];

      failedHistory[failedHistory.length - 1] = {
        ...failedHistory[failedHistory.length - 1],
        agentResponse: fallbackResponse,
        feedbackSource: 'local',
        feedbackSourceReason: 'network',
        feedbackStyle: feedbackLevel,
        feedback: null,
      };

      setConversationHistory(failedHistory);
      setAgentResponse(fallbackResponse);
      const nextStats = updateInterviewStats(failedHistory);

      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }

      autoAdvanceTimerRef.current = setTimeout(() => {
        handleNextQuestion(failedHistory, nextStats);
      }, AUTO_ADVANCE_DELAY_MS);
    } finally {
      setIsLoading(false);
      setUserResponse(''); // Clear input field
    }
  };

  const updateInterviewStats = (history) => {
    const nextStats = calculateInterviewStats(history, sessionContext);
    setInterviewStats(nextStats);
    return nextStats;
  };

  const handleNextQuestion = (history = conversationHistory, stats = interviewStats) => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= interviewQuestions.length) {
      setInterviewComplete(true);
      setAgentResponse("Thank you for completing the interview simulation. You can review your conversation history below.");
      saveInterviewHistory(history, stats);
      trackEvent('session_completed', {
        sessionId,
        country: selectedCountry,
        visaType: selectedVisaType,
        questionsAnswered: history.length,
        readinessScore: stats.overallScore,
        feedbackLevel,
      });
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 3000);
    } else {
      setCurrentQuestionIndex(nextIndex);
      setAgentResponse(''); // Clear agent response for next question
    }
  };

  const startInterview = async () => {
    const nextSessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const cleanContext = getCleanSessionContext();

    setIsPreparingQuestions(true);
    setFeedbackMessage('');

    let nextQuestionSetMeta = {
      source: 'local',
      sourceReason: usePersonalizedQuestions ? 'error' : 'static',
      model: 'local-question-bank',
    };

    try {
      if (usePersonalizedQuestions) {
        const generatedQuestionSet = await aiInterviewService.generateQuestions(
          selectedCountry,
          selectedVisaType,
          {
            confidence: userConfidence,
            concerns: userNeeds,
            context: cleanContext,
          }
        );

        if (generatedQuestionSet.questions.length) {
          setInterviewQuestions(generatedQuestionSet.questions.slice(0, SESSION_QUESTION_LIMIT));
        }

        nextQuestionSetMeta = {
          source: generatedQuestionSet.source,
          sourceReason: generatedQuestionSet.sourceReason,
          retryAfterSeconds: generatedQuestionSet.retryAfterSeconds,
          model: generatedQuestionSet.model,
        };
      }
    } catch (error) {
      console.error('Unable to prepare personalized questions:', error);
      nextQuestionSetMeta = {
        source: 'local',
        sourceReason: 'network',
        model: 'local-question-bank',
      };
    }

    setQuestionSetMeta(nextQuestionSetMeta);
    setSessionId(nextSessionId);
    firstAnswerTrackedRef.current = false;
    setConversationHistory([]);
    setCurrentQuestionIndex(0);
    setInterviewComplete(false);
    setShowPrep(false);
    setPostSessionConfidence(userConfidence);
    setIsPreparingQuestions(false);
    trackEvent('session_started', {
      sessionId: nextSessionId,
      country: selectedCountry,
      visaType: selectedVisaType,
      feedbackLevel,
      confidence: userConfidence,
      concerns: userNeeds,
      questionSource: nextQuestionSetMeta.source,
    });
    setAgentResponse("Welcome to your practice session. I will ask five visa interview-style questions. Answer honestly and concretely, as you would at the appointment.");
  };

  const handleContextChange = (field, value) => {
    setSessionContext(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getCleanSessionContext = () => Object.entries(sessionContext).reduce((cleaned, [key, value]) => {
    cleaned[key] = typeof value === 'string' ? value.trim() : value;
    return cleaned;
  }, {});

  const saveInterviewHistory = async (history = conversationHistory, statsData = interviewStats) => {
    const interviewData = {
      sessionId,
      country: selectedCountry,
      visaType: selectedVisaType,
      interviewHistory: history,
      stats: statsData,
      questionSet: questionSetMeta,
      sessionContext: getCleanSessionContext(),
      confidence: {
        before: userConfidence,
        after: postSessionConfidence,
      },
      concerns: userNeeds,
      feedbackLevel,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('visaCoach:lastSession', JSON.stringify(interviewData));
  
      const result = await aiInterviewService.saveInterviewHistory(interviewData);
      console.log('Interview history saved:', result);
      setSaveMessage('Session saved locally.');
    } catch (error) {
      console.error('Error saving interview history:', error);
      setSaveMessage('Session saved locally. Remote history is not configured yet.');
    }
  };

  const buildSessionSummary = () => {
    return buildPracticeSummary({
      selectedCountry,
      selectedVisaType,
      userConfidence,
      postSessionConfidence,
      userNeeds,
      sessionContext: getCleanSessionContext(),
      interviewStats,
      conversationHistory,
    });
  };

  const handleCopySummary = async () => {
    const summary = buildSessionSummary();
    try {
      await navigator.clipboard.writeText(summary);
      trackEvent('summary_copied', {
        sessionId,
        country: selectedCountry,
        visaType: selectedVisaType,
        questionsAnswered: conversationHistory.length,
      });
      setSaveMessage('Summary copied to clipboard.');
    } catch (error) {
      console.error('Unable to copy summary:', error);
      localStorage.setItem('visaCoach:lastSummary', summary);
      setSaveMessage('Clipboard was unavailable, so the summary was saved locally.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserResponse();
    }
  };

  const handleNeedsChange = (need) => {
    if (userNeeds.includes(need)) {
      setUserNeeds(userNeeds.filter(n => n !== need));
    } else {
      setUserNeeds([...userNeeds, need]);
    }
  };

  const currentQuestion = interviewQuestions[currentQuestionIndex];
  const isInterviewOver = currentQuestionIndex >= interviewQuestions.length || interviewComplete;
  const latestConversationItem = conversationHistory[conversationHistory.length - 1];
  const hasCurrentAnswerFeedback = Boolean(
    latestConversationItem &&
    latestConversationItem.question === currentQuestion &&
    latestConversationItem.agentResponse
  );
  const hasAccountSession = Boolean(localStorage.getItem('token'));
  const generalTips = Array.isArray(preparationTips.general) && preparationTips.general.length
    ? preparationTips.general
    : DEFAULT_GENERAL_TIPS;
  const specificTips = Array.isArray(preparationTips.specific) && preparationTips.specific.length
    ? preparationTips.specific
    : DEFAULT_SPECIFIC_TIPS;
  const mistakesToAvoid = Array.isArray(commonMistakes) && commonMistakes.length
    ? commonMistakes
    : DEFAULT_COMMON_MISTAKES;
  const questionSetNotice = getQuestionSetNotice(questionSetMeta);

  return (
    <div className={`interview-container ${showPrep ? 'prep-mode' : ''}`}>
      <div className="interview-header">
        <h2>Visa Interview Simulation</h2>
        <div className="interview-info">
          <span className="badge country-badge">{selectedCountry}</span>
          <span className="badge visa-badge">{selectedVisaType}</span>
          {!showPrep && (
            <span className={`badge question-source-badge ${questionSetMeta.source || 'local'}`}>
              Questions: {questionSetMeta.source === 'gemini'
                ? `Gemini${questionSetMeta.model ? ` · ${questionSetMeta.model}` : ''}`
                : questionSetMeta.sourceReason === 'quota' || questionSetMeta.sourceReason === 'quota_cooldown'
                  ? 'Question bank · Gemini quota'
                  : 'Question bank'}
            </span>
          )}
        </div>
        <button className="back-button" onClick={onGoBack}>
          ← Back to Selection
        </button>
      </div>

      {showPrep ? (
        <div className="preparation-screen">
          <div className="prep-heading">
            <div>
              <p className="prep-kicker">Practice setup</p>
              <h3>Prepare for Your Interview</h3>
            </div>
            <div className="context-path-summary">
              <span>Destination: {selectedCountry}</span>
              <span>Visa type: {selectedVisaType}</span>
            </div>
          </div>

          <div className="prep-layout">
            <div className="prep-section context-section">
              <h4>Applicant Context</h4>
              <div className="context-grid">
                <label className="context-field">
                  <span>{CONTEXT_FIELD_LABELS.homeCountry}</span>
                  <input
                    type="text"
                    value={sessionContext.homeCountry}
                    onChange={(e) => handleContextChange('homeCountry', e.target.value)}
                    placeholder="Ghana"
                  />
                </label>
                <label className="context-field">
                  <span>{CONTEXT_FIELD_LABELS.institutionOrHost}</span>
                  <input
                    type="text"
                    value={sessionContext.institutionOrHost}
                    onChange={(e) => handleContextChange('institutionOrHost', e.target.value)}
                    placeholder="University, employer, host, or event"
                  />
                </label>
                <label className="context-field">
                  <span>{CONTEXT_FIELD_LABELS.programOrPurpose}</span>
                  <input
                    type="text"
                    value={sessionContext.programOrPurpose}
                    onChange={(e) => handleContextChange('programOrPurpose', e.target.value)}
                    placeholder="MS Computer Science, tourism, business meeting"
                  />
                </label>
                <label className="context-field">
                  <span>{CONTEXT_FIELD_LABELS.fundingSource}</span>
                  <input
                    type="text"
                    value={sessionContext.fundingSource}
                    onChange={(e) => handleContextChange('fundingSource', e.target.value)}
                    placeholder="Family sponsor, savings, scholarship"
                  />
                </label>
                <label className="context-field context-field-wide">
                  <span>{CONTEXT_FIELD_LABELS.returnPlan}</span>
                  <input
                    type="text"
                    value={sessionContext.returnPlan}
                    onChange={(e) => handleContextChange('returnPlan', e.target.value)}
                    placeholder="Job, family, business, property, or career plan at home"
                  />
                </label>
                <label className="context-field context-field-wide">
                  <span>{CONTEXT_FIELD_LABELS.notes}</span>
                  <textarea
                    value={sessionContext.notes}
                    onChange={(e) => handleContextChange('notes', e.target.value)}
                    placeholder="Paste short SOP, resume, DS-160, or application notes"
                    rows="3"
                  />
                </label>
              </div>
            </div>

            <div className="prep-controls-panel">
              <div className="prep-section">
                <h4>Confidence</h4>
                <div className="confidence-slider">
                  <div className="slider-track">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={userConfidence}
                      onChange={(e) => setUserConfidence(parseInt(e.target.value))}
                      aria-label="Interview confidence before practice"
                    />
                    <div className="slider-progress" style={{width: `${(userConfidence-1) * 10}%`}}></div>
                  </div>
                  <div className="slider-labels">
                    <span>Not confident</span>
                    <span>Very confident</span>
                  </div>
                  <div className="confidence-value">Your confidence: {userConfidence}/10</div>
                </div>
              </div>

              <div className="prep-section">
                <h4>Focus Areas</h4>
                <div className="concerns-checkboxes concerns-grid">
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={userNeeds.includes('answering')}
                      onChange={() => handleNeedsChange('answering')}
                    />
                    <span className="checkmark"></span>
                    Answering
                  </label>
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={userNeeds.includes('documentation')}
                      onChange={() => handleNeedsChange('documentation')}
                    />
                    <span className="checkmark"></span>
                    Documents
                  </label>
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={userNeeds.includes('english')}
                      onChange={() => handleNeedsChange('english')}
                    />
                    <span className="checkmark"></span>
                    English clarity
                  </label>
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={userNeeds.includes('nervousness')}
                      onChange={() => handleNeedsChange('nervousness')}
                    />
                    <span className="checkmark"></span>
                    Nervousness
                  </label>
                </div>
              </div>

              <div className="prep-section">
                <h4>Feedback Style</h4>
                <div className="feedback-radios feedback-options">
                  <label className="custom-radio">
                    <input
                      type="radio"
                      name="feedback"
                      value="brief"
                      checked={feedbackLevel === 'brief'}
                      onChange={() => setFeedbackLevel('brief')}
                      aria-label="Brief (Just tell me if I'm on the right track)"
                    />
                    <span className="radio-mark"></span>
                    Brief
                  </label>
                  <label className="custom-radio">
                    <input
                      type="radio"
                      name="feedback"
                      value="detailed"
                      checked={feedbackLevel === 'detailed'}
                      onChange={() => setFeedbackLevel('detailed')}
                      aria-label="Detailed (Provide specific suggestions)"
                    />
                    <span className="radio-mark"></span>
                    Detailed
                  </label>
                  <label className="custom-radio">
                    <input
                      type="radio"
                      name="feedback"
                      value="realistic"
                      checked={feedbackLevel === 'realistic'}
                      onChange={() => setFeedbackLevel('realistic')}
                      aria-label="Realistic (Minimal feedback, like a real interview)"
                    />
                    <span className="radio-mark"></span>
                    Realistic
                  </label>
                </div>
              </div>

              <div className="prep-start-panel">
                <label className="custom-checkbox question-mode-toggle">
                  <input
                    type="checkbox"
                    checked={usePersonalizedQuestions}
                    onChange={() => setUsePersonalizedQuestions(prev => !prev)}
                  />
                  <span className="checkmark"></span>
                  Personalize questions
                </label>

                <button className="start-interview-button" onClick={startInterview} disabled={isPreparingQuestions}>
                  {isPreparingQuestions ? 'Preparing questions...' : 'Start Interview Simulation'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="prep-reference-grid">
            <div className="prep-section prep-tips">
              <h4>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="8"></line>
                </svg>
                General Interview Tips
              </h4>
              <ul className="tips-list">
                {generalTips.map((tip, index) => (
                  <li key={`general-${index}`}>{tip}</li>
                ))}
              </ul>
            </div>
            
            <div className="prep-section prep-tips">
              <h4>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Specific Tips for {selectedCountry} {selectedVisaType} Visa
              </h4>
              <ul className="tips-list">
                {specificTips.map((tip, index) => (
                  <li key={`specific-${index}`}>{tip}</li>
                ))}
              </ul>
            </div>
            
            <div className="prep-section prep-tips">
              <h4>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Common Mistakes to Avoid
              </h4>
              <ul className="tips-list">
                {mistakesToAvoid.map((mistake, index) => (
                  <li key={`mistake-${index}`}>{mistake}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="interview-content">
          {questionSetNotice && (
            <div className="session-notice" role="status">
              {questionSetNotice}
            </div>
          )}

          {/* Conversation history */}
          <div className="conversation-history">
            {conversationHistory.map((item, index) => (
              <div className="conversation-item" key={index}>
                <div className="agent-question">
                  <div className="avatar agent-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="message-bubble agent-bubble">
                    <p className="question-text">{item.question}</p>
                  </div>
                </div>
                
                <div className="user-response">
                  <div className="message-bubble user-bubble">
                    <p>{item.userResponse}</p>
                  </div>
                  <div className="avatar user-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </div>
                
                {item.agentResponse && (
                  <div className="agent-feedback">
                    <div className="avatar agent-avatar">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div className={`message-bubble agent-bubble feedback-bubble ${item.feedbackStyle === 'realistic' ? 'realistic-bubble' : ''}`}>
                      <span className={`feedback-source ${item.feedbackSource || 'unknown'}`}>
                        {item.feedbackStyle === 'realistic'
                          ? `Officer-style${item.feedbackSource === 'gemini' ? ' · Gemini' : ''}`
                          : item.feedbackSource === 'gemini'
                          ? `Gemini${item.feedbackModel ? ` · ${item.feedbackModel}` : ''}`
                          : item.feedbackSource === 'local'
                            ? `Local fallback${item.feedbackSourceReason === 'quota' || item.feedbackSourceReason === 'quota_cooldown' ? ' · Gemini quota' : ''}`
                            : 'Feedback'}
                      </span>
                      {item.feedbackStyle === 'realistic' ? (
                        <FormattedFeedback text={item.agentResponse} />
                      ) : (
                        <StructuredFeedback
                          feedback={item.feedback}
                          fallbackText={item.agentResponse}
                          brief={item.feedbackStyle === 'brief'}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Render welcome message if it's the first question */}
            {agentResponse && conversationHistory.length === 0 && (
              <div className="welcome-message">
                <div className="avatar agent-avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="message-bubble agent-bubble">
                  <p>{agentResponse}</p>
                </div>
              </div>
            )}
            
            {/* Current question */}
            {currentQuestion && !isInterviewOver && (
              <div className="current-question">
                <div className="avatar agent-avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="message-bubble agent-bubble">
                  <p className="question-text">{currentQuestion}</p>
                  <span className="question-number">Question {currentQuestionIndex + 1} of {interviewQuestions.length}</span>
                </div>
              </div>
            )}
            
            <div ref={conversationEndRef} />
          </div>
          
          {/* Current question section */}
          {!isInterviewOver ? (
            <div className="user-input-section">
              <div className="textarea-container">
                <textarea
                  ref={textAreaRef}
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here..."
                  className="response-input"
                  disabled={isLoading || hasCurrentAnswerFeedback}
                  rows="3"
                />
                
                {feedbackMessage && (
                  <p className="feedback-message">{feedbackMessage}</p>
                )}
              </div>
              
              <div className="button-group">
                {!hasCurrentAnswerFeedback && (
                  <button 
                    className="submit-button"
                    onClick={handleUserResponse}
                    disabled={isLoading}
                  >
                    {isLoading ? `Processing${loadingDots}` : "Submit Answer"}
                  </button>
                )}
                
                {hasCurrentAnswerFeedback && !isLoading && (
                  <p className="auto-advance-status">
                    {currentQuestionIndex < interviewQuestions.length - 1 ? "Moving to the next question..." : "Preparing your summary..."}
                  </p>
                )}
                
              </div>
            </div>
          ) : (
            <div className={`interview-complete ${showAnimation ? 'show-animation' : ''}`}>
              <div className="completion-message">
                <div className="completion-header">
                  <div className="completion-icon">✓</div>
                  <h3>Interview Simulation Complete</h3>
                </div>
                
                <p>You completed the five-question visa practice sprint. Review the summary, copy it, and use it to tighten your next attempt.</p>
                
                <div className="interview-summary">
                  <div className="summary-score">
                    <div className="score-circle">
                      <svg viewBox="0 0 36 36">
                        <path
                          className="score-circle-bg"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="score-circle-progress"
                          strokeDasharray={`${interviewStats.overallScore}, 100`}
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" className="score-text">{interviewStats.overallScore}%</text>
                      </svg>
                    </div>
                    <div className="score-info">
                      <h4>Practice Readiness</h4>
                      <p>Based on {conversationHistory.length} practice answers</p>
                    </div>
                  </div>

                  <div className="confidence-comparison">
                    <div>
                      <h4>Confidence Check</h4>
                      <p>Before: {userConfidence}/10 · After: {postSessionConfidence}/10</p>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={postSessionConfidence}
                      onChange={(e) => setPostSessionConfidence(parseInt(e.target.value))}
                      aria-label="Confidence after this practice session"
                    />
                  </div>
                  
                  <div className="summary-details">
                    <div className="summary-section">
                      <h4>Your Strengths</h4>
                      <ul>
                        {interviewStats.strongAreas.map((area, index) => (
                          <li key={index}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="summary-section">
                      <h4>Areas for Improvement</h4>
                      <ul>
                        {interviewStats.improvementAreas.map((area, index) => (
                          <li key={index}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="16"></line>
                              <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="completion-actions">
                  <button className="copy-summary-button" onClick={handleCopySummary}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy Summary
                  </button>

                  <button className="restart-button" onClick={() => {
                    const nextSessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                    setSessionId(nextSessionId);
                    firstAnswerTrackedRef.current = false;
                    setCurrentQuestionIndex(0);
                    setConversationHistory([]);
                    setAgentResponse("Welcome back! Let's start the interview again.");
                    setInterviewComplete(false);
                    trackEvent('session_started', {
                      sessionId: nextSessionId,
                      country: selectedCountry,
                      visaType: selectedVisaType,
                      feedbackLevel,
                      confidence: userConfidence,
                      concerns: userNeeds,
                      restarted: true,
                    });
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 4v6h-6"></path>
                      <path d="M1 20v-6h6"></path>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                    Restart Interview
                  </button>
                  
                  <button className="prep-button" onClick={() => {
                    setShowPrep(true);
                    setSessionId('');
                    firstAnswerTrackedRef.current = false;
                    setCurrentQuestionIndex(0);
                    setConversationHistory([]);
                    setInterviewComplete(false);
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    Review Preparation Tips
                  </button>
                </div>

                {!hasAccountSession && (
                  <div className="account-save-callout">
                    <div>
                      <h4>Save future sessions</h4>
                      <p>Create an account after practicing to keep your history across devices.</p>
                    </div>
                    <div className="account-save-actions">
                      <Link to="/register" className="copy-summary-button">Create Account</Link>
                      <Link to="/login" className="prep-button">Sign In</Link>
                    </div>
                  </div>
                )}

                {saveMessage && <p className="save-message">{saveMessage}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InterviewScreen;
