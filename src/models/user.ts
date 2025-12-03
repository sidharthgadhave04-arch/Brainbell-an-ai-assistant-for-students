// models/user.ts
import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string;
  branch: string;
  division: string;
  college?: string;
  bio?: string;
  timezone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      trim: true,
      enum: [
        'Computer Engineering',
        'Information Technology Engineering',
        'Electronics and Telecommunication',
        'Mechanical Engineering',
        'Automation and Robotics Engineering'
      ],
    },
    division: {
      type: String,
      required: [true, 'Division is required'],
      trim: true,
      enum: ['A', 'B'],
    },
    college: {
      type: String,
      trim: true,
      default: 'ARMY INSTITUTE OF TECHNOLOGY DIGHI HILLS, PUNE 411015',
    },
    bio: {
      type: String,
      trim: true,
    },
    timezone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in Next.js hot reload
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;