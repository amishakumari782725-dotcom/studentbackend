import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'SYSTEM'],
    },
    entity: {
      type: String,
      required: true,
      enum: ['STUDENT', 'COURSE', 'DEPARTMENT', 'ADMIN', 'SYSTEM'],
    },
    description: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    userName: {
      type: String,
      default: 'System Administrator',
    },
  },
  {
    timestamps: true,
  }
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
