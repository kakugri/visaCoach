const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getPublicConfigStatus,
  getRuntimeConfig,
  parseBoolean,
  parseOrigins,
  validateRuntimeConfig,
} = require('../config/runtimeConfig');

test('parseOrigins trims and removes empty origins', () => {
  assert.deepEqual(
    parseOrigins(' https://example.com, ,http://localhost:3000 '),
    ['https://example.com', 'http://localhost:3000'],
  );
});

test('parseBoolean handles common truthy and fallback values', () => {
  assert.equal(parseBoolean('true'), true);
  assert.equal(parseBoolean('1'), true);
  assert.equal(parseBoolean('off'), false);
  assert.equal(parseBoolean(undefined, true), true);
});

test('getRuntimeConfig parses deployment env without exposing secrets', () => {
  const config = getRuntimeConfig({
    NODE_ENV: 'production',
    HOST: '0.0.0.0',
    PORT: '8080',
    CORS_ORIGINS: 'https://visacoach.example',
    MONGODB_URI: 'mongodb+srv://secret',
    JWT_SECRET: 'secret',
    GEMINI_API_KEY: 'secret',
    GEMINI_MODEL: 'gemini-2.5-flash-lite',
    GOOGLE_CLIENT_ID: 'google-client-id',
    AI_RATE_LIMIT_WINDOW_MS: '120000',
    AI_RATE_LIMIT_MAX: '10',
    REQUEST_LOGGING: 'false',
  });

  assert.equal(config.nodeEnv, 'production');
  assert.equal(config.host, '0.0.0.0');
  assert.equal(config.port, 8080);
  assert.equal(config.mongoUriSet, true);
  assert.equal(config.geminiKeySet, true);
  assert.equal(config.googleClientIdSet, true);
  assert.equal(config.requestLogging, false);
  assert.deepEqual(config.allowedOrigins, ['https://visacoach.example']);

  const publicStatus = getPublicConfigStatus(config);
  assert.equal(publicStatus.mongoUriSet, true);
  assert.equal(Object.prototype.hasOwnProperty.call(publicStatus, 'MONGODB_URI'), false);
});

test('validateRuntimeConfig requires core secrets in production', () => {
  const result = validateRuntimeConfig(getRuntimeConfig({
    NODE_ENV: 'production',
    CORS_ORIGINS: 'https://visacoach.example',
  }));

  assert.match(result.errors.join('\n'), /MONGODB_URI is required/);
  assert.match(result.errors.join('\n'), /JWT_SECRET is required/);
  assert.match(result.errors.join('\n'), /GEMINI_API_KEY is required/);
});
