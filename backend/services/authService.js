const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Member = require('../models/Member');
const { logAuditAction } = require('./auditService');
const { sendNotification } = require('./notificationService');
const {
  sendPasswordResetOtpEmail,
  notifyAdminNewUserRegisteredEmail,
} = require('./emailService');

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'clubfund_super_secret_jwt_key_2026_dev',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

/**
 * Authenticate User Login
 */
const loginUser = async (email, password, ipAddress) => {
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Invalid email or password');
  }

  // Check Approval Status
  if (user.approvalStatus === 'PENDING' || user.isApproved === false) {
    throw new Error('Your account is pending approval by the Faculty Coordinator or Admin. You will be able to log in once approved.');
  }

  if (user.approvalStatus === 'REJECTED') {
    throw new Error(`Your account registration was rejected${user.rejectionReason ? ': ' + user.rejectionReason : '. Please contact the administrator.'}`);
  }

  if (!user.isActive) {
    throw new Error('User account has been disabled. Contact Admin.');
  }

  const token = generateToken(user._id);

  // Record Audit Log
  await logAuditAction({
    user: user._id,
    action: 'USER_LOGIN',
    entityType: 'User',
    entityId: user._id,
    description: `User ${user.email} (${user.role}) logged in`,
    ipAddress,
  });

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    clubRole: user.clubRole || 'MEMBER',
    phone: user.phone || '',
    department: user.department || 'AI&DS',
    rollNo: user.rollNo || '',
    year: user.year || '',
    section: user.section || '',
    photo: user.photo || '',
    walletBalance: user.walletBalance || 0,
    token,
  };
};

/**
 * Register User (By Admin, Faculty or Member signup)
 */
const registerUser = async (userData, creator = null, ipAddress = '127.0.0.1') => {
  const { username, email, password, fullName, role, phone, department, year, studentId, designation } = userData;

  const existingEmail = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existingEmail) {
    throw new Error('User with this email already exists');
  }

  const existingUsername = await User.findOne({ username: String(username).toLowerCase().trim() });
  if (existingUsername) {
    throw new Error('User with this username already exists');
  }

  const isSelfRegistration = !creator;
  const initialApprovalStatus = isSelfRegistration ? 'PENDING' : 'APPROVED';
  const initialIsApproved = !isSelfRegistration;

  const user = await User.create({
    username: String(username).toLowerCase().trim(),
    email: String(email).toLowerCase().trim(),
    password,
    fullName: fullName ? fullName.trim() : '',
    role: isSelfRegistration ? 'MEMBER' : (role || 'MEMBER'),
    phone: phone || '',
    department: department || 'General',
    year: year || '',
    approvalStatus: initialApprovalStatus,
    isApproved: initialIsApproved,
  });

  // If role is MEMBER or studentId provided, create corresponding Member record
  let member = null;
  if (user.role === 'MEMBER' || studentId) {
    member = await Member.create({
      user: user._id,
      studentId: studentId || `STU-${Date.now().toString().slice(-6)}`,
      designation: designation || 'Club Member',
    });
  }

  if (creator) {
    await logAuditAction({
      user: creator._id,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user._id,
      description: `Created user ${user.email} with role ${user.role}`,
      ipAddress,
    });
  } else {
    // Notify all Admins and Faculty Coordinators
    try {
      const reviewers = await User.find({
        role: { $in: ['ADMIN', 'FACULTY_COORDINATOR'] },
        isActive: true,
      });

      // Dispatch notification emails and in-app alerts in background without blocking response
      setImmediate(async () => {
        try {
          const reviewerEmails = [];
          for (const rev of reviewers) {
            if (rev.email) reviewerEmails.push(rev.email);
            await sendNotification({
              user: rev._id,
              title: 'New Account Approval Request',
              message: `${user.fullName} (${user.email}) registered and requested portal access. Approval required.`,
              type: 'USER_APPROVAL',
            });
          }

          await notifyAdminNewUserRegisteredEmail({
            newUser: user,
            recipientEmails: reviewerEmails,
          });
        } catch (notifErr) {
          console.error('[Registration Notification Error]:', notifErr.message);
        }
      });
    } catch (notifErr) {
      console.error('Failed to notify reviewers of new user:', notifErr.message);
    }
  }

  return { user, member, pendingApproval: isSelfRegistration };
};

/**
 * Request Password Reset OTP
 */
const requestPasswordResetOtp = async (email) => {
  if (!email) throw new Error('Please provide your registered email address');

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) {
    throw new Error('No registered user account found with this email address');
  }

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.resetPasswordOtp = otp;
  user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  // Send Email with OTP
  await sendPasswordResetOtpEmail({
    to: user.email,
    name: user.fullName,
    otp,
  });

  return { email: user.email };
};

/**
 * Reset Password with OTP
 */
const resetPasswordWithOtp = async (email, otp, newPassword, ipAddress = '127.0.0.1') => {
  if (!email || !otp || !newPassword) {
    throw new Error('Email, OTP code, and new password are required');
  }

  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password +resetPasswordOtp +resetPasswordOtpExpires');
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.resetPasswordOtp || user.resetPasswordOtp !== String(otp).trim()) {
    throw new Error('Invalid OTP code. Please check and try again.');
  }

  if (!user.resetPasswordOtpExpires || user.resetPasswordOtpExpires < new Date()) {
    throw new Error('OTP code has expired. Please request a new one.');
  }

  user.password = newPassword;
  user.resetPasswordOtp = undefined;
  user.resetPasswordOtpExpires = undefined;
  await user.save();

  await logAuditAction({
    user: user._id,
    action: 'PASSWORD_RESET_VIA_OTP',
    entityType: 'User',
    entityId: user._id,
    description: `User ${user.email} reset password using OTP verification`,
    ipAddress,
  });

  return { success: true };
};

module.exports = {
  loginUser,
  registerUser,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  generateToken,
};
