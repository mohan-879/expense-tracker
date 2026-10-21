const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Sponsor = require('../models/Sponsor');
const Event = require('../models/Event');
const User = require('../models/User');
const SponsorBenefit = require('../models/SponsorBenefit');
const { getBudgetUtilization } = require('./budgetService');

// In-memory cache for leadership financial summary (15s TTL)
let cachedSummary = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 15000;

const invalidateFinancialCache = () => {
  cachedSummary = null;
  cacheTimestamp = 0;
};

/**
 * Get Comprehensive Dashboard Financial Summary & Metrics
 * Member receives personal wallet & expense data.
 * Leadership (Admin, Faculty, Financer, Treasurer) receives overall club dashboard.
 */
const getFinancialSummary = async (requestUser = null) => {
  // If the requester is a Member, return strictly their member-specific wallet and expense dashboard
  if (requestUser && requestUser.role === 'MEMBER') {
    const [userRecord, myExpenses] = await Promise.all([
      User.findById(requestUser._id, { walletBalance: 1, totalWalletAllocated: 1, fullName: 1, email: 1 }).lean(),
      Expense.find({ user: requestUser._id })
        .populate('event', 'name')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const myTotalExpenses = myExpenses.reduce(
      (acc, exp) => acc + (exp.approvedAmount || exp.amount || 0),
      0
    );

    const myPendingAmount = myExpenses
      .filter((e) => ['PENDING_TREASURER', 'TREASURER_APPROVED', 'PAYMENT_PENDING'].includes(e.status))
      .reduce((acc, exp) => acc + (exp.amount || 0), 0);

    const paidExpenses = myExpenses.filter((e) =>
      ['PAID', 'VERIFIED'].includes(e.status) || e.paymentMethod === 'Faculty Advance Wallet'
    );

    const myApprovedAmount = paidExpenses.reduce(
      (acc, exp) => acc + (exp.approvedAmount || exp.amount || 0),
      0
    );

    const allocated = userRecord?.totalWalletAllocated || 0;
    const balance = userRecord?.walletBalance || 0;
    const walletSpent = myApprovedAmount > 0 ? myApprovedAmount : Math.max(0, allocated - balance);

    return {
      isMember: true,
      walletBalance: balance,
      totalWalletAllocated: allocated,
      walletSpent,
      timesPaid: paidExpenses.length,
      myTotalExpenses,
      myPendingAmount,
      myApprovedAmount,
      myExpenseCount: myExpenses.length,
      recentExpenses: myExpenses.slice(0, 15),
    };
  }

  // Check in-memory cache for leadership summary
  const now = Date.now();
  if (cachedSummary && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedSummary;
  }

  // Execute all metric queries concurrently instead of sequentially
  const [
    incomes,
    verifiedExpenses,
    pendingExpenses,
    paidExpenses,
    paidSponsors,
    activeSponsorsCount,
    pendingBenefitsCount,
    upcomingEventsCount,
    budgetSummary,
    monthlySpending,
    categoryBreakdown,
    sponsorshipByTier,
    reimbursementStatusBreakdown,
    usersWithWallet,
  ] = await Promise.all([
    // 1. Total Income (only select amount)
    Income.find({}, { amount: 1 }).lean(),

    // 2. Verified Expenses (only select amount and approvedAmount)
    Expense.find({ status: 'VERIFIED' }, { amount: 1, approvedAmount: 1 }).lean(),

    // 3. Pending Reimbursements
    Expense.find(
      { status: { $in: ['PENDING_TREASURER', 'TREASURER_APPROVED', 'PAYMENT_PENDING'] } },
      { amount: 1, approvedAmount: 1 }
    ).lean(),

    // 4. Paid Reimbursements
    Expense.find(
      { status: { $in: ['PAID', 'VERIFIED'] } },
      { amount: 1, approvedAmount: 1 }
    ).lean(),

    // 5. Total Sponsorship Received
    Sponsor.find({ paymentStatus: 'PAID' }, { amount: 1 }).lean(),

    // 6. Active Sponsors & Pending Benefits counts
    Sponsor.countDocuments(),
    SponsorBenefit.countDocuments({ status: 'PENDING' }),

    // 7. Upcoming Events count
    Event.countDocuments({ status: 'UPCOMING' }),

    // 8. Budget Utilization Overview
    getBudgetUtilization(),

    // 9. Monthly Spending Trend
    getMonthlySpendingTrend(),

    // 10. Category Breakdown
    getExpenseCategoryBreakdown(),

    // 11. Sponsor Tier Distribution
    getSponsorshipByTierDistribution(),

    // 12. Reimbursement Status Breakdown
    getReimbursementStatusBreakdown(),

    // 13. All user wallets (allocated funds)
    User.find({}, { walletBalance: 1 }).lean(),
  ]);

  const totalIncome = incomes.reduce((acc, inc) => acc + (inc.amount || 0), 0);
  const totalVerifiedExpenses = verifiedExpenses.reduce(
    (acc, exp) => acc + (exp.approvedAmount || exp.amount || 0),
    0
  );
  const totalAllocatedWallets = (usersWithWallet || []).reduce(
    (acc, u) => acc + (u.walletBalance || 0),
    0
  );

  // Available club balance minus verified expenses and minus all funds currently held in member wallets
  const availableBalance = totalIncome - totalVerifiedExpenses - totalAllocatedWallets;

  const pendingReimbursementAmount = pendingExpenses.reduce(
    (acc, exp) => acc + (exp.approvedAmount || exp.amount || 0),
    0
  );

  const paidReimbursementAmount = paidExpenses.reduce(
    (acc, exp) => acc + (exp.approvedAmount || exp.amount || 0),
    0
  );

  const totalSponsorshipReceived = paidSponsors.reduce(
    (acc, sp) => acc + (sp.amount || 0),
    0
  );

  const pendingApprovalCount = pendingExpenses.filter((e) =>
    ['PENDING_TREASURER', 'TREASURER_APPROVED'].includes(e.status)
  ).length;

  const pendingPaymentCount = pendingExpenses.filter(
    (e) => e.status === 'PAYMENT_PENDING'
  ).length;

  // Fetch detailed member wallets for Treasurer, Faculty, and Admin dashboard
  const members = await User.find(
    { role: 'MEMBER' },
    { fullName: 1, email: 1, department: 1, year: 1, phone: 1, rollNo: 1, section: 1, clubRole: 1, walletBalance: 1, totalWalletAllocated: 1, approvalStatus: 1, createdAt: 1 }
  ).sort({ fullName: 1 }).lean();

  const memberIds = members.map((m) => m._id);
  const paidExpensesByMember = await Expense.find(
    { user: { $in: memberIds }, status: { $in: ['PAID', 'VERIFIED'] } },
    { user: 1, amount: 1, approvedAmount: 1, paymentMethod: 1 }
  ).lean();

  const memberWallets = members.map((m) => {
    const memberPaidExpenses = paidExpensesByMember.filter(
      (e) => String(e.user) === String(m._id)
    );
    const totalSpent = memberPaidExpenses.reduce(
      (acc, exp) => acc + (exp.approvedAmount || exp.amount || 0),
      0
    );
    const timesPaid = memberPaidExpenses.length;
    const allocated = m.totalWalletAllocated || 0;
    const balance = m.walletBalance || 0;

    return {
      _id: m._id,
      fullName: m.fullName,
      email: m.email,
      rollNo: m.rollNo || '',
      section: m.section || '',
      clubRole: m.clubRole || 'MEMBER',
      department: m.department || 'Computer Science',
      year: m.year || '3rd Year',
      phone: m.phone || '',
      facultyGiven: allocated,
      totalWalletAllocated: allocated,
      walletBalance: balance,
      spentAmount: totalSpent > 0 ? totalSpent : Math.max(0, allocated - balance),
      timesPaid,
      approvalStatus: m.approvalStatus || 'APPROVED',
    };
  });

  cachedSummary = {
    availableBalance,
    totalIncome,
    totalExpenses: totalVerifiedExpenses,
    totalAllocatedWallets,
    pendingReimbursementAmount,
    paidReimbursementAmount,
    pendingApprovalCount,
    pendingPaymentCount,
    totalSponsorshipReceived,
    activeSponsorsCount,
    pendingBenefitsCount,
    upcomingEventsCount,
    budgetSummary,
    monthlySpending,
    categoryBreakdown,
    sponsorshipByTier,
    reimbursementStatusBreakdown,
    memberWallets,
  };
  cacheTimestamp = Date.now();

  return cachedSummary;
};

/**
 * Helper: Monthly Spending Trend (Optimized with projection & .lean())
 */
const getMonthlySpendingTrend = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [expenses, incomes] = await Promise.all([
    Expense.find(
      { createdAt: { $gte: sixMonthsAgo } },
      { expenseDate: 1, createdAt: 1, status: 1, amount: 1, approvedAmount: 1 }
    ).lean(),
    Income.find(
      { createdAt: { $gte: sixMonthsAgo } },
      { date: 1, createdAt: 1, amount: 1 }
    ).lean(),
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyMap = {};

  expenses.forEach((exp) => {
    const d = new Date(exp.expenseDate || exp.createdAt);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (!monthlyMap[key]) monthlyMap[key] = { month: key, expenses: 0, income: 0 };
    if (['PAID', 'VERIFIED'].includes(exp.status)) {
      monthlyMap[key].expenses += exp.approvedAmount || exp.amount || 0;
    }
  });

  incomes.forEach((inc) => {
    const d = new Date(inc.date || inc.createdAt);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (!monthlyMap[key]) monthlyMap[key] = { month: key, expenses: 0, income: 0 };
    monthlyMap[key].income += inc.amount || 0;
  });

  return Object.values(monthlyMap);
};

/**
 * Helper: Category Breakdown (Optimized with projection & .lean())
 */
const getExpenseCategoryBreakdown = async () => {
  const expenses = await Expense.find(
    { status: { $in: ['PAID', 'VERIFIED'] } },
    { category: 1, amount: 1, approvedAmount: 1 }
  ).lean();

  const categoryMap = {};

  expenses.forEach((exp) => {
    const cat = exp.category || 'General';
    const amt = exp.approvedAmount || exp.amount || 0;
    categoryMap[cat] = (categoryMap[cat] || 0) + amt;
  });

  return Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat],
  }));
};

