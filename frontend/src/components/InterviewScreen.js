import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { aiInterviewService } from '../services/aiInterviewService.js';
import './InterviewScreen.css';

function InterviewScreen({ selectedCountry, selectedVisaType, onGoBack, userPlan }) {
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
  const [userConfidence, setUserConfidence] = useState(5);
  const [userNeeds, setUserNeeds] = useState([]);
  const [feedbackLevel, setFeedbackLevel] = useState('detailed');
  const [interviewStats, setInterviewStats] = useState({
    strongAreas: [],
    improvementAreas: [],
    overallScore: 0
  });
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Authentication related
  const { token, isLoggedIn } = useContext(UserContext) || { token: null, isLoggedIn: false };
  const navigate = useNavigate();
  
  const conversationEndRef = useRef(null);
  const textAreaRef = useRef(null);

  // Check authentication on component mount
  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken && !token) {
      navigate('/login');
    }
  }, [navigate, token]);

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
        // Check for authentication error
        if (error.response && error.response.status === 401) {
          navigate('/login');
        } else {
          setPreparationTips({general: [], specific: []});
        }
      }
    }
    
    // Load common mistakes and handle the Promise correctly
    async function fetchMistakes() {
      try {
        const mistakes = await aiInterviewService.getCommonMistakes(selectedCountry, selectedVisaType);
        setCommonMistakes(mistakes || []);
      } catch (error) {
        console.error("Error loading common mistakes:", error);
        // Check for authentication error
        if (error.response && error.response.status === 401) {
          navigate('/login');
        } else {
          setCommonMistakes([]);
        }
      }
    }
    
    fetchTips();
    fetchMistakes();
  }, [selectedCountry, selectedVisaType, navigate]);

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

    // Set questions or default message
    if (questionSets[selectedCountry]?.[selectedVisaType]) {
      setInterviewQuestions(questionSets[selectedCountry][selectedVisaType]);
    } else {
      setInterviewQuestions([]);
      setAgentResponse("There are no questions available for this selection yet. Please choose another visa type or country.");
    }
  };

  const handleUserResponse = async () => {
    if (!userResponse.trim()) {
      setFeedbackMessage("Please provide an answer before continuing.");
      return;
    }

    setFeedbackMessage("");
    setIsLoading(true);
    
    // Add user's response to conversation history
    const newHistory = [...conversationHistory, {
      question: interviewQuestions[currentQuestionIndex],
      userResponse: userResponse,
      agentResponse: ""
    }];
    
    setConversationHistory(newHistory);

    try {
      // Get agent's response to user's answer
      const response = await aiInterviewService.getAgentResponse(
        interviewQuestions[currentQuestionIndex], 
        userResponse,
        selectedCountry,
        selectedVisaType
      );
      
      // Update history with agent's response
      newHistory[newHistory.length - 1].agentResponse = response;
      setConversationHistory(newHistory);
      setAgentResponse(response);
      
      // Update interview stats (this would be dynamic in a real implementation)
      updateInterviewStats(newHistory);
    } catch (error) {
      console.error("Error getting agent response:", error);
      
      // Check for authentication error
      if (error.response && error.response.status === 401) {
        // Token might be expired or invalid
        navigate('/login');
      } else {
        setAgentResponse("I'm having trouble processing your response. Let's continue to the next question.");
      }
    } finally {
      setIsLoading(false);
      setUserResponse(''); // Clear input field
    }
  };

  const updateInterviewStats = (history) => {
    // This is a placeholder for real implementation
    // In a real app, you'd analyze responses and provide meaningful feedback
    const strongAreas = ["Study plans", "Financial arrangements"];
    const improvementAreas = ["Post-graduation plans", "Ties to home country"];
    
    const totalQuestions = history.length;
    const overallScore = Math.min(95, 65 + (totalQuestions * 3)); // Just for demonstration
    
    setInterviewStats({
      strongAreas,
      improvementAreas,
      overallScore
    });
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= interviewQuestions.length) {
      setInterviewComplete(true);
      setAgentResponse("Thank you for completing the interview simulation. You can review your conversation history below.");
      saveInterviewHistory();
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 3000);
    } else {
      setCurrentQuestionIndex(nextIndex);
      setAgentResponse(''); // Clear agent response for next question
    }
  };

  const startInterview = () => {
    setShowPrep(false);
    setAgentResponse("Welcome to your visa interview simulation. I'll be asking you questions about your visa application. Please answer honestly as you would in a real interview.");
  };

  const saveInterviewHistory = async () => {
    try {
      const interviewData = {
        country: selectedCountry,
        visaType: selectedVisaType,
        interviewHistory: conversationHistory,
        stats: interviewStats
      };
  
      const result = await aiInterviewService.saveInterviewHistory(interviewData);
      console.log('Interview history saved:', result);
    } catch (error) {
      console.error('Error saving interview history:', error);
      // Check for authentication error - but don't redirect, just log it
      if (error.response && error.response.status === 401) {
        console.log('Authentication error when saving history');
      }
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

  return (
    <div className="interview-container">
      <div className="interview-header">
        <h2>Visa Interview Simulation</h2>
        <div className="interview-info">
          <span className="badge country-badge">{selectedCountry}</span>
          <span className="badge visa-badge">{selectedVisaType}</span>
        </div>
        <button className="back-button" onClick={onGoBack}>
          ← Back to Selection
        </button>
      </div>

      {showPrep ? (
        <div className="preparation-screen">
          <h3>Prepare for Your Interview</h3>
          
          <div className="prep-section">
            <h4>How confident are you about this interview?</h4>
            <div className="confidence-slider">
              <div className="slider-track">
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={userConfidence}
                  onChange={(e) => setUserConfidence(parseInt(e.target.value))}
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
            <h4>What are you most concerned about? (Select all that apply)</h4>
            <div className="concerns-checkboxes">
              <label className="custom-checkbox">
                <input 
                  type="checkbox" 
                  checked={userNeeds.includes('answering')}
                  onChange={() => handleNeedsChange('answering')}
                />
                <span className="checkmark"></span>
                Answering questions effectively
              </label>
              <label className="custom-checkbox">
                <input 
                  type="checkbox" 
                  checked={userNeeds.includes('documentation')}
                  onChange={() => handleNeedsChange('documentation')}
                />
                <span className="checkmark"></span>
                Required documentation
              </label>
              <label className="custom-checkbox">
                <input 
                  type="checkbox" 
                  checked={userNeeds.includes('english')}
                  onChange={() => handleNeedsChange('english')}
                />
                <span className="checkmark"></span>
                English language skills
              </label>
              <label className="custom-checkbox">
                <input 
                  type="checkbox" 
                  checked={userNeeds.includes('nervousness')}
                  onChange={() => handleNeedsChange('nervousness')}
                />
                <span className="checkmark"></span>
                Managing nervousness
              </label>
            </div>
          </div>
          
          <div className="prep-section">
            <h4>How detailed would you like the feedback to be?</h4>
            <div className="feedback-radios">
              <label className="custom-radio">
                <input 
                  type="radio" 
                  name="feedback" 
                  value="brief"
                  checked={feedbackLevel === 'brief'}
                  onChange={() => setFeedbackLevel('brief')}
                />
                <span className="radio-mark"></span>
                Brief (Just tell me if I'm on the right track)
              </label>
              <label className="custom-radio">
                <input 
                  type="radio" 
                  name="feedback" 
                  value="detailed"
                  checked={feedbackLevel === 'detailed'}
                  onChange={() => setFeedbackLevel('detailed')}
                />
                <span className="radio-mark"></span>
                Detailed (Provide specific suggestions)
              </label>
              <label className="custom-radio">
                <input 
                  type="radio" 
                  name="feedback" 
                  value="realistic"
                  checked={feedbackLevel === 'realistic'}
                  onChange={() => setFeedbackLevel('realistic')}
                />
                <span className="radio-mark"></span>
                Realistic (Minimal feedback, like a real interview)
              </label>
            </div>
          </div>
          
          <div className="prep-tips-container">
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
                {preparationTips.general.map((tip, index) => (
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
                {preparationTips.specific.map((tip, index) => (
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
                {commonMistakes.map((mistake, index) => (
                  <li key={`mistake-${index}`}>{mistake}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <button className="start-interview-button" onClick={startInterview}>
            Start Interview Simulation
          </button>
        </div>
      ) : (
        <div className="interview-content">
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
                
                {item.agentResponse && feedbackLevel !== 'realistic' && (
                  <div className="agent-feedback">
                    <div className="avatar agent-avatar">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div className="message-bubble agent-bubble feedback-bubble">
                      <p>{feedbackLevel === 'brief' 
                        ? item.agentResponse.split('.')[0] + '.' // Just the first sentence
                        : item.agentResponse}
                      </p>
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
                  disabled={isLoading}
                  rows="3"
                />
                
                {feedbackMessage && (
                  <p className="feedback-message">{feedbackMessage}</p>
                )}
              </div>
              
              <div className="button-group">
                <button 
                  className="submit-button"
                  onClick={handleUserResponse}
                  disabled={isLoading}
                >
                  {isLoading ? `Processing${loadingDots}` : "Submit Answer"}
                </button>
                
                {agentResponse && !isLoading && feedbackLevel !== 'realistic' && (
                  <button 
                    className="next-button"
                    onClick={handleNextQuestion}
                  >
                    {currentQuestionIndex < interviewQuestions.length - 1 ? "Next Question" : "Complete Interview"}
                  </button>
                )}
                
                {feedbackLevel === 'realistic' && !isLoading && userResponse.length === 0 && conversationHistory.length > 0 && (
                  <button 
                    className="next-button"
                    onClick={handleNextQuestion}
                  >
                    {currentQuestionIndex < interviewQuestions.length - 1 ? "Next Question" : "Complete Interview"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={`interview-complete ${showAnimation ? 'show-animation' : ''}`}>
              <div className="completion-message">
                <div className="completion-header">
                  <div className="completion-icon">🎉</div>
                  <h3>Interview Simulation Complete</h3>
                </div>
                
                <p>You've completed all questions for this visa interview simulation.</p>
                
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
                      <h4>Overall Performance</h4>
                      <p>Based on {conversationHistory.length} questions</p>
                    </div>
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
                  <button className="restart-button" onClick={() => {
                    setCurrentQuestionIndex(0);
                    setConversationHistory([]);
                    setAgentResponse("Welcome back! Let's start the interview again.");
                    setInterviewComplete(false);
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
                
                <div className="premium-offer">
                  <h4>Want more detailed feedback?</h4>
                  <p>Upgrade to VisaCoach Premium for personalized feedback from immigration experts</p>
                  <button className="premium-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    Upgrade to Premium
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InterviewScreen;