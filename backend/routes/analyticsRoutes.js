const express = require('express');
const { createRateLimiter } = require('../middleware/rateLimit');
const {
  getProductAnalyticsStatus,
  recordProductEvent,
} = require('../utils/productAnalytics');

const router = express.Router();

const analyticsRateLimit = createRateLimiter({
  windowMs: Number(process.env.ANALYTICS_RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.ANALYTICS_RATE_LIMIT_MAX) || 120,
});

router.post('/event', analyticsRateLimit, (req, res) => {
  const event = recordProductEvent({
    eventName: req.body?.eventName,
    properties: req.body?.properties,
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
