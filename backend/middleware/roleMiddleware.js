const { errorResponse } = require('../utils/helpers');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'User authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. Required role: ${roles.join(' or ')}. Your role is: ${req.user.role}`
      );
    }

    next();
  };
};

module.exports = { authorize };
