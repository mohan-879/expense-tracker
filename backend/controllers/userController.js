const User = require('../models/User');
const Member = require('../models/Member');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcryptjs');
const { successResponse, errorResponse, generateCode } = require('../utils/helpers');
const { logAuditAction } = require('../services/auditService');
const { sendNotification } = require('../services/notificationService');
const {
  notifyUserApprovalStatusEmail,
  sendUserCredentialsEmail,
  sendUserPasswordResetByAdminEmail,
} = require('../services/emailService');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin / Faculty)
const getUsers = async (req, res, next) => {
  try {
    const { role, search, active, approvalStatus } = req.query;
    const query = {};

    if (role) query.role = role;
    if (active !== undefined) query.isActive = active === 'true';
    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('approvedBy', 'fullName email role')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('approvedBy', 'fullName email role')
      .lean();
    if (!user) return errorResponse(res, 404, 'User not found');

    const member = await Member.findOne({ user: user._id }).lean();
    return successResponse(res, 200, 'User details retrieved', { user, member });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user (Admin)
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      fullName,
      role,
      clubRole,
      phone,
      department,
      rollNo,
      year,
      section,
      photo,
      studentId,
      designation,
    } = req.body;

    const existingUser = await User.findOne({
      $or: [
        { email: String(email).toLowerCase().trim() },
        { username: String(username).toLowerCase().trim() },
      ],
    });
    if (existingUser) {
      return errorResponse(res, 400, 'User with this email or username already exists');
    }

    const user = await User.create({
      username: String(username).toLowerCase().trim(),
      email: String(email).toLowerCase().trim(),
      password,
      fullName: fullName ? fullName.trim() : '',
      role: role || 'MEMBER',
      clubRole: clubRole || 'MEMBER',
      phone: phone ? phone.trim() : '',
      department: department || 'AI&DS',
      rollNo: rollNo ? rollNo.trim() : (studentId ? studentId.trim() : ''),
      year: year ? year.trim() : '',
      section: section ? section.trim() : '',
      photo: photo || '',
      approvalStatus: 'APPROVED',
      isApproved: true,
      approvedBy: req.user._id,
      approvedAt: new Date(),
    });

    let member = null;
    if (user.role === 'MEMBER' || studentId || rollNo) {
      member = await Member.create({
        user: user._id,
        studentId: rollNo ? rollNo.trim() : (studentId ? studentId.trim() : `STU-${Date.now().toString().slice(-6)}`),
        designation: clubRole || designation || 'Club Member',
      });
    }

    await logAuditAction({
      user: req.user._id,
      action: 'ADMIN_USER_CREATED',
      entityType: 'User',
      entityId: user._id,
      description: `Admin created user ${user.email} with role ${user.role} and club role ${user.clubRole}`,
      ipAddress: req.ip,
    });

    // Notify user via Email with their login credentials
    try {
      await sendUserCredentialsEmail({
        to: user.email,
        name: user.fullName,
        username: user.username,
        email: user.email,
        password, // Plain-text password entered by Admin
        role: user.role,
        clubRole: user.clubRole,
        department: user.department,
      });
    } catch (emailErr) {
      console.error('[User Credentials Email Error]:', emailErr.message);
    }

    return successResponse(res, 201, 'User created successfully and credentials emailed to user', { user, member });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private (Admin or Self)
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'User not found');

    const {
      fullName,
      email,
      phone,
      department,
      clubRole,
      rollNo,
      year,
      section,
      photo,
      role,
    } = req.body;

    if (fullName) user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (department) user.department = department.trim();
    if (rollNo !== undefined) user.rollNo = rollNo.trim();
    if (year !== undefined) user.year = year.trim();
    if (section !== undefined) user.section = section.trim();
    if (photo !== undefined) user.photo = photo;

    // Email update
    if (email && email.toLowerCase().trim() !== user.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return errorResponse(res, 400, 'Another user is already registered with this email address');
      }
      user.email = email.toLowerCase().trim();
    }

    // Only admin can change system role or club role
    if (req.user.role === 'ADMIN') {
      if (role) user.role = role;
      if (clubRole !== undefined) user.clubRole = clubRole.trim();
    }

    await user.save();

    // Also sync designation and studentId in Member if exists
    await Member.findOneAndUpdate(
      { user: user._id },
      {
        ...(req.user.role === 'ADMIN' && clubRole ? { designation: clubRole } : {}),
        ...(rollNo ? { studentId: rollNo } : {}),
      }
    );

    await logAuditAction({
      user: req.user._id,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: user._id,
      description: `Updated profile details for ${user.email}`,
      ipAddress: req.ip,
    });

    return successResponse(res, 200, 'User updated successfully', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle User Active status (Disable/Enable)
// @route   PATCH /api/users/:id/status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'User not found');

    user.isActive = !user.isActive;
    await user.save();

    await logAuditAction({
      user: req.user._id,
      action: 'USER_STATUS_TOGGLED',
      entityType: 'User',
      entityId: user._id,
      description: `${user.isActive ? 'Enabled' : 'Disabled'} user account ${user.email}`,
      ipAddress: req.ip,
    });

    return successResponse(
      res,
      200,
      `User account ${user.isActive ? 'enabled' : 'disabled'} successfully`,
      user
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Approve User Registration
// @route   PATCH /api/users/:id/approve
// @access  Private (Admin, Faculty Coordinator)
const approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'User not found');

    user.approvalStatus = 'APPROVED';
    user.isApproved = true;
    user.isActive = true;
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    user.rejectionReason = '';
    await user.save();

    await logAuditAction({
      user: req.user._id,
      action: 'USER_REGISTRATION_APPROVED',
      entityType: 'User',
      entityId: user._id,
      description: `${req.user.fullName} (${req.user.role}) approved user ${user.email}`,
      ipAddress: req.ip,
    });

    // Send In-App notification & Email in background
    setImmediate(async () => {
      try {
        await sendNotification({
          user: user._id,
          title: 'Registration Approved',
          message: `Your DSCLUB portal account has been approved by ${req.user.fullName}. You can now log in and access all features.`,
          type: 'APPROVAL',
        });

        await notifyUserApprovalStatusEmail({
          to: user.email,
          name: user.fullName,
          status: 'APPROVED',
          reviewerName: `${req.user.fullName} (${req.user.role === 'ADMIN' ? 'System Administrator' : 'Faculty Coordinator'})`,
        });
      } catch (err) {
        console.error('[User Approval Notification Error]:', err.message);
      }
    });

    return successResponse(res, 200, `User ${user.fullName} has been approved successfully`, user);
  } catch (error) {
    next(error);
  }
};

