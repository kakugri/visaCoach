const createNotFoundHandler = () => (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    requestId: req.requestId,
  });
};

const createErrorHandler = ({ logger = console } = {}) => (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || (err.type === 'entity.too.large' ? 413 : 500);
  const message = status === 500 ? 'Server error' : err.message;

  logger.error(JSON.stringify({
    level: 'error',
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    status,
    message: err.message,
  }));

  return res.status(status).json({
    error: message,
    requestId: req.requestId,
  });
};

module.exports = {
  createErrorHandler,
  createNotFoundHandler,
};
