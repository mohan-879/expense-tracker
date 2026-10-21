const { generateToken } = require('../services/authService');
const jwt = require('jsonwebtoken');

describe('Auth Service & Token Verification Tests', () => {
  test('Should generate valid JWT token containing user id', () => {
    const dummyId = '660f1234567890abcdef1234';
    const token = generateToken(dummyId);
    expect(token).toBeDefined();

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'clubfund_super_secret_jwt_key_2026_dev'
    );
    expect(decoded.id).toBe(dummyId);
  });
});
