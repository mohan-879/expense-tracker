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

// @desc    Request Password Reset (Requires Admin Manual Reset)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 400, 'Please enter your registered email address');
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return errorResponse(res, 404, 'No registered user account found with this email address');
    }

    // Notify Admins about the manual reset request
    const admins = await User.find({ role: 'ADMIN', isActive: true });
    for (const admin of admins) {
      await sendNotification({
        user: admin._id,
        title: 'Manual Password Reset Requested',
        message: `User ${user.fullName} (${user.email}, ${user.role}) requested a password reset. Please verify their identity and reset manually in Users & Approvals.`,
        type: 'USER_APPROVAL',
      });
    }

    await logAuditAction({
      user: user._id,
      action: 'PASSWORD_RESET_REQUESTED',
      entityType: 'User',
      entityId: user._id,
      description: `${user.fullName} (${user.email}) submitted a password reset request. Admin has been notified for manual processing.`,
      ipAddress: req.ip,
    });

    return successResponse(
      res,
      200,
      'Your password reset request has been logged and forwarded to the System Administrator. To complete the reset, please contact the Administrator who will manually verify your identity and update your credentials.'
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
