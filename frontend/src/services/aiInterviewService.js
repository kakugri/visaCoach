// aiInterviewService.js
import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import { markLocalSessionMigrated } from './sessionMigration';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

const buildAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getLocalFeedback = (question, userAnswer, country, visaType, sessionContext = {}) => {
  const answer = userAnswer.trim();
  const lowerAnswer = answer.toLowerCase();
  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  const context = sessionContext.context || {};
  const notes = [];

  if (wordCount < 20) {
    notes.push('Give a more complete answer with concrete details.');
  } else {
    notes.push('Your answer has enough length to be reviewed.');
  }

  if (/(because|so that|therefore|my plan|i plan|after|return)/.test(lowerAnswer)) {
    notes.push('You connect the answer to a plan, which helps it sound intentional.');
  } else {
    notes.push('Add the reason behind your answer so it does not sound memorized.');
  }

  if (/(fund|sponsor|scholarship|salary|savings|bank|tuition|employer|company)/.test(lowerAnswer)) {
    notes.push('You mention support or resources; be ready to match this with documents.');
  } else if (context.fundingSource) {
    notes.push(`Tie your answer back to your funding source: ${context.fundingSource}.`);
  } else if (/fund|finance|pay|support|sponsor|expense/.test(question.toLowerCase())) {
    notes.push('This question needs a clear funding source and supporting evidence.');
  }

  if (/(home|return|family|job|employer|property|business|country|community)/.test(lowerAnswer)) {
    notes.push('You mention ties or context outside the destination country.');
  } else if (context.returnPlan) {
    notes.push(`Connect this answer to your return plan or home ties: ${context.returnPlan}.`);
  } else if (/ties|return|after|plans/.test(question.toLowerCase())) {
    notes.push('Add specific ties or post-visit plans to make the return story clearer.');
  }

  const feedback = {
    quickRead: `Practice feedback for ${country} ${visaType}: ${notes[0] || 'Your answer can be reviewed.'}`,
    mainFix: notes[1] || 'Add one concrete detail that matches your application.',
    strongerAnswer: context.programOrPurpose
      ? `I plan to use this opportunity for ${context.programOrPurpose}, and my next step is tied to my plans outside ${country}.`
      : 'Give a concise answer with one reason, one concrete detail, and a clear next step.',
    consistencyCheck: context.fundingSource
      ? `Make sure your documents support this funding source: ${context.fundingSource}.`
      : 'Keep the final answer truthful, concise, and consistent with your application materials.',
    riskFlags: notes.filter(note => /vague|clear|specific|funding|ties|short/i.test(note)).slice(0, 2),
    followUpQuestion: context.returnPlan
      ? `How does this answer support your plan to ${context.returnPlan}?`
      : 'What specific fact can you add to make this answer more credible?',
  };

  return {
    text: [
      `**Quick read:** ${feedback.quickRead}`,
      `**Main fix:** ${feedback.mainFix}`,
      `**Stronger answer:** ${feedback.strongerAnswer}`,
      `**Check:** ${feedback.consistencyCheck}`,
    ].join('\n'),
    feedback,
  };
};

export const aiInterviewService = {
  async generateQuestions(country, visaType, sessionContext = {}) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/interview/questions`, {
        country,
        visaType,
        sessionContext,
      }, {
        headers: buildAuthHeaders()
      });

      return {
        questions: Array.isArray(response.data.questions) ? response.data.questions : [],
        source: response.data.source || 'gemini',
        sourceReason: response.data.sourceReason,
        retryAfterSeconds: response.data.retryAfterSeconds,
        model: response.data.model,
      };
    } catch (error) {
      console.error('Error generating interview questions:', error);
      return {
        questions: [],
        source: 'local',
        sourceReason: 'network',
        model: 'local-question-bank',
      };
    }
  },

  async getAgentResponse(question, userAnswer, country, visaType, feedbackStyle = 'detailed', sessionContext = {}) {
    const localText = feedbackStyle === 'realistic'
      ? { text: 'Thank you. Please be ready to explain that with one concrete detail if asked.', feedback: null }
      : getLocalFeedback(question, userAnswer, country, visaType, sessionContext);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/interview/agent-response`, {
        question,
        userAnswer,
        country,
        visaType,
        feedbackStyle,
        sessionContext
      }, {
        headers: buildAuthHeaders()
      });
      
      return {
        text: response.data.response,
        source: response.data.source || 'gemini',
        sourceReason: response.data.sourceReason,
        retryAfterSeconds: response.data.retryAfterSeconds,
        model: response.data.model,
        feedback: response.data.feedback,
      };
    } catch (error) {
      console.error('Error getting AI response:', error);
      return {
        text: localText.text,
        feedback: localText.feedback,
        source: 'local',
        sourceReason: 'network',
      };
    }
  },
  
  async getPreInterviewTips(country, visaType) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/interview/tips?country=${encodeURIComponent(country)}&visaType=${encodeURIComponent(visaType)}`, {
        headers: buildAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting interview tips:', error);
      // Return fallback tips
      return {
        general: ["Answer truthfully", "Be concise", "Maintain eye contact"],
        specific: ["Know the purpose of your visa", "Be prepared to explain your ties to home"]
      };
    }
  },
  
  async getCommonMistakes(country, visaType) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/interview/common-mistakes?country=${encodeURIComponent(country)}&visaType=${encodeURIComponent(visaType)}`, {
        headers: buildAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting common mistakes:', error);
      return ["Being vague about plans", "Inconsistent answers"];
    }
  },
  
  async saveInterviewHistory(data) {
    try {
      const token = getAuthToken();

      localStorage.setItem('visaCoach:lastSession', JSON.stringify(data));

      if (!token) {
        return { message: 'Interview history saved locally' };
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/interview/save-history`, data, {
        headers: buildAuthHeaders()
      });
      markLocalSessionMigrated(data, { status: 'migrated' });
      return response.data;
    } catch (error) {
      console.error('Error saving interview history:', error);
      localStorage.setItem('visaCoach:lastSession', JSON.stringify(data));
      return { message: 'Interview history saved locally' };
    }
  }
};
