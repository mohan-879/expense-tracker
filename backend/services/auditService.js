const AuditLog = require('../models/AuditLog');

/**
 * Log an audit action safely
 */
const logAuditAction = async ({ user, action, entityType, entityId, description, ipAddress = '127.0.0.1' }) => {
  try {
    if (!user) return;
    await AuditLog.create({
      user: user._id || user,
      action,
      entityType,
      entityId: String(entityId || ''),
      description,
      ipAddress,
    });
  } catch (error) {
    console.error('Audit Log Recording Error:', error.message);
  }
};

module.exports = {
  logAuditAction,
};
