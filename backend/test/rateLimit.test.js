const test = require('node:test');
const assert = require('node:assert/strict');

const { createRateLimiter } = require('../middleware/rateLimit');

const createMockResponse = () => ({
  statusCode: 200,
  headers: {},
  body: null,
  set(name, value) {
    this.headers[name] = value;
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test('createRateLimiter blocks requests over the configured max', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });
  const req = {
    headers: {},
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
  };
  let nextCount = 0;

  const first = createMockResponse();
  limiter(req, first, () => {
    nextCount += 1;
  });

  const second = createMockResponse();
  limiter(req, second, () => {
    nextCount += 1;
  });

  const third = createMockResponse();
  limiter(req, third, () => {
    nextCount += 1;
  });

  assert.equal(nextCount, 2);
  assert.equal(third.statusCode, 429);
  assert.equal(third.body.error.includes('Too many requests'), true);
});
