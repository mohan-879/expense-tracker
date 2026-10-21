const Transaction = require('../models/Transaction');
const { getFinancialSummary, generateFilteredReport } = require('../services/reportService');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Get Comprehensive Financial Dashboard Summary Data
// @route   GET /api/reports/financial-summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await getFinancialSummary(req.user);
    return successResponse(res, 200, 'Financial summary retrieved', summary);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Central Transaction Ledger with Running Balance
// @route   GET /api/reports/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const { type, direction, search, category, startDate, endDate } = req.query;

    // 1. Retrieve all transactions sorted ascending to calculate historical running balance
    const allTransactions = await Transaction.find({})
      .populate('createdBy', 'fullName email role')
      .sort({ transactionDate: 1, createdAt: 1 })
      .lean();

    let cumulativeBalance = 0;
    const enrichedTransactions = allTransactions.map((tx) => {
      if (tx.direction === 'CREDIT') {
        cumulativeBalance += tx.amount || 0;
      } else {
        cumulativeBalance -= tx.amount || 0;
      }
      return {
        ...tx,
        runningBalance: cumulativeBalance,
      };
    });

    // 2. Filter enriched transactions
    let filtered = enrichedTransactions;

    if (type) {
      filtered = filtered.filter((tx) => tx.transactionType === type);
    }
    if (direction) {
      filtered = filtered.filter((tx) => tx.direction === direction);
    }
    if (category) {
      const catLower = category.toLowerCase();
      if (catLower === 'expense') {
        filtered = filtered.filter((tx) => ['EXPENSE', 'REIMBURSEMENT'].includes(tx.transactionType) || tx.direction === 'DEBIT');
      } else if (catLower === 'income') {
        filtered = filtered.filter((tx) => ['INCOME', 'SPONSORSHIP'].includes(tx.transactionType) || tx.direction === 'CREDIT');
      } else {
        filtered = filtered.filter((tx) => 
          (tx.category && tx.category.toLowerCase().includes(catLower)) ||
          (tx.description && tx.description.toLowerCase().includes(catLower))
        );
      }
    }
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((tx) => new Date(tx.transactionDate || tx.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((tx) => new Date(tx.transactionDate || tx.createdAt) <= end);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((tx) => 
        (tx.description && tx.description.toLowerCase().includes(s)) ||
        (tx.transactionCode && tx.transactionCode.toLowerCase().includes(s)) ||
        (tx.referenceNumber && tx.referenceNumber.toLowerCase().includes(s)) ||
        (tx.category && tx.category.toLowerCase().includes(s))
      );
    }

    // 3. Return sorted descending (newest first)
    filtered.sort((a, b) => new Date(b.transactionDate || b.createdAt) - new Date(a.transactionDate || a.createdAt));

    return successResponse(res, 200, 'Transactions ledger retrieved', filtered);
  } catch (error) {
    next(error);
  }
};

// @desc    Update Transaction Amount (Direct or 5-Click power edit)
// @route   PATCH /api/reports/transactions/:id
// @access  Private
const updateTransactionAmount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return errorResponse(res, 400, 'Please provide a valid positive amount');
    }

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return errorResponse(res, 404, 'Transaction not found');
    }

    const oldAmount = transaction.amount;
    transaction.amount = numAmount;
    await transaction.save();

    // If there is an associated Expense, Income, or Sponsor, update that reference as well
    if (transaction.referenceId) {
      try {
        const Expense = require('../models/Expense');
        const Income = require('../models/Income');
        const Sponsor = require('../models/Sponsor');

        if (transaction.transactionType === 'EXPENSE') {
          await Expense.findByIdAndUpdate(transaction.referenceId, {
            amount: numAmount,
            approvedAmount: numAmount,
          });
        } else if (transaction.transactionType === 'INCOME') {
          await Income.findByIdAndUpdate(transaction.referenceId, { amount: numAmount });
        } else if (transaction.transactionType === 'SPONSORSHIP') {
          await Sponsor.findByIdAndUpdate(transaction.referenceId, { amount: numAmount });
        }
      } catch (refErr) {
        console.warn('Could not update reference entity amount:', refErr.message);
      }
    }

    // Audit Log
    const { logAuditAction } = require('../services/auditService');
    await logAuditAction({
      user: req.user._id,
      action: 'TRANSACTION_UPDATED',
      entityType: 'Transaction',
      entityId: transaction._id,
      description: `Transaction ${transaction.transactionCode} amount updated from ₹${oldAmount} to ₹${numAmount} by ${req.user.fullName}`,
    });

    return successResponse(res, 200, 'Transaction amount updated successfully', transaction);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Filtered Report
// @route   GET /api/reports/filter
// @access  Private
const getFilteredReports = async (req, res, next) => {
  try {
    const reportData = await generateFilteredReport(req.query);
    return successResponse(res, 200, 'Filtered report generated', reportData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getTransactions,
  updateTransactionAmount,
  getFilteredReports,
};
