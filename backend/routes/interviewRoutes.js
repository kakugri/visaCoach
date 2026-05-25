const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const User = require('../models/User');
const { authMiddleware } = require('../utils/authUtils');
const { createRateLimiter } = require('../middleware/rateLimit');

const agentResponseRateLimit = createRateLimiter({
  windowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.AI_RATE_LIMIT_MAX) || 20,
});

// InterviewRoutes.js - Update with new endpoints
router.post('/agent-response', agentResponseRateLimit, interviewController.getAgentResponse);
router.get('/tips', interviewController.getPreInterviewTips);
router.get('/common-mistakes', interviewController.getCommonMistakes);
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('interviewHistory');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user.interviewHistory || []);
  } catch (error) {
    console.error('Error fetching interview history:', error);
    res.status(500).json({ error: 'Failed to fetch interview history' });
  }
});

router.post('/save-history', authMiddleware, async (req, res) => {
  try {
    const {
      country,
      visaType,
      interviewHistory,
      sessionId,
      sessionContext,
      confidence,
      concerns,
      feedbackLevel,
      stats,
    } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (sessionId && user.interviewHistory.some(session => session.sessionId === sessionId)) {
      return res.status(200).json({
        message: 'Interview history already saved',
        sessionId,
        duplicate: true,
      });
    }

    const simplifiedHistory = interviewHistory.map(item => ({
      question: item.question,
      answer: item.userResponse,
      feedback: item.agentResponse,
      feedbackDetails: item.feedback,
      feedbackSource: item.feedbackSource,
      feedbackStyle: item.feedbackStyle,
    }));

    user.interviewHistory.push({
      sessionId,
      country: country,
      visaType: visaType,
      questions: simplifiedHistory,
      sessionContext,
      confidence,
      concerns,
      feedbackLevel,
      stats,
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
