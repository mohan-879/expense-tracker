const Expense = require('../models/Expense');
const Member = require('../models/Member');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Reimbursement = require('../models/Reimbursement');
const { generateCode } = require('../utils/helpers');
const { logAuditAction } = require('./auditService');
const { sendNotification } = require('./notificationService');
const { notifyNewExpenseSubmitted, notifyExpenseStatusUpdate } = require('./brevoSmsService');
const { notifyExpenseSubmittedEmail, notifyExpenseStatusUpdateEmail } = require('./emailService');
const { invalidateFinancialCache } = require('./reportService');

/**
 * Non-blocking asynchronous task dispatcher.
 * Dispatches heavy SMS, email, and notification tasks without blocking HTTP API response latency.
 */
const dispatchAsync = (fn) => {
  setImmediate(async () => {
    try {
      await fn();
    } catch (err) {
      console.error('[Async Task Error]:', err.message);
    }
  });
};

/**
 * Submit New Expense / Bill Request
 */
const submitExpense = async (user, data, receiptPath) => {
  let member = await Member.findOne({ user: user._id });

  if (!member) {
    // Auto-create member record if missing
    member = await Member.create({
      user: user._id,
      studentId: `STU-${Date.now().toString().slice(-6)}`,
    });
  }

  // If phone number provided during submission, update user profile if empty or changed
  if (data.phone && (!user.phone || user.phone !== data.phone)) {
    await User.findByIdAndUpdate(user._id, { phone: data.phone.trim() });
    user.phone = data.phone.trim();
  }

  const expenseCode = generateCode('EXP');
  const isLeadership = ['ADMIN', 'FACULTY_COORDINATOR', 'TREASURER'].includes(user.role);
  const expenseAmount = Number(data.amount);

  // Check member's current wallet balance
  const submitterUser = await User.findById(user._id);
  const currentWallet = submitterUser ? (submitterUser.walletBalance || 0) : 0;
  const isCoveredByWallet = user.role === 'MEMBER' && currentWallet >= expenseAmount && expenseAmount > 0;

  let initialStatus = 'PENDING_TREASURER';
  let initialApprovedAmount = 0;
  let initialApprovedBy = null;
  let initialApprovedAt = null;
  let paymentMethod = data.originalPaymentMethod || 'UPI';

  if (isLeadership) {
    initialStatus = 'TREASURER_APPROVED';
    initialApprovedAmount = expenseAmount;
    initialApprovedBy = user._id;
    initialApprovedAt = new Date();
  } else if (isCoveredByWallet) {
    // Expense is fully covered by faculty pre-allocated wallet: direct settlement, NO approval request sent!
    initialStatus = 'PAID';
    initialApprovedAmount = expenseAmount;
    initialApprovedBy = null;
    initialApprovedAt = new Date();
    paymentMethod = 'Faculty Advance Wallet';
  }

  const expense = await Expense.create({
    expenseCode,
    member: member._id,
    user: user._id,
    title: data.title,
    category: data.category,
    description: data.description || '',
    expenseDate: data.expenseDate || Date.now(),
    event: data.eventId || null,
    amount: expenseAmount,
    paidBy: data.paidBy || user.fullName,
    originalPaymentMethod: paymentMethod,
    paymentMethod: isCoveredByWallet ? 'Faculty Advance Wallet' : '',
    receiptPath,
    notes: isCoveredByWallet
      ? (data.notes ? `${data.notes} | Direct Member Wallet Deduction (Faculty Advance)` : 'Direct Member Wallet Deduction (Faculty Advance)')
      : (data.notes || ''),
    status: initialStatus,
    approvedAmount: initialApprovedAmount,
    approvedBy: initialApprovedBy,
    approvedAt: initialApprovedAt,
  });

  // Fetch leadership users (Faculty, Treasurer, Financer, Admin)
  const leadershipUsers = await User.find({
    role: { $in: ['FACULTY_COORDINATOR', 'TREASURER', 'FINANCER', 'ADMIN'] },
    isActive: true,
  });

  if (isCoveredByWallet) {
    // Deduct immediately from member's wallet account
    submitterUser.walletBalance = Math.max(0, currentWallet - expenseAmount);
    await submitterUser.save();

    // Record in central financial ledger as debit
    try {
      await Transaction.create({
        transactionCode: generateCode('TXN'),
        transactionType: 'EXPENSE_PAYMENT',
        direction: 'DEBIT',
        amount: expenseAmount,
        category: data.category || 'Member Wallet Expense',
        description: `Direct wallet expense '${data.title}' logged by member ${user.fullName} (${submitterUser.email})`,
        paymentMethod: 'Faculty Advance Wallet',
        referenceNumber: expenseCode,
        createdBy: user._id,
      });
    } catch (txnErr) {
      console.warn('Failed to record transaction for member wallet expense:', txnErr.message);
    }

    // Audit Log for direct wallet deduction
    await logAuditAction({
      user: user._id,
      action: 'EXPENSE_WALLET_DEDUCTED',
      entityType: 'Expense',
      entityId: expense._id,
      description: `Member ${user.fullName} logged expense ${expense.expenseCode} (₹${expense.amount}) covered by pre-allocated faculty wallet. Updated balance: ₹${submitterUser.walletBalance}`,
    });

    // In-app Notification to Member
    await sendNotification({
      user: user._id,
      title: 'Wallet Expense Recorded',
      message: `₹${expenseAmount} for '${expense.title}' was deducted directly from your club wallet. Available balance: ₹${submitterUser.walletBalance}. No approval request required.`,
      type: 'EXPENSE_PAYMENT',
    });

    // In-app Notification to Treasurer, Faculty, Admin alone
    for (const leader of leadershipUsers) {
      if (['TREASURER', 'FACULTY_COORDINATOR', 'ADMIN'].includes(leader.role)) {
        await sendNotification({
          user: leader._id,
          title: 'Member Wallet Expense Logged',
          message: `${user.fullName} (Member) logged expense ${expense.expenseCode} (₹${expenseAmount}) from allocated wallet. Submitter balance: ₹${submitterUser.walletBalance}.`,
          type: 'EXPENSE_PAYMENT',
        });
      }
    }
  } else if (isLeadership) {
    // Audit Log for auto-approval
    await logAuditAction({
      user: user._id,
      action: 'EXPENSE_AUTO_APPROVED',
      entityType: 'Expense',
      entityId: expense._id,
      description: `Submitted expense ${expense.expenseCode} (₹${expense.amount}) by ${user.role} ${user.fullName} and automatically approved.`,
    });

    // In-app Notification to Financers for payment processing
    const financers = leadershipUsers.filter((u) => ['FINANCER', 'ADMIN'].includes(u.role));
    for (const financer of financers) {
      if (String(financer._id) !== String(user._id)) {
        await sendNotification({
          user: financer._id,
          title: 'Payment Awaiting Processing',
          message: `${expense.expenseCode} submitted by ${user.fullName} (${user.role}) is auto-approved (₹${expense.amount}) and awaiting payment.`,
          type: 'EXPENSE_PAYMENT',
        });
      }
    }
  } else {
    // Normal Member Reimbursement Request (Requires Approval Queue)
    // Audit Log for regular member submission
    await logAuditAction({
      user: user._id,
      action: 'EXPENSE_SUBMITTED',
      entityType: 'Expense',
      entityId: expense._id,
      description: `Submitted expense ${expense.expenseCode} for ₹${expense.amount} (Reimbursement Request)`,
    });

    // Invalidate dashboard metrics cache so fresh numbers are fetched on next view
    invalidateFinancialCache();

    // Trigger Brevo SMS, Email, and in-app notifications asynchronously in background
    dispatchAsync(async () => {
      await notifyNewExpenseSubmitted({
        expense,
        requester: user,
        reviewerUsers: leadershipUsers,
      });

      await notifyExpenseSubmittedEmail({
        expense,
        requester: user,
        reviewerUsers: leadershipUsers,
      });

      for (const reviewUser of leadershipUsers) {
        if (['TREASURER', 'FACULTY_COORDINATOR', 'ADMIN'].includes(reviewUser.role)) {
          if (String(reviewUser._id) !== String(user._id)) {
            await sendNotification({
              user: reviewUser._id,
              title: 'New Reimbursement Request',
              message: `${user.fullName} submitted expense ${expense.expenseCode} for ₹${expense.amount} awaiting review`,
              type: 'EXPENSE_APPROVAL',
            });
          }
        }
      }
    });
  }

  return expense;
};


