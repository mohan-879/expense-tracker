const Income = require('../models/Income');
const Transaction = require('../models/Transaction');
const { generateCode, successResponse, errorResponse } = require('../utils/helpers');
const { logAuditAction } = require('../services/auditService');

// @desc    Get all club income entries
// @route   GET /api/income
// @access  Private
const getIncomeList = async (req, res, next) => {
  try {
    const { source, search } = req.query;
    const query = {};

    if (source) query.source = source;
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } },
        { incomeCode: { $regex: search, $options: 'i' } },
      ];
    }

    const incomes = await Income.find(query)
      .populate('recordedBy', 'fullName email')
      .populate('sponsor', 'companyName tierName')
      .sort({ date: -1 })
      .lean();

    return successResponse(res, 200, 'Income entries retrieved', incomes);
  } catch (error) {
    next(error);
  }
};

// @desc    Record new club income
// @route   POST /api/income
// @access  Private (Admin, Financer)
const createIncome = async (req, res, next) => {
  try {
    const { source, amount, date, description, paymentMethod, referenceNumber, sponsorId } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return errorResponse(res, 400, 'Positive income amount is required');
    }

    const incomeCode = generateCode('INC');
    const income = await Income.create({
      incomeCode,
      source,
      amount: numAmount,
      date: date || new Date(),
      description: description || '',
      paymentMethod: paymentMethod || 'Bank Transfer',
      referenceNumber: referenceNumber || '',
      recordedBy: req.user._id,
      sponsor: sponsorId || null,
    });

    // Create CREDIT Transaction in Ledger
    const transactionCode = generateCode('TXN');
    await Transaction.create({
      transactionCode,
      transactionType: source === 'Sponsorship' ? 'SPONSORSHIP' : 'INCOME',
      direction: 'CREDIT',
      amount: numAmount,
      referenceId: String(income._id),
      category: source === 'Sponsorship' ? 'Sponsorship' : 'Income',
      description: `Income Recorded: ${source} - ${description || 'Club Income'}`,
      paymentMethod: income.paymentMethod,
      referenceNumber: income.referenceNumber,
      transactionDate: income.date,
      createdBy: req.user._id,
    });

    // Audit Log
    await logAuditAction({
      user: req.user._id,
      action: 'INCOME_RECORDED',
      entityType: 'Income',
      entityId: income._id,
      description: `Recorded ₹${numAmount} income from ${source}`,
    });

    return successResponse(res, 201, 'Income recorded successfully', income);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

module.exports = {
  getIncomeList,
  createIncome,
};
