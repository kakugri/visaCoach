const test = require('node:test');
const assert = require('node:assert/strict');

const { getHealthPayload, getMongoStatus } = require('../utils/health');

test('getMongoStatus maps ready states', () => {
  const status = getMongoStatus({ connection: { readyState: 1 } });
  assert.equal(status.label, 'connected');
  assert.equal(status.readyState, 1);
});

test('getHealthPayload reports ok when Mongo is connected', () => {
  const payload = getHealthPayload({
    mongoose: { connection: { readyState: 1 } },
    startedAt: Date.parse('2026-05-24T00:00:00.000Z'),
    config: {
      mongoUriSet: true,
      geminiKeySet: true,
      jwtSecretSet: true,
      googleClientIdSet: false,
    },
  });

  assert.equal(payload.status, 'ok');
  assert.equal(payload.checks.mongo.label, 'connected');
  assert.equal(payload.checks.geminiConfigured, true);
});

test('getHealthPayload includes sanitized AI runtime status', () => {
  const payload = getHealthPayload({
    mongoose: { connection: { readyState: 1 } },
    startedAt: Date.parse('2026-05-24T00:00:00.000Z'),
    config: {
      mongoUriSet: true,
      geminiKeySet: true,
      jwtSecretSet: true,
      googleClientIdSet: true,
    },
    aiStatus: {
      model: 'gemini-test-model',
      quotaCooldown: {
        active: false,
        retryAfterSeconds: 0,
        blockedUntil: null,
      },
      usageSinceStart: {
        feedback: { gemini: 1, localFallback: 2, quotaFallback: 1, errorFallback: 1 },
        questions: { gemini: 3, localFallback: 0, quotaFallback: 0, errorFallback: 0 },
        lastFallbackAt: '2026-05-24T01:00:00.000Z',
        lastQuotaAt: '2026-05-24T01:00:00.000Z',
      },
    },
  });

  assert.equal(payload.checks.ai.geminiConfigured, true);
  assert.equal(payload.checks.ai.model, 'gemini-test-model');
  assert.equal(payload.checks.ai.quotaCooldown.active, false);
  assert.equal(payload.checks.ai.usageSinceStart.feedback.localFallback, 2);
});

test('getHealthPayload reports degraded when Mongo is configured but disconnected', () => {
  const payload = getHealthPayload({
    mongoose: { connection: { readyState: 0 } },
    config: {
      mongoUriSet: true,
      geminiKeySet: false,
      jwtSecretSet: false,
      googleClientIdSet: false,
    },
  });

  assert.equal(payload.status, 'degraded');
  assert.equal(payload.checks.mongo.label, 'disconnected');
});
