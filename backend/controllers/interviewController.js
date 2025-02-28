// In MVP, we're mostly using the frontend mockAgentService for simplicity.
// This controller is kept very basic, just to show backend structure if you want to expand later.

const getAgentResponse = async (req, res) => {
    // In a real app, this would call the GPT service (or in-house model)
    // For MVP backend example, just echo back a simplified message
    const { question, userAnswer } = req.body;
  
    if (!question || !userAnswer) {
      return res.status(400).json({ error: "Question and user response are required." });
    }
  
    const mockResponse = `[Mock Backend Response] -  Received question: "${question}" and your answer. Backend processing simulated.`;
  
    res.json({ response: mockResponse });
  };
  
  module.exports = {
    getAgentResponse,
  };