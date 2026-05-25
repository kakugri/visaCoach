const getMongoStatus = (mongoose) => {
  const state = mongoose.connection?.readyState;
  const labels = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    readyState: state,
    label: labels[state] || 'unknown',
  };
};

const getHealthPayload = ({
  mongoose,
  config,
  startedAt = Date.now(),
  includeDetails = true,
  aiStatus = null,
  analyticsStatus = null,
}) => {
  const mongo = getMongoStatus(mongoose);
  const hasMongoProblem = config.mongoUriSet && mongo.readyState !== 1;
  const status = hasMongoProblem ? 'degraded' : 'ok';

  const payload = {
    status,
    service: 'visacoach-backend',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    startedAt: new Date(startedAt).toISOString(),
  };

  if (includeDetails) {
    payload.checks = {
      mongo,
      geminiConfigured: config.geminiKeySet,
      jwtConfigured: config.jwtSecretSet,
      googleAuthConfigured: config.googleClientIdSet,
    };

    if (aiStatus) {
      payload.checks.ai = {
        geminiConfigured: config.geminiKeySet,
        ...aiStatus,
      };
    }

    if (analyticsStatus) {
      payload.checks.analytics = analyticsStatus;
    }
  }

  return payload;
};

module.exports = {
  getHealthPayload,
  getMongoStatus,
};
