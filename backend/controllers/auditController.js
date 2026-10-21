const AuditLog = require('../models/AuditLog');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Get Audit Logs (Admin)
// @route   GET /api/audit-logs
// @access  Private (Admin)
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityType, search } = req.query;
    const query = {};

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { entityType: { $regex: search, $options: 'i' } },
      ];
    }

    const logs = await AuditLog.find(query)
      .populate('user', 'fullName email role')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return successResponse(res, 200, 'Audit logs retrieved', logs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
};
