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

const getHealthPayload = ({ mongoose, config, startedAt = Date.now(), includeDetails = true }) => {
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
  }

  return payload;
};

module.exports = {
  getHealthPayload,
  getMongoStatus,
};
