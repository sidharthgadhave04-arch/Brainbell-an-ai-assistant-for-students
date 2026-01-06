import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import UserActivity from '@/server/models/userActivity';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }
  
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { activityType } = body; // 'login' or 'task'
    const userId = session.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Find or create today's activity
    let activity = await UserActivity.findOne({ userId, date: today });

    if (!activity) {
      activity = new UserActivity({
        userId,
        date: today,
        loginCount: 0,
        tasksCompleted: 0,
      });
    }

    // Update activity based on type
    if (activityType === 'login') {
      activity.loginCount = 1; // Only count once per day
    } else if (activityType === 'task') {
      activity.tasksCompleted += 1;
    }

    await activity.save();

    return NextResponse.json({
      success: true,
      message: 'Activity logged successfully',
    });

  } catch (error: any) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log activity' },
      { status: 500 }
    );
  }
}