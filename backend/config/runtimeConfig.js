const DEFAULT_CORS_ORIGINS = 'http://localhost:3000,http://127.0.0.1:3000';

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const parseInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseOrigins = (value = DEFAULT_CORS_ORIGINS) => value
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const getRuntimeConfig = (env = process.env) => ({
  nodeEnv: env.NODE_ENV || 'development',
  host: env.HOST || '127.0.0.1',
  port: parseInteger(env.PORT, 5000),
  allowedOrigins: parseOrigins(env.CORS_ORIGINS || DEFAULT_CORS_ORIGINS),
  mongoUriSet: Boolean(env.MONGODB_URI),
  jwtSecretSet: Boolean(env.JWT_SECRET),
  geminiKeySet: Boolean(env.GEMINI_API_KEY),
  geminiModel: env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
  googleClientIdSet: Boolean(env.GOOGLE_CLIENT_ID || env.REACT_APP_GOOGLE_CLIENT_ID),
  aiRateLimitWindowMs: parseInteger(env.AI_RATE_LIMIT_WINDOW_MS, 60_000),
  aiRateLimitMax: parseInteger(env.AI_RATE_LIMIT_MAX, 20),
  jsonBodyLimit: env.JSON_BODY_LIMIT || '100kb',
  requestLogging: parseBoolean(env.REQUEST_LOGGING, true),
  logLevel: env.LOG_LEVEL || 'info',
});

const validateRuntimeConfig = (config) => {
  const warnings = [];
  const errors = [];

  if (!config.mongoUriSet) {
    warnings.push('MONGODB_URI is not set; authenticated history routes will not persist data.');
  }

  if (!config.jwtSecretSet) {
    warnings.push('JWT_SECRET is not set; login, registration, and authenticated history will fail.');
  }

  if (!config.geminiKeySet) {
    warnings.push('GEMINI_API_KEY is not set; feedback will fall back to local heuristics.');
  }

  if (!config.allowedOrigins.length) {
    errors.push('CORS_ORIGINS must contain at least one allowed origin.');
  }

  if (config.nodeEnv === 'production') {
    if (!config.mongoUriSet) errors.push('MONGODB_URI is required in production.');
    if (!config.jwtSecretSet) errors.push('JWT_SECRET is required in production.');
    if (!config.geminiKeySet) errors.push('GEMINI_API_KEY is required in production.');
    if (config.allowedOrigins.some((origin) => origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      warnings.push('CORS_ORIGINS includes local origins in production.');
    }
  }

  return { warnings, errors };
};

const getPublicConfigStatus = (config) => ({
  nodeEnv: config.nodeEnv,
  allowedOrigins: config.allowedOrigins,
  mongoUriSet: config.mongoUriSet,
  jwtSecretSet: config.jwtSecretSet,
  geminiKeySet: config.geminiKeySet,
  geminiModel: config.geminiModel,
  googleClientIdSet: config.googleClientIdSet,
  aiRateLimitWindowMs: config.aiRateLimitWindowMs,
  aiRateLimitMax: config.aiRateLimitMax,
  jsonBodyLimit: config.jsonBodyLimit,
  requestLogging: config.requestLogging,
});

module.exports = {
  DEFAULT_CORS_ORIGINS,
  getPublicConfigStatus,
  getRuntimeConfig,
  parseBoolean,
  parseInteger,
  parseOrigins,
  validateRuntimeConfig,
};
