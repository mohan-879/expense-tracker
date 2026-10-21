const Budget = require('../models/Budget');
const Event = require('../models/Event');
const Expense = require('../models/Expense');

/**
 * Calculate Event or Overall Budget Utilization and Warning Level
 * Optimized with projection, Promise.all and .lean()
 */
const getBudgetUtilization = async (eventId = null) => {
  let allocatedBudget = 0;
  let title = 'Overall Club Budget';

  if (eventId) {
    const event = await Event.findById(eventId, { allocatedBudget: 1, name: 1 }).lean();
    if (!event) throw new Error('Event not found');
    allocatedBudget = event.allocatedBudget || 0;
    title = event.name;
  } else {
    // Sum overall active budgets or sum all event budgets
    const budgets = await Budget.find({}, { allocatedAmount: 1 }).lean();
    allocatedBudget = budgets.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0);

    if (allocatedBudget === 0) {
      // Fallback: sum all active events
      const events = await Event.find({ status: { $ne: 'CANCELLED' } }, { allocatedBudget: 1 }).lean();
      allocatedBudget = events.reduce((acc, e) => acc + (e.allocatedBudget || 0), 0);
    }
  }

  // Calculate total spent (PAID + VERIFIED) and pending expenses concurrently
  // When an event expense is paid, it automatically contributes to the event's spent amount
  const expenseFilter = { status: { $in: ['PAID', 'VERIFIED'] } };
  const pendingExpenseFilter = { status: { $in: ['PENDING_TREASURER', 'TREASURER_APPROVED', 'PAYMENT_PENDING'] } };

  if (eventId) {
    expenseFilter.event = eventId;
    pendingExpenseFilter.event = eventId;
  }

  const [spentExpenses, pendingExpenses] = await Promise.all([
    Expense.find(expenseFilter, { amount: 1, approvedAmount: 1 }).lean(),
    Expense.find(pendingExpenseFilter, { amount: 1, approvedAmount: 1 }).lean(),
  ]);

  const spentAmount = spentExpenses.reduce(
    (acc, exp) => acc + (exp.approvedAmount || exp.amount || 0),
    0
  );

  const pendingAmount = pendingExpenses.reduce(
    (acc, exp) => acc + (exp.approvedAmount || exp.amount || 0),
    0
  );

  const remainingBudget = allocatedBudget > 0 ? allocatedBudget - spentAmount : 0;
  const percentageUsed = allocatedBudget > 0 ? (spentAmount / allocatedBudget) * 100 : 0;

  let warningStatus = 'NORMAL';
  let warningMessage = allocatedBudget > 0 ? 'Budget is within normal limits' : 'No budget limit set';

  if (allocatedBudget > 0) {
    if (percentageUsed > 100) {
      warningStatus = 'EXCEEDED';
      warningMessage = `Budget exceeded! Used ${percentageUsed.toFixed(1)}% of allocated budget.`;
    } else if (percentageUsed >= 100) {
      warningStatus = 'LIMIT_REACHED';
      warningMessage = `Budget limit reached! Used 100% of allocated budget.`;
    } else if (percentageUsed >= 80) {
      warningStatus = 'WARNING';
      warningMessage = `Budget warning! ${percentageUsed.toFixed(1)}% of allocated budget used.`;
    }
  }

  return {
    eventId,
    title,
    allocatedBudget,
    spentAmount,
    pendingAmount,
    remainingBudget,
    percentageUsed: Number(percentageUsed.toFixed(2)),
    warningStatus,
    warningMessage,
  };
};

module.exports = {
  getBudgetUtilization,
};
