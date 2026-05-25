const test = require('node:test');
const assert = require('node:assert/strict');

const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');

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
