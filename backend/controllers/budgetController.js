const Budget = require('../models/Budget');
const Event = require('../models/Event');
const { getBudgetUtilization } = require('../services/budgetService');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Get Overall and Event Budget Summaries & Utilization
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const overallUtilization = await getBudgetUtilization(null);

    const events = await Event.find({ status: { $ne: 'CANCELLED' } });
    const eventBudgets = await Promise.all(
      events.map(async (event) => {
        return await getBudgetUtilization(event._id);
      })
    );

    return successResponse(res, 200, 'Budgets and utilization retrieved', {
      overall: overallUtilization,
      events: eventBudgets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/Update Club Overall Budget
// @route   POST /api/budgets
// @access  Private (Admin)
const setOverallBudget = async (req, res, next) => {
  try {
    const { title, allocatedAmount, fiscalYear } = req.body;

    const numAmount = Number(allocatedAmount);
    if (isNaN(numAmount) || numAmount < 0) {
      return errorResponse(res, 400, 'Valid allocated amount is required');
    }

    let budget = await Budget.findOne({ event: null });
    if (budget) {
      budget.allocatedAmount = numAmount;
      if (title) budget.title = title;
      if (fiscalYear) budget.fiscalYear = fiscalYear;
      await budget.save();
    } else {
      budget = await Budget.create({
        event: null,
        title: title || 'Overall Club Annual Budget',
        allocatedAmount: numAmount,
        fiscalYear: fiscalYear || '2026-2027',
      });
    }

    return successResponse(res, 200, 'Overall budget saved successfully', budget);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  setOverallBudget,
};
