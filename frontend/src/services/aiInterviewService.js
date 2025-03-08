// aiInterviewService.js
import axios from 'axios';

// Define the API base URL
const API_BASE_URL = 'http://localhost:5000'; // Change this to your backend URL

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const aiInterviewService = {
  async getAgentResponse(question, userAnswer, country, visaType) {
    try {
      const token = getAuthToken();
      
      const response = await axios.post(`${API_BASE_URL}/api/interview/agent-response`, {
        question,
        userAnswer,
        country,
        visaType
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.response;
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw error;
    }
  },
  
  async getPreInterviewTips(country, visaType) {
    try {
      const token = getAuthToken();
      
      const response = await axios.get(`${API_BASE_URL}/api/interview/tips?country=${country}&visaType=${visaType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      const token = getAuthToken();
      
      const response = await axios.get(`${API_BASE_URL}/api/interview/common-mistakes?country=${country}&visaType=${visaType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      
      const response = await axios.post(`${API_BASE_URL}/api/interview/save-history`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving interview history:', error);
      throw error;
    }
  }
};