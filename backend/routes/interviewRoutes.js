const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

// InterviewRoutes.js - Update with new endpoints
router.post('/agent-response', interviewController.getAgentResponse);
router.get('/tips', interviewController.getPreInterviewTips);
router.get('/common-mistakes', interviewController.getCommonMistakes);
router.post('/save-history', async (req, res) => {
  try {
    const { country, visaType, interviewHistory } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const simplifiedHistory = interviewHistory.map(item => ({
      question: item.question,
      answer: item.userResponse,
      feedback: item.agentResponse,
    }));

    user.interviewHistory.push({
      country: country,
      visaType: visaType,
      questions: simplifiedHistory,
    });

    await user.save();

    res.status(200).json({ message: 'Interview history saved successfully', interviewHistory });
  } catch (error) {
    console.error('Error saving interview history:', error);
    res.status(500).json({ error: 'Failed to save interview history' });
  }
});
// ...
module.exports = router;