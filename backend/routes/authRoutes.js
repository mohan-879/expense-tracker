const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  register,
  forgotPassword,
  resetPasswordOtp,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password-otp', resetPasswordOtp);
router.get('/me', protect, getMe);

module.exports = router;