/**
 * Approve Expense (Treasurer, Faculty Coordinator, or Admin)
 */
const approveExpense = async (expenseId, reviewerUser, approvedAmount) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) throw new Error('Expense request not found');

  if (expense.status !== 'PENDING_TREASURER') {
    throw new Error(`Cannot approve expense with current status: ${expense.status}`);
  }

  // Member cannot approve their own expense
  if (String(expense.user) === String(reviewerUser._id)) {
    throw new Error('You cannot approve your own expense request');
  }

  const finalApprovedAmount = approvedAmount ? Number(approvedAmount) : expense.amount;

  expense.status = 'TREASURER_APPROVED'; // also represents PAYMENT_PENDING
  expense.approvedAmount = finalApprovedAmount;
  expense.approvedBy = reviewerUser._id;
  expense.approvedAt = new Date();
  await expense.save();

  // Audit Log
  await logAuditAction({
    user: reviewerUser._id,
    action: 'EXPENSE_APPROVED',
    entityType: 'Expense',
    entityId: expense._id,
    description: `${reviewerUser.role} ${reviewerUser.fullName} approved expense ${expense.expenseCode} for ₹${finalApprovedAmount}`,
  });

  invalidateFinancialCache();

  // Asynchronously dispatch notifications without blocking the approve API response
  dispatchAsync(async () => {
    // Notify Member (In-app + SMS)
    await sendNotification({
      user: expense.user,
      title: 'Expense Approved',
      message: `Your expense ${expense.expenseCode} has been approved for ₹${finalApprovedAmount}.`,
      type: 'EXPENSE_APPROVAL',
    });

    const memberUser = await User.findById(expense.user);
    if (memberUser) {
      await notifyExpenseStatusUpdate({
        expense: { ...expense.toObject(), user: memberUser },
        status: 'TREASURER_APPROVED',
        reviewerUser,
      });
      await notifyExpenseStatusUpdateEmail({
        expense: { ...expense.toObject(), user: memberUser },
        status: 'TREASURER_APPROVED',
        reviewerUser,
      });
    }

    // Notify Financers
    const financers = await User.find({ role: { $in: ['FINANCER', 'ADMIN'] }, isActive: true });
    for (const financer of financers) {
      await sendNotification({
        user: financer._id,
        title: 'Payment Awaiting Processing',
        message: `${expense.expenseCode} is approved (₹${finalApprovedAmount}) and awaiting payment.`,
        type: 'EXPENSE_PAYMENT',
      });
    }
  });

  return expense;
};

