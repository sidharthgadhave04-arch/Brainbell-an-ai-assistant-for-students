import mongoose, { Schema, model, models } from 'mongoose';

const UserActivitySchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  date: {
    type: String,
    required: true,
    index: true,
  },
  loginCount: {
    type: Number,
    default: 0,
  },
  tasksCompleted: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
UserActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

const UserActivity = models.UserActivity || model('UserActivity', UserActivitySchema);

export default UserActivity;