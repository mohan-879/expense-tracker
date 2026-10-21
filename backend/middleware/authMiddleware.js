const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/helpers');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'clubfund_super_secret_jwt_key_2026_dev'
      );

      req.user = await User.findById(decoded.id).select('-password').lean();
      if (!req.user || !req.user.isActive) {
        return errorResponse(res, 401, 'User account is inactive or not found');
      }

      return next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return errorResponse(res, 401, 'Not authorized, token failed');
    }
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized, no token provided');
  }
};

module.exports = { protect };
