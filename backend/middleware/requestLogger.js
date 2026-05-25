const crypto = require('crypto');

const createRequestLogger = ({ enabled = true, logger = console } = {}) => (req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  const startedAt = process.hrtime.bigint();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    if (!enabled || req.path === '/health' || req.path === '/api/health') return;

    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    const payload = {
      level,
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs),
      ip: req.ip,
    };

    const logMethod = logger[level] || logger.log || console.log;
    logMethod.call(logger, JSON.stringify(payload));
  });

  next();
};

module.exports = { createRequestLogger };