/**
 * Reject Expense (Treasurer, Faculty Coordinator, or Admin)
 */
const rejectExpense = async (expenseId, reviewerUser, rejectionReason) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) throw new Error('Expense request not found');

  if (expense.status !== 'PENDING_TREASURER') {
    throw new Error(`Cannot reject expense with status: ${expense.status}`);
  }

  if (String(expense.user) === String(reviewerUser._id)) {
    throw new Error('You cannot reject your own expense request');
  }

  if (!rejectionReason || rejectionReason.trim() === '') {
    throw new Error('Rejection reason is required');
  }

  expense.status = 'REJECTED';
  expense.rejectedBy = reviewerUser._id;
  expense.rejectedAt = new Date();
  expense.rejectionReason = rejectionReason;
  await expense.save();

  // Restore rejected expense amount back to member's wallet
  const rejectedUser = await User.findById(expense.user);
  if (rejectedUser) {
    rejectedUser.walletBalance = (rejectedUser.walletBalance || 0) + (expense.approvedAmount || expense.amount);
    await rejectedUser.save();
  }

  // Audit Log
  await logAuditAction({
    user: reviewerUser._id,
    action: 'EXPENSE_REJECTED',
    entityType: 'Expense',
    entityId: expense._id,
    description: `Expense ${expense.expenseCode} rejected. Reason: ${rejectionReason}`,
  });

  invalidateFinancialCache();

  // Asynchronously dispatch notifications without blocking the reject API response
  dispatchAsync(async () => {
    // Notify Member (In-app + SMS)
    await sendNotification({
      user: expense.user,
      title: 'Expense Rejected',
      message: `Your expense ${expense.expenseCode} was rejected. Reason: ${rejectionReason}`,
      type: 'EXPENSE_APPROVAL',
    });

    const memberUser = await User.findById(expense.user);
    if (memberUser) {
      await notifyExpenseStatusUpdate({
        expense: { ...expense.toObject(), user: memberUser },
        status: 'REJECTED',
        reviewerUser,
        rejectionReason,
      });
      await notifyExpenseStatusUpdateEmail({
        expense: { ...expense.toObject(), user: memberUser },
        status: 'REJECTED',
        reviewerUser,
        rejectionReason,
      });
    }
  });

  return expense;
};

/**
 * Process Payment (Financer)
 */