// @desc    Reject User Registration
// @route   PATCH /api/users/:id/reject
// @access  Private (Admin, Faculty Coordinator)
const rejectUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'User not found');

    const reason = req.body.reason || 'Registration request declined by faculty coordinator/administrator';

    user.approvalStatus = 'REJECTED';
    user.isApproved = false;
    user.rejectionReason = reason;
    await user.save();

    await logAuditAction({
      user: req.user._id,
      action: 'USER_REGISTRATION_REJECTED',
      entityType: 'User',
      entityId: user._id,
      description: `${req.user.fullName} (${req.user.role}) rejected user ${user.email}. Reason: ${reason}`,
      ipAddress: req.ip,
    });

    // Send Email in background
    setImmediate(async () => {
      try {
        await notifyUserApprovalStatusEmail({
          to: user.email,
          name: user.fullName,
          status: 'REJECTED',
          reason,
          reviewerName: `${req.user.fullName} (${req.user.role === 'ADMIN' ? 'System Administrator' : 'Faculty Coordinator'})`,
        });
      } catch (err) {
        console.error('[User Rejection Notification Error]:', err.message);
      }
    });

    return successResponse(res, 200, `User ${user.fullName} registration was rejected`, user);
  } catch (error) {
    next(error);
  }
};

// @desc    Reset User Password (Admin)
// @route   POST /api/users/:id/reset-password
// @access  Private (Admin)
const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return errorResponse(res, 400, 'New password must be at least 6 characters long');
    }

    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'User not found');

    user.password = newPassword;
    await user.save();

    await logAuditAction({
      user: req.user._id,
      action: 'PASSWORD_RESET_BY_ADMIN',
      entityType: 'User',
      entityId: user._id,
      description: `Admin reset password for user ${user.email}`,
      ipAddress: req.ip,
    });

    // Notify user via Email with their new password
    try {
      await sendUserPasswordResetByAdminEmail({
        to: user.email,
        name: user.fullName,
        email: user.email,
        newPassword,
        adminName: req.user.fullName,
      });
    } catch (emailErr) {
      console.error('[Password Reset Email Error]:', emailErr.message);
    }

    return successResponse(res, 200, `Password reset successfully for ${user.email} and notification sent to their email`);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete User Account & Login Credentials (Admin)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'User not found');

    if (String(user._id) === String(req.user._id)) {
      return errorResponse(res, 400, 'You cannot delete your own logged-in admin account');
    }

    await Member.deleteMany({ user: user._id });
    await User.findByIdAndDelete(user._id);

    await logAuditAction({
      user: req.user._id,
      action: 'USER_DELETED_BY_ADMIN',
      entityType: 'User',
      entityId: user._id,
      description: `Admin ${req.user.fullName} deleted login credentials for ${user.email} (${user.role})`,
      ipAddress: req.ip,
    });

    return successResponse(res, 200, `User account ${user.fullName} (${user.email}) deleted permanently`);
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update funds in user's login wallet (Admin, Faculty Coordinator)
// @route   POST /api/users/:id/wallet
// @access  Private (Admin, Faculty Coordinator)
const updateUserWallet = async (req, res, next) => {
  try {
    const { amount, action = 'ADD', note = '' } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return errorResponse(res, 400, 'Please provide a valid positive amount');
    }

    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'User account not found');

    const previousBalance = user.walletBalance || 0;

    if (action === 'DEDUCT') {
      user.walletBalance = Math.max(0, previousBalance - numAmount);
    } else {
      // Default: ADD / CREDIT
      user.walletBalance = previousBalance + numAmount;
      user.totalWalletAllocated = (user.totalWalletAllocated || 0) + numAmount;
    }

    await user.save();

    await logAuditAction({
      user: req.user._id,
      action: action === 'DEDUCT' ? 'WALLET_DEDUCTED' : 'WALLET_FUNDS_ADDED',
      entityType: 'User',
      entityId: user._id,
      description: `${req.user.fullName} (${req.user.role}) ${action === 'DEDUCT' ? 'deducted' : 'added'} ₹${numAmount} ${action === 'DEDUCT' ? 'from' : 'to'} ${user.fullName}'s wallet. New Balance: ₹${user.walletBalance}. Note: ${note || 'Club fund allocation'}`,
      ipAddress: req.ip,
    });

    // Record in central financial ledger as debit (advance allocation) or credit (advance returned)
    try {
      await Transaction.create({
        transactionCode: generateCode('TXN'),
        transactionType: 'REIMBURSEMENT',
        direction: action === 'ADD' ? 'DEBIT' : 'CREDIT',
        amount: numAmount,
        category: 'Wallet Allocation',
        description: `${action === 'ADD' ? 'Wallet advance credited to' : 'Wallet advance reclaimed from'} ${user.fullName} (${user.role}) - ${note || 'Advance Allocation'}`,
        paymentMethod: 'Bank Transfer',
        referenceNumber: user._id.toString().slice(-6),
        createdBy: req.user._id,
      });
    } catch (txnErr) {
      console.warn('Failed to record transaction for wallet update:', txnErr.message);
    }

    await sendNotification({
      user: user._id,
      title: action === 'DEDUCT' ? 'Wallet Deducted' : 'Wallet Credited',
      message: `₹${numAmount} was ${action === 'DEDUCT' ? 'deducted from' : 'credited to'} your club wallet by ${req.user.fullName}. Available balance: ₹${user.walletBalance}.`,
      type: 'EXPENSE_PAYMENT',
    });

    return successResponse(res, 200, `Wallet updated successfully for ${user.fullName}`, {
      userId: user._id,
      walletBalance: user.walletBalance,
      totalWalletAllocated: user.totalWalletAllocated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  approveUser,
  rejectUser,
  resetPassword,
  deleteUser,
  updateUserWallet,
};

