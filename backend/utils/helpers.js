/**
 * Standard Success API Response
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standard Error API Response
 */
const errorResponse = (res, statusCode = 400, message = 'Error occurred', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

/**
 * Generate sequential/random code strings e.g. EXP-2026-8492
 */
const generateCode = (prefix) => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${randomDigits}`;
};

module.exports = {
  successResponse,
  errorResponse,
  generateCode,
};
