const {
  loginUser,
  registerUser,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
} = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    const userData = await loginUser(email, password, req.ip);
    return successResponse(res, 200, 'Login successful', userData);
  } catch (error) {
    return errorResponse(res, 401, error.message);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'User profile fetched', req.user);
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user (Admin Only)
// @route   POST /api/auth/register
// @access  Private (Admin Only)
const register = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return errorResponse(
        res,
        403,
        'Direct registration is disabled. All user accounts are created exclusively by the Administrator. Please contact the Admin.'
      );
    }
    const result = await registerUser(req.body, req.user, req.ip);
    return successResponse(res, 201, 'User account created successfully by Admin', result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// @desc    Request Password Reset (Generates & Sends 6-digit OTP to Email)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 400, 'Please enter your registered email address');
    }

    const result = await requestPasswordResetOtp(email);

    return successResponse(
      res,
      200,
      `A 6-digit verification OTP code has been sent to ${result.email}. Please check your inbox and enter the OTP to reset your password.`,
      result
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password-otp
// @access  Public
const resetPasswordOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return errorResponse(res, 400, 'Email, OTP code, and new password are required');
    }

    await resetPasswordWithOtp(email, otp, newPassword, req.ip);
    return successResponse(
      res,
      200,
      'Password has been reset successfully! You can now log in with your new password.'
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

module.exports = {
  login,
  getMe,
  register,
  forgotPassword,
  resetPasswordOtp,
};
