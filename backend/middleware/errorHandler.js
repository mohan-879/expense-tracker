const { errorResponse } = require('../utils/helpers');

const errorHandler = (err, req, res, next) => {
  // Bad JSON in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 400, 'Invalid JSON payload provided');
  }

  console.error('Server Error:', err);

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, 400, `Resource not found. Invalid ID format.`);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, 400, `Duplicate field value entered: ${field}`);
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => val.message);
    return errorResponse(res, 400, 'Validation Error', errors);
  }

  return errorResponse(
    res,
    err.statusCode || 500,
    err.message || 'Internal Server Error'
  );
};

module.exports = errorHandler;
