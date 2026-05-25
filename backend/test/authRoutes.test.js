const test = require('node:test');
const assert = require('node:assert/strict');

const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');

test('buildAccountExport returns safe profile fields and saved sessions', () => {
  const exportPayload = authRoutes._test.buildAccountExport({
    _id: '507f191e810c19729de860aa',
    email: 'export@example.com',
    name: 'Export User',
    password: 'hashed-secret',
    __v: 1,
    createdAt: '2026-05-24T00:00:00.000Z',
    lastLogin: '2026-05-25T00:00:00.000Z',
    practiceProfile: {
      destinationCountry: 'US',
      visaType: 'F1',
    },
    interviewHistory: [
      {
        sessionId: 'session-1',
        country: 'US',
        visaType: 'F1',
        questions: [{ question: 'Why this school?', answer: 'Research fit.' }],
      },
    ],
  }, '2026-05-25T12:00:00.000Z');

  assert.equal(exportPayload.exportedAt, '2026-05-25T12:00:00.000Z');
  assert.equal(exportPayload.profile.id, '507f191e810c19729de860aa');
  assert.equal(exportPayload.profile.email, 'export@example.com');
  assert.equal(exportPayload.profile.name, 'Export User');
  assert.equal(exportPayload.profile.practiceProfile.destinationCountry, 'US');
  assert.equal(exportPayload.profile.password, undefined);
  assert.equal(exportPayload.profile.__v, undefined);
  assert.equal(exportPayload.sessionCount, 1);
  assert.equal(exportPayload.sessions[0].sessionId, 'session-1');
});

test('exportAuthenticatedAccount fetches a user without password', async () => {
  const originalFindById = User.findById;
  const selectedFields = [];

  User.findById = (userId) => ({
    select: async (fields) => {
      selectedFields.push(fields);
      return {
        _id: userId,
        email: 'export@example.com',
        name: 'Export User',
        interviewHistory: [{ sessionId: 'session-1' }],
      };
    },
  });

  try {
    const result = await authRoutes._test.exportAuthenticatedAccount('507f191e810c19729de860aa');

    assert.equal(result.status, 200);
    assert.equal(result.body.profile.email, 'export@example.com');
    assert.equal(result.body.sessionCount, 1);
    assert.deepEqual(selectedFields, ['-password']);
  } finally {
    User.findById = originalFindById;
  }
});

test('exportAuthenticatedAccount returns 404 when the user is missing', async () => {
  const originalFindById = User.findById;

  User.findById = () => ({
    select: async () => null,
  });

  try {
    const result = await authRoutes._test.exportAuthenticatedAccount('507f191e810c19729de860ab');

    assert.equal(result.status, 404);
    assert.equal(result.body.error, 'User not found');
  } finally {
    User.findById = originalFindById;
  }
});

test('exportAuthenticatedAccount rejects missing user ids', async () => {
  const result = await authRoutes._test.exportAuthenticatedAccount('');

  assert.equal(result.status, 400);
  assert.equal(result.body.error, 'User ID is missing from token');
});

test('sanitizePracticeProfile trims fields and rejects unknown option values', () => {
  const sanitized = authRoutes._test.sanitizePracticeProfile({
    destinationCountry: ' US ',
    visaType: ' F1 ',
    sessionContext: {
      homeCountry: ' Ghana ',
      institutionOrHost: ' Example University ',
      programOrPurpose: ' MS Computer Science ',
      fundingSource: ' Family sponsor ',
      returnPlan: ' Return home ',
      notes: ' Application notes ',
    },
    confidence: { before: 14 },
    concerns: ['english', 'unknown', 'english', 'nervousness'],
    feedbackLevel: 'not-real',
  });

  assert.equal(sanitized.destinationCountry, 'US');
  assert.equal(sanitized.visaType, 'F1');
  assert.equal(sanitized.sessionContext.homeCountry, 'Ghana');
  assert.equal(sanitized.confidence.before, 10);
  assert.deepEqual(sanitized.concerns, ['english', 'nervousness']);
  assert.equal(sanitized.feedbackLevel, 'detailed');
  assert.ok(sanitized.updatedAt instanceof Date);
});

test('updateAuthenticatedProfile saves a sanitized practice profile', async () => {
  const originalFindById = User.findById;
  const savedUsers = [];

  User.findById = async (userId) => ({
    _id: userId,
    email: 'profile@example.com',
    name: 'Profile User',
    countryOfOrigin: '',
    visaType: '',
    save: async function save() {
      savedUsers.push({
        practiceProfile: this.practiceProfile,
        countryOfOrigin: this.countryOfOrigin,
        visaType: this.visaType,
      });
    },
  });

  try {
    const result = await authRoutes._test.updateAuthenticatedProfile('507f191e810c19729de860ac', {
      practiceProfile: {
        destinationCountry: 'US',
        visaType: 'F1',
        sessionContext: {
          homeCountry: 'Ghana',
          institutionOrHost: 'Example University',
        },
        confidence: { before: 7 },
        concerns: ['answering', 'documentation'],
        feedbackLevel: 'brief',
      },
    });

    assert.equal(result.status, 200);
    assert.equal(result.body.practiceProfile.destinationCountry, 'US');
    assert.equal(result.body.practiceProfile.sessionContext.homeCountry, 'Ghana');
    assert.equal(savedUsers[0].countryOfOrigin, 'Ghana');
    assert.equal(savedUsers[0].visaType, 'F1');
  } finally {
    User.findById = originalFindById;
  }
});

test('updateAuthenticatedProfile returns 404 when the user is missing', async () => {
  const originalFindById = User.findById;

  User.findById = async () => null;

  try {
    const result = await authRoutes._test.updateAuthenticatedProfile('507f191e810c19729de860ad', {
      practiceProfile: { destinationCountry: 'US', visaType: 'F1' },
    });

    assert.equal(result.status, 404);
    assert.equal(result.body.error, 'User not found');
  } finally {
    User.findById = originalFindById;
  }
});

test('deleteAuthenticatedAccount deletes a user by id', async () => {
  const originalFindByIdAndDelete = User.findByIdAndDelete;
  const deletedIds = [];

  User.findByIdAndDelete = async (userId) => {
    deletedIds.push(String(userId));
    return {
      _id: userId,
      email: 'delete@example.com',
      name: 'Delete Me',
    };
  };

  try {
    const result = await authRoutes._test.deleteAuthenticatedAccount('507f191e810c19729de860ea');

    assert.equal(result.status, 200);
    assert.equal(result.body.message, 'Account deleted');
    assert.deepEqual(deletedIds, ['507f191e810c19729de860ea']);
  } finally {
    User.findByIdAndDelete = originalFindByIdAndDelete;
  }
});

test('deleteAuthenticatedAccount returns 404 when the user is missing', async () => {
  const originalFindByIdAndDelete = User.findByIdAndDelete;

  User.findByIdAndDelete = async () => null;

  try {
    const result = await authRoutes._test.deleteAuthenticatedAccount('507f191e810c19729de860eb');

    assert.equal(result.status, 404);
    assert.equal(result.body.error, 'User not found');
  } finally {
    User.findByIdAndDelete = originalFindByIdAndDelete;
  }
});

test('deleteAuthenticatedAccount rejects missing user ids', async () => {
  const result = await authRoutes._test.deleteAuthenticatedAccount('');

  assert.equal(result.status, 400);
  assert.equal(result.body.error, 'User ID is missing from token');
});
