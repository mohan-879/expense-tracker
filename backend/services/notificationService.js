const Notification = require('../models/Notification');

/**
 * Send an in-app notification to a user or group of users
 */
const sendNotification = async ({ user, title, message, type = 'GENERAL' }) => {
  try {
    if (!user) return;
    return await Notification.create({
      user: user._id || user,
      title,
      message,
      type,
    });
  } catch (error) {
    console.error('Notification Service Error:', error.message);
  }
};

module.exports = {
  sendNotification,
};
