const express = require('express');
const { createRateLimiter } = require('../middleware/rateLimit');
const {
  getProductAnalyticsStatus,
  parseEventBody,
  recordProductEvent,
} = require('../utils/productAnalytics');

const router = express.Router();

const analyticsRateLimit = createRateLimiter({
  windowMs: Number(process.env.ANALYTICS_RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.ANALYTICS_RATE_LIMIT_MAX) || 120,
});

const parseBeaconText = express.text({ type: 'text/plain', limit: '20kb' });

router.post('/event', analyticsRateLimit, parseBeaconText, (req, res) => {
  const body = parseEventBody(req.body);
  const event = recordProductEvent({
    eventName: body.eventName,
    properties: body.properties,
  });

  console.info(JSON.stringify({
    level: 'info',
    type: 'product_analytics_event',
    requestId: req.requestId,
    eventName: event.eventName,
    properties: event.properties,
    timestamp: event.timestamp,
  }));

  res.status(202).json({ accepted: true });
});

router.get('/status', (req, res) => {
  res.json(getProductAnalyticsStatus());
});

module.exports = router;
