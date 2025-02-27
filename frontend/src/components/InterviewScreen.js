import React, { useState, useEffect } from 'react';
import AgentResponse from './AgentResponse';
import UserInput from './UserInput';
import { mockAgentService } from '../services/mockAgentService'; // Import mock service

function InterviewScreen({ selectedCountry }) {
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [agentResponse, setAgentResponse] = useState('');

  useEffect(() => {
    // For MVP, hardcoded questions for US F1 Visa
    if (selectedCountry === 'US_F1') {
      setInterviewQuestions([
        "What are your plans after completing your studies in the US?",
        "Why did you choose to study in the United States?",
        "Who will be sponsoring your education?",
        "What is your intended major of study?",
        "Where do you plan to stay in the United States?",
      ]);
    }
  }, [selectedCountry]);

  const handleUserResponse = async (userResponse) => {
    if (currentQuestionIndex < interviewQuestions.length) {
      // Get mock agent response (replace with actual service in future)
      const response = await mockAgentService.getAgentResponse(interviewQuestions[currentQuestionIndex], userResponse);
      setAgentResponse(response);
    } else {
      setAgentResponse("Interview Finished. Thank you for your time."); // End of interview
    }
  };

  const handleNextQuestion = () => {
    setAgentResponse(''); // Clear agent response for next question
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const currentQuestion = interviewQuestions[currentQuestionIndex];
  const isInterviewOver = currentQuestionIndex >= interviewQuestions.length;

  return (
    <div>
      <h2>Visa Interview Simulation ({selectedCountry})</h2>
      {currentQuestion && !isInterviewOver && (
        <div>
          <AgentResponse question={currentQuestion} response={agentResponse} />
          <UserInput onResponseSubmit={handleUserResponse} />
          {agentResponse && <button onClick={handleNextQuestion}>Next Question</button>}
        </div>
      )}
      {isInterviewOver && (
        <p><b>Interview Simulation Complete.</b></p>
      )}
    </div>
  );
}

export default InterviewScreen;