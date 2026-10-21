const Expense = require('../models/Expense');
const Member = require('../models/Member');
const {
  submitExpense,
  approveExpense,
  rejectExpense,
  payExpense,
  verifyExpense,
} = require('../services/expenseService');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Submit new expense reimbursement request
// @route   POST /api/expenses
// @access  Private (Member, Admin, etc.)
const createExpense = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'Receipt file upload is required');
    }

    const receiptPath = `/uploads/receipts/${req.file.filename}`;
    const expense = await submitExpense(req.user, req.body, receiptPath);

    return successResponse(res, 201, 'Expense submitted successfully', expense);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// @desc    Get all expenses (Filtered by role / query parameters)
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { status, category, eventId, search, myRequests, page, limit } = req.query;
    const query = {};

    // Member view limit: if role is MEMBER or myRequests === 'true', filter by user
    if (req.user.role === 'MEMBER' || myRequests === 'true') {
      query.user = req.user._id;
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (eventId) query.event = eventId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { expenseCode: { $regex: search, $options: 'i' } },
        { paidBy: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination with defaults
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.min(200, Math.max(1, parseInt(limit) || 100));
    const skip = (pageNum - 1) * pageSize;

    const [expenses, totalCount] = await Promise.all([
      Expense.find(query)
        .populate('user', 'fullName email role rollNo section department clubRole year phone')
        .populate('event', 'name')
        .populate('approvedBy', 'fullName role')
        .populate('rejectedBy', 'fullName role')
        .populate('paidByFinancer', 'fullName role')
        .populate('verifiedBy', 'fullName role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Expense.countDocuments(query),
    ]);

    return successResponse(res, 200, 'Expenses retrieved successfully', expenses);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('user', 'fullName email role rollNo section department clubRole year phone')
      .populate('member')
      .populate('event', 'name venue startDate endDate')
      .populate('approvedBy', 'fullName role email')
      .populate('rejectedBy', 'fullName role email')
      .populate('paidByFinancer', 'fullName role email')
      .populate('verifiedBy', 'fullName role email')
      .lean();

    if (!expense) return errorResponse(res, 404, 'Expense request not found');

    // Security check: Members can only view their own expense details
    if (
      req.user.role === 'MEMBER' &&
      String(expense.user._id) !== String(req.user._id)
    ) {
      return errorResponse(res, 403, 'You are not authorized to view this expense request');
    }

    return successResponse(res, 200, 'Expense details retrieved', expense);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve expense (Treasurer, Faculty, Admin)
// @route   POST /api/expenses/:id/approve
// @access  Private (Treasurer, Faculty Coordinator, Admin)
const handleApproveExpense = async (req, res, next) => {
  try {
    const { approvedAmount } = req.body;
    const expense = await approveExpense(req.params.id, req.user, approvedAmount);
    return successResponse(res, 200, 'Expense approved successfully', expense);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// @desc    Reject expense (Treasurer, Faculty, Admin)
// @route   POST /api/expenses/:id/reject
// @access  Private (Treasurer, Faculty Coordinator, Admin)
const handleRejectExpense = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const expense = await rejectExpense(req.params.id, req.user, rejectionReason);
    return successResponse(res, 200, 'Expense rejected successfully', expense);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// @desc    Process payment (Financer, Admin)
// @route   POST /api/expenses/:id/pay
// @access  Private (Financer, Admin)
const handlePayExpense = async (req, res, next) => {
  try {
    const paymentProofPath = req.file ? `/uploads/payment_proofs/${req.file.filename}` : '';
    const expense = await payExpense(req.params.id, req.user, req.body, paymentProofPath);
    return successResponse(res, 200, 'Payment processed successfully', expense);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// @desc    Verify & close expense (Faculty Coordinator, Admin)
// @route   POST /api/expenses/:id/verify
// @access  Private (Faculty Coordinator, Admin)
const handleVerifyExpense = async (req, res, next) => {
  try {
    const expense = await verifyExpense(req.params.id, req.user);
    return successResponse(res, 200, 'Expense verified and closed successfully', expense);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  handleApproveExpense,
  handleRejectExpense,
  handlePayExpense,
  handleVerifyExpense,
};
