const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

// For MVP, just a mock endpoint to simulate agent response if you want backend interaction later
router.post('/agent-response', interviewController.getAgentResponse);

module.exports = router;