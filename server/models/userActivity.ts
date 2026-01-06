import mongoose, { Schema, Document } from 'mongoose';

export interface IUserActivity extends Document {
  userId: mongoose.Types.ObjectId | string;
  date: string; // YYYY-MM-DD format
  loginCount: number;
  tasksCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

const userActivitySchema = new Schema<IUserActivity>(
  {
    userId: {
      type: Schema.Types.Mixed,
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
  },
  {
    timestamps: true,
  }
);

// Compound index for userId and date
userActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

// Prevent model overwrite error
delete mongoose.models.UserActivity;

const UserActivity = mongoose.model<IUserActivity>('UserActivity', userActivitySchema);

export default UserActivity;