/**
 * Helper: Sponsorship by Tier (Optimized with projection & .lean())
 */
const getSponsorshipByTierDistribution = async () => {
  const sponsors = await Sponsor.find({}, { tierName: 1, amount: 1 }).lean();
  const tierMap = { PLATINUM: 0, GOLD: 0, SILVER: 0, SUPPORTING: 0 };

  sponsors.forEach((sp) => {
    const tier = sp.tierName || 'SUPPORTING';
    tierMap[tier] = (tierMap[tier] || 0) + (sp.amount || 0);
  });

  return Object.keys(tierMap).map((tier) => ({
    tier,
    amount: tierMap[tier],
  }));
};

/**
 * Helper: Status Breakdown (Optimized with a single aggregation pipeline instead of 5 separate queries)
 */
const getReimbursementStatusBreakdown = async () => {
  const statuses = ['PENDING_TREASURER', 'TREASURER_APPROVED', 'REJECTED', 'PAID', 'VERIFIED'];
  const statusMap = {
    PENDING_TREASURER: 0,
    TREASURER_APPROVED: 0,
    REJECTED: 0,
    PAID: 0,
    VERIFIED: 0,
  };

  const counts = await Expense.aggregate([
    { $match: { status: { $in: statuses } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  counts.forEach((item) => {
    if (statusMap[item._id] !== undefined) {
      statusMap[item._id] = item.count;
    }
  });

  return statusMap;
};

/**
 * Filtered Financial Reports (Optimized with .lean())
 */
const generateFilteredReport = async (filters) => {
  const { startDate, endDate, category, eventId, memberId, status, sponsorId } = filters;

  const expenseQuery = {};
  if (startDate || endDate) {
    expenseQuery.expenseDate = {};
    if (startDate) expenseQuery.expenseDate.$gte = new Date(startDate);
    if (endDate) expenseQuery.expenseDate.$lte = new Date(endDate);
  }
  if (category) expenseQuery.category = category;
  if (eventId) expenseQuery.event = eventId;
  if (memberId) expenseQuery.member = memberId;
  if (status) expenseQuery.status = status;

  const incomeQuery = {};
  if (startDate || endDate) {
    incomeQuery.date = {};
    if (startDate) incomeQuery.date.$gte = new Date(startDate);
    if (endDate) incomeQuery.date.$lte = new Date(endDate);
  }
  if (sponsorId) incomeQuery.sponsor = sponsorId;

  const [expenses, incomes] = await Promise.all([
    Expense.find(expenseQuery)
      .populate('user', 'fullName email')
      .populate('event', 'name')
      .sort({ expenseDate: -1 })
      .lean(),
    Income.find(incomeQuery)
      .populate('sponsor', 'companyName tierName')
      .sort({ date: -1 })
      .lean(),
  ]);

  const totalExpenseAmount = expenses.reduce(
    (acc, exp) => acc + (exp.approvedAmount || exp.amount || 0),
    0
  );
  const totalIncomeAmount = incomes.reduce((acc, inc) => acc + (inc.amount || 0), 0);

  return {
    expenses,
    incomes,
    totalExpenseAmount,
    totalIncomeAmount,
    netBalance: totalIncomeAmount - totalExpenseAmount,
  };
};

module.exports = {
  getFinancialSummary,
  generateFilteredReport,
  invalidateFinancialCache,
};