const payExpense = async (expenseId, financerUser, paymentData, paymentProofPath = '') => {
  const expense = await Expense.findById(expenseId);
  if (!expense) throw new Error('Expense request not found');

  if (expense.status !== 'TREASURER_APPROVED' && expense.status !== 'PAYMENT_PENDING') {
    throw new Error(`Cannot pay expense with status: ${expense.status}`);
  }

  expense.status = 'PAID';
  expense.paidByFinancer = financerUser._id;
  expense.paymentMethod = paymentData.paymentMethod || 'UPI';
  expense.transactionReference = paymentData.transactionReference || `TXN-REF-${Date.now()}`;
  expense.paymentDate = paymentData.paymentDate || new Date();
  if (paymentProofPath) {
    expense.paymentProofPath = paymentProofPath;
  }
  await expense.save();

  // Create Reimbursement record
  await Reimbursement.create({
    expense: expense._id,
    member: expense.member,
    amount: expense.approvedAmount || expense.amount,
    status: 'PAID',
    processedAt: new Date(),
  });

  // Audit Log
  await logAuditAction({
    user: financerUser._id,
    action: 'EXPENSE_PAID',
    entityType: 'Expense',
    entityId: expense._id,
    description: `Financer ${financerUser.fullName} paid ₹${expense.approvedAmount} for ${expense.expenseCode} via ${expense.paymentMethod}`,
  });

  invalidateFinancialCache();

  // Asynchronously dispatch notifications without blocking the pay API response
  dispatchAsync(async () => {
    // Notify Member (In-app + SMS + Email)
    await sendNotification({
      user: expense.user,
      title: 'Reimbursement Paid',
      message: `₹${expense.approvedAmount} reimbursement for ${expense.expenseCode} has been marked as paid.`,
      type: 'EXPENSE_PAYMENT',
    });

    const memberUser = await User.findById(expense.user);
    if (memberUser) {
      await notifyExpenseStatusUpdate({
        expense: { ...expense.toObject(), user: memberUser },
        status: 'PAID',
        reviewerUser: financerUser,
      });
      await notifyExpenseStatusUpdateEmail({
        expense: { ...expense.toObject(), user: memberUser },
        status: 'PAID',
        reviewerUser: financerUser,
      });
    }

    // Notify Faculty Coordinator
    const faculties = await User.find({ role: { $in: ['FACULTY_COORDINATOR', 'ADMIN'] }, isActive: true });
    for (const faculty of faculties) {
      await sendNotification({
        user: faculty._id,
        title: 'Expense Awaiting Verification',
        message: `${expense.expenseCode} has been paid and is awaiting final verification.`,
        type: 'EXPENSE_VERIFICATION',
      });
    }
  });

  return expense;
};

/**
 * Verify Expense (Faculty Coordinator)
 */
const verifyExpense = async (expenseId, facultyUser) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) throw new Error('Expense request not found');

  if (expense.status !== 'PAID') {
    throw new Error(`Cannot verify expense with status: ${expense.status}. Must be PAID first.`);
  }

  expense.status = 'VERIFIED';
  expense.verifiedBy = facultyUser._id;
  expense.verifiedAt = new Date();
  await expense.save();

  // Create DEBIT transaction entry in Ledger
  const transactionCode = generateCode('TXN');
  await Transaction.create({
    transactionCode,
    transactionType: 'EXPENSE',
    direction: 'DEBIT',
    amount: expense.approvedAmount || expense.amount,
    referenceId: String(expense._id),
    category: expense.category || 'Expense',
    description: `Expense Reimbursement: ${expense.title} (${expense.expenseCode})`,
    paymentMethod: expense.paymentMethod || 'Bank Transfer',
    referenceNumber: expense.transactionReference || '',
    transactionDate: new Date(),
    createdBy: facultyUser._id,
  });

  // Audit Log
  await logAuditAction({
    user: facultyUser._id,
    action: 'EXPENSE_VERIFIED',
    entityType: 'Expense',
    entityId: expense._id,
    description: `Faculty Coordinator ${facultyUser.fullName} verified and closed ${expense.expenseCode}`,
  });

  invalidateFinancialCache();

  // Asynchronously dispatch notifications without blocking the verify API response
  dispatchAsync(async () => {
    // Notify Member (In-app + SMS + Email)
    await sendNotification({
      user: expense.user,
      title: 'Expense Verified & Closed',
      message: `Your expense ${expense.expenseCode} has been verified and closed by Faculty Coordinator.`,
      type: 'EXPENSE_VERIFICATION',
    });

    const memberUser = await User.findById(expense.user);
    if (memberUser) {
      await notifyExpenseStatusUpdate({
        expense: { ...expense.toObject(), user: memberUser },
        status: 'VERIFIED',
        reviewerUser: facultyUser,
      });
      await notifyExpenseStatusUpdateEmail({
        expense: { ...expense.toObject(), user: memberUser },
        status: 'VERIFIED',
        reviewerUser: facultyUser,
      });
    }
  });

  return expense;
};

module.exports = {
  submitExpense,
  approveExpense,
  rejectExpense,
  payExpense,
  verifyExpense,
};

