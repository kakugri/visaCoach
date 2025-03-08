// In InterviewController.js
// const { Configuration, OpenAIApi } = require("openai"); // Example using OpenAI
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

const getAgentResponse = async (req, res) => {
  try {
    const { question, userAnswer, country, visaType } = req.body;
    
    // Create prompt for the AI
    const prompt = `You are a visa officer for ${country} conducting an interview for a ${visaType} visa application. 
    The applicant was asked: "${question}" 
    They responded: "${userAnswer}"
    
    Provide feedback on this response. Consider:
    1. How well it addresses the question
    2. Any red flags or inconsistencies
    3. What could be improved
    4. How a real visa officer might react`;
    
    // const completion = await openai.createCompletion({
    //   model: "gpt-4", // or other appropriate model
    //   prompt: prompt,
    //   max_tokens: 300,
    //   temperature: 0.7,
    // });

    const result = await model.generateContent(prompt);
    res.json({ response: result.response.text().trim() });
    console.log(result.response.text());
    
    // res.json({ response: completion.data.choices[0].text.trim() });
  } catch (error) {
    console.error('Error in AI response:', error);
    res.status(500).json({ error: "Failed to generate response" });
  }
};

// Implement the other controller functions similarly
const getPreInterviewTips = async (req, res) => {
  try {
    const { country, visaType } = req.query;

    // Define tips based on country and visa type
    const tipsData = {
      US: {
        F1: {
          general: [
            "Be prepared to explain your study plan and future goals clearly.",
            "Know how you will finance your education and living expenses.",
            "Demonstrate a strong connection to your home country.",
          ],
          specific: [
            "Clearly articulate your academic intentions.",
            "Be aware of the program and university details.",
            "Have your financial documents readily available.",
          ],
        },
        "B1/B2": {
          general: [
            "Clearly state the purpose of your visit.",
            "Provide evidence of sufficient funds.",
            "Prove that you will return to your home country.",
          ],
          specific: [
            "Be ready to explain your itinerary.",
            "Show ties to your home country.",
            "Have information about your host or accommodation.",
          ],
        },
      },
      CA: {
        student: {
          general: [
            "Clearly state your reasons for choosing to study in Canada.",
            "Be able to explain how your studies will benefit your future career.",
            "Provide evidence of sufficient funds for tuition and living expenses.",
          ],
          specific: [
            "Know details about the institution and program.",
            "Be aware of the city where your institution is located.",
            "Be ready to explain your plans after completing your studies.",
          ],
        },
      },
      UK: {
        student: {
          general: [
            "Clearly state why you want to study in the UK.",
            "Demonstrate that you have sufficient funds.",
            "Explain your plans after completing your course.",
          ],
          specific: [
            "Know the details of your chosen institution and course.",
            "Relate the course to your previous education or career goals.",
            "Be ready to explain your accommodation plans.",
          ],
        },
      },
    };

    if (tipsData[country] && tipsData[country][visaType]) {
      res.json(tipsData[country][visaType]);
    } else {
      res.status(404).json({ error: "Tips not found for the specified country and visa type." });
    }
  } catch (error) {
    console.error('Error getting pre-interview tips:', error);
    res.status(500).json({ error: "Failed to fetch pre-interview tips" });
  }
};

const getCommonMistakes = async (req, res) => {
  try {
    const { country, visaType } = req.query;
    // Define common mistakes based on country and visa type
    const mistakesData = {
        US: {
          F1: [
            "Not being able to clearly explain your study plans and goals.",
            "Inadequate proof of financial support.",
            "Vague or inconsistent answers about ties to home country.",
            "Lack of knowledge about the chosen university or program.",
            "Appearing overly focused on post-graduation work in the U.S.",
          ],
          "B1/B2": [
            "Inability to clearly state the purpose of the visit.",
            "Inadequate proof of funds or financial support.",
            "Failure to demonstrate ties to home country.",
            "Vague travel plans or itinerary.",
            "Inconsistencies in the provided information.",
            "Insufficient knowledge about the duration or purpose of the visit.",
          ],
        },
        CA: {
          student: [
            "Not being able to clearly explain your study plans.",
            "Inadequate proof of financial support.",
            "Vague or inconsistent answers about ties to home country.",
            "Lack of knowledge about the chosen university or program.",
            "Inconsistencies in the provided information.",
            "Appearing overly focused on post-graduation work in Canada.",
          ],
        },
        UK: {
          student: [
            "Not being able to clearly explain your study plans.",
            "Inadequate proof of financial support.",
            "Vague or inconsistent answers about ties to home country.",
            "Lack of knowledge about the chosen university or program.",
            "Inconsistencies in the provided information.",
            "Appearing overly focused on post-graduation work in the UK.",
          ],
        },
      };
    if(mistakesData[country] && mistakesData[country][visaType]){
        res.json(mistakesData[country][visaType]);
    }
    else{
        res.status(404).json({ error: "Common Mistakes not found for the specified country and visa type." });
    }
  } catch (error) {
    console.error('Error getting common mistakes:', error);
    res.status(500).json({ error: "Failed to fetch common mistakes" });
  }
};

module.exports = {
  getAgentResponse,
  getPreInterviewTips,
  getCommonMistakes
};

// // In MVP, we're mostly using the frontend mockAgentService for simplicity.
// // This controller is kept very basic, just to show backend structure if you want to expand later.

// const getAgentResponse = async (req, res) => {
//     // In a real app, this would call the GPT service (or in-house model)
//     // For MVP backend example, just echo back a simplified message
//     const { question, userAnswer } = req.body;
  
//     if (!question || !userAnswer) {
//       return res.status(400).json({ error: "Question and user response are required." });
//     }
  
//     const mockResponse = `[Mock Backend Response] -  Received question: "${question}" and your answer. Backend processing simulated.`;
  
//     res.json({ response: mockResponse });
//   };
  
//   module.exports = {
//     getAgentResponse,
//   };