import React, { useState, useEffect } from 'react';
import { enhancedAgentService } from '../services/mockAgentService.js';
import './InterviewScreen.css';

function ImprovedInterviewScreen({ selectedCountry, selectedVisaType, onGoBack }) {
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [agentResponse, setAgentResponse] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [preparationTips, setPreparationTips] = useState({general: [], specific: []});
  const [commonMistakes, setCommonMistakes] = useState([]);
  const [showPrep, setShowPrep] = useState(true);
  const [userConfidence, setUserConfidence] = useState(5); // Default confidence level (1-10)
  const [userNeeds, setUserNeeds] = useState([]);
  const [feedbackLevel, setFeedbackLevel] = useState('detailed');

  useEffect(() => {
    // Load questions based on country and visa type
    loadQuestions();
    
    // Load preparation tips
    const tips = enhancedAgentService.getPreInterviewTips(selectedCountry, selectedVisaType);
    setPreparationTips(tips);
    
    // Load common mistakes
    const mistakes = enhancedAgentService.getCommonMistakes(selectedCountry, selectedVisaType);
    setCommonMistakes(mistakes);
    
    // Initial greeting is shown after prep is dismissed
  }, [selectedCountry, selectedVisaType]);

  const loadQuestions = () => {
    // Enhanced question sets
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
      const response = await enhancedAgentService.getAgentResponse(
        interviewQuestions[currentQuestionIndex], 
        userResponse,
        selectedCountry,
        selectedVisaType
      );
      
      // Update history with agent's response
      newHistory[newHistory.length - 1].agentResponse = response;
      setConversationHistory(newHistory);
      setAgentResponse(response);
    } catch (error) {
      console.error("Error getting agent response:", error);
      setAgentResponse("I'm having trouble processing your response. Let's continue to the next question.");
    } finally {
      setIsLoading(false);
      setUserResponse(''); // Clear input field
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= interviewQuestions.length) {
      setInterviewComplete(true);
      setAgentResponse("Thank you for completing the interview simulation. You can review your conversation history below.");
    } else {
      setCurrentQuestionIndex(nextIndex);
      setAgentResponse(''); // Clear agent response for next question
    }
  };

  const startInterview = () => {
    setShowPrep(false);
    setAgentResponse("Welcome to your visa interview simulation. I'll be asking you several questions about your visa application. Please answer honestly as you would in a real interview.");
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
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={userConfidence}
                onChange={(e) => setUserConfidence(parseInt(e.target.value))}
              />
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
              <label>
                <input 
                  type="checkbox" 
                  checked={userNeeds.includes('answering')}
                  onChange={() => handleNeedsChange('answering')}
                />
                Answering questions effectively
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={userNeeds.includes('documentation')}
                  onChange={() => handleNeedsChange('documentation')}
                />
                Required documentation
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={userNeeds.includes('english')}
                  onChange={() => handleNeedsChange('english')}
                />
                English language skills
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={userNeeds.includes('nervousness')}
                  onChange={() => handleNeedsChange('nervousness')}
                />
                Managing nervousness
              </label>
            </div>
          </div>
          
          <div className="prep-section">
            <h4>How detailed would you like the feedback to be?</h4>
            <div className="feedback-radios">
              <label>
                <input 
                  type="radio" 
                  name="feedback" 
                  value="brief"
                  checked={feedbackLevel === 'brief'}
                  onChange={() => setFeedbackLevel('brief')}
                />
                Brief (Just tell me if I'm on the right track)
              </label>
              <label>
                <input 
                  type="radio" 
                  name="feedback" 
                  value="detailed"
                  checked={feedbackLevel === 'detailed'}
                  onChange={() => setFeedbackLevel('detailed')}
                />
                Detailed (Provide specific suggestions)
              </label>
              <label>
                <input 
                  type="radio" 
                  name="feedback" 
                  value="realistic"
                  checked={feedbackLevel === 'realistic'}
                  onChange={() => setFeedbackLevel('realistic')}
                />
                Realistic (Minimal feedback, like a real interview)
              </label>
            </div>
          </div>
          
          <div className="prep-section">
            <h4>General Interview Tips</h4>
            <ul className="tips-list">
              {preparationTips.general.map((tip, index) => (
                <li key={`general-${index}`}>{tip}</li>
              ))}
            </ul>
          </div>
          
          <div className="prep-section">
            <h4>Specific Tips for {selectedCountry} {selectedVisaType} Visa</h4>
            <ul className="tips-list">
              {preparationTips.specific.map((tip, index) => (
                <li key={`specific-${index}`}>{tip}</li>
              ))}
            </ul>
          </div>
          
          <div className="prep-section">
            <h4>Common Mistakes to Avoid</h4>
            <ul className="tips-list">
              {commonMistakes.map((mistake, index) => (
                <li key={`mistake-${index}`}>{mistake}</li>
              ))}
            </ul>
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
                  <div className="avatar agent-avatar">🧑‍💼</div>
                  <div className="message-bubble agent-bubble">
                    <p className="question-text">{item.question}</p>
                  </div>
                </div>
                
                <div className="user-response">
                  <div className="message-bubble user-bubble">
                    <p>{item.userResponse}</p>
                  </div>
                  <div className="avatar user-avatar">👤</div>
                </div>
                
                {item.agentResponse && feedbackLevel !== 'realistic' && (
                  <div className="agent-feedback">
                    <div className="avatar agent-avatar">🧑‍💼</div>
                    <div className="message-bubble agent-bubble">
                      <p>{feedbackLevel === 'brief' 
                        ? item.agentResponse.split('.')[0] + '.' // Just the first sentence
                        : item.agentResponse}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Current question section */}
          {!isInterviewOver ? (
            <div className="current-question-section">
              {agentResponse && conversationHistory.length === 0 && (
                <div className="welcome-message">
                  <div className="avatar agent-avatar">🧑‍💼</div>
                  <div className="message-bubble agent-bubble">
                    <p>{agentResponse}</p>
                  </div>
                </div>
              )}
              
              {currentQuestion && (
                <div className="current-question">
                  <div className="avatar agent-avatar">🧑‍💼</div>
                  <div className="message-bubble agent-bubble">
                    <p className="question-text">{currentQuestion}</p>
                    <span className="question-number">Question {currentQuestionIndex + 1} of {interviewQuestions.length}</span>
                  </div>
                </div>
              )}
              
              <div className="user-input-section">
                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here..."
                  className="response-input"
                  disabled={isLoading}
                />
                
                {feedbackMessage && (
                  <p className="feedback-message">{feedbackMessage}</p>
                )}
                
                <div className="button-group">
                  <button 
                    className="submit-button"
                    onClick={handleUserResponse}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Submit Answer"}
                  </button>
                  
                  {agentResponse && !isLoading && feedbackLevel !== 'realistic' && (
                    <button 
                      className="next-button"
                      onClick={handleNextQuestion}
                    >
                      {currentQuestionIndex < interviewQuestions.length - 1 ? "Next Question" : "Complete Interview"}
                    </button>
                  )}
                  
                  {feedbackLevel === 'realistic' && (
                    <button 
                      className="next-button"
                      onClick={handleNextQuestion}
                    >
                      {currentQuestionIndex < interviewQuestions.length - 1 ? "Next Question" : "Complete Interview"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="interview-complete">
              <div className="completion-message">
                <h3>🎉 Interview Simulation Complete</h3>
                <p>You've completed all questions for this visa interview simulation.</p>
                <p>Review your conversation above to see how you did.</p>
                
                <div className="completion-actions">
                  <button className="restart-button" onClick={() => {
                    setCurrentQuestionIndex(0);
                    setConversationHistory([]);
                    setAgentResponse("Welcome back! Let's start the interview again.");
                    setInterviewComplete(false);
                  }}>
                    Restart Interview
                  </button>
                  
                  <button className="prep-button" onClick={() => {
                    setShowPrep(true);
                    setCurrentQuestionIndex(0);
                    setConversationHistory([]);
                    setInterviewComplete(false);
                  }}>
                    Review Preparation Tips
                  </button>
                </div>
                
                <div className="interview-summary">
                  <h4>Interview Summary</h4>
                  <p>Questions answered: {conversationHistory.length}/{interviewQuestions.length}</p>
                  <p>You did well on questions about:</p>
                  <ul>
                    {/* This would be dynamic in a real implementation */}
                    <li>Your study plans</li>
                    <li>Financial arrangements</li>
                  </ul>
                  <p>Areas for improvement:</p>
                  <ul>
                    {/* This would be dynamic in a real implementation */}
                    <li>Being more specific about post-graduation plans</li>
                    <li>Demonstrating stronger ties to home country</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImprovedInterviewScreen;