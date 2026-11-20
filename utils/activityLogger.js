import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async ({ action, entity, description, user, userName }) => {
  try {
    await ActivityLog.create({
      action,
      entity,
      description,
      user: user || null,
      userName: userName || (user ? user.name : 'System Administrator'),
    });
  } catch (error) {
    console.error('[ActivityLog] Failed to log activity:', error.message);
  }
};
