const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getProductAnalyticsStatus,
  normalizeEventName,
  parseEventBody,
  recordProductEvent,
  sanitizeProperties,
} = require('../utils/productAnalytics');

test('normalizeEventName keeps safe names and rejects invalid names', () => {
  assert.equal(normalizeEventName('session_started'), 'session_started');
  assert.equal(normalizeEventName(' bad name with spaces '), 'unknown_event');
  assert.equal(normalizeEventName(''), 'unknown_event');
});

test('sanitizeProperties keeps only allowed non-sensitive fields', () => {
  const sanitized = sanitizeProperties({
    country: 'US',
    visaType: 'F1',
    source: 'gemini',
    answer: 'private answer should not be logged',
    sessionContext: { notes: 'private notes' },
    concerns: ['documentation', 'english', { unsafe: true }],
    readinessScore: 82,
  });

  assert.deepEqual(sanitized, {
    country: 'US',
    visaType: 'F1',
    source: 'gemini',
    concerns: ['documentation', 'english'],
    readinessScore: 82,
  });
});

test('parseEventBody accepts JSON objects and text/plain beacon payloads', () => {
  assert.deepEqual(parseEventBody({
    eventName: 'session_started',
    properties: { country: 'US' },
  }), {
    eventName: 'session_started',
    properties: { country: 'US' },
  });

  assert.deepEqual(parseEventBody('{"eventName":"session_completed","properties":{"visaType":"F1"}}'), {
    eventName: 'session_completed',
    properties: { visaType: 'F1' },
  });

  assert.deepEqual(parseEventBody('not json'), {});
});

test('recordProductEvent returns sanitized event and updates counters', () => {
  const before = getProductAnalyticsStatus().totalEvents;
  const event = recordProductEvent({
    eventName: 'feedback_source_used',
    properties: {
      source: 'local',
      userAnswer: 'do not keep this',
    },
    timestamp: '2026-05-25T00:00:00.000Z',
  });
  const after = getProductAnalyticsStatus();

  assert.equal(event.eventName, 'feedback_source_used');
  assert.deepEqual(event.properties, { source: 'local' });
  assert.equal(after.totalEvents, before + 1);
  assert.equal(after.eventsByName.feedback_source_used >= 1, true);
  assert.equal(after.lastEventAt, '2026-05-25T00:00:00.000Z');
});
