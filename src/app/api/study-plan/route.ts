// app/api/study-plan/route.ts
import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  overview: {
    subject: { type: String, required: true },
    duration: { type: String, required: true },
    examDate: { type: String, required: true },
  },
  weeklyPlans: [{
    week: String,
    goals: [String],
    dailyTasks: [{
      day: String,
      tasks: [String],
      duration: String,
    }],
  }],
  recommendations: [String],
  isActive: { type: Boolean, default: true },
  progress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Remove the unique index - this was causing the duplicate error
studyPlanSchema.index({ userId: 1, 'overview.subject': 1 });

const StudyPlan = mongoose.models.StudyPlan || mongoose.model('StudyPlan', studyPlanSchema);

export async function POST(req: Request) {
  try {
    console.log('📚 Study Plan API - CREATE called');
    
    console.log('🔌 Attempting to connect to MongoDB...');
    await connectMongoDB();
    console.log('✅ Database connected successfully');
    
    const body = await req.json();
    console.log('📦 Request body received:', body);
    
    const { userId, subject, examDate } = body;

    console.log('📝 Creating plan for:', { userId, subject, examDate });

    if (!userId || !subject || !examDate) {
      console.log('❌ Missing required fields:', { userId: !!userId, subject: !!subject, examDate: !!examDate });
      return NextResponse.json(
        { error: 'MISSING_FIELDS', message: 'All fields are required' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking for existing plan...');
    const existingPlan = await StudyPlan.findOne({
      userId,
      'overview.subject': subject.toLowerCase(),
    });

    if (existingPlan) {
      console.log('⚠️ Plan already exists, deleting old plan...');
      // Delete the old plan and create a new one
      await StudyPlan.deleteOne({ _id: existingPlan._id });
      console.log('✅ Old plan deleted');
    }

    console.log('📅 Generating weekly plan...');
    const { weeklyPlans, duration, recommendations } = generateWeeklyPlan(subject, examDate);
    console.log('✅ Weekly plan generated:', { duration, weekCount: weeklyPlans.length });

    console.log('💾 Creating study plan in database...');
    const newPlan = await StudyPlan.create({
      userId,
      overview: {
        subject: subject.toLowerCase(),
        duration,
        examDate,
      },
      weeklyPlans,
      recommendations,
      isActive: true,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Study plan created successfully:', newPlan._id);

    return NextResponse.json(
      {
        success: true,
        plan: newPlan,
        message: existingPlan ? 'Study plan updated successfully' : 'Study plan created successfully'
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ Study Plan Error (Full):', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    return NextResponse.json(
      {
        error: 'SERVER_ERROR',
        message: error.message || 'Failed to create study plan',
        details: process.env.NODE_ENV === 'development' ? {
          name: error.name,
          stack: error.stack
        } : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    console.log('📚 Study Plan API - GET called');
    
    console.log('🔌 Connecting to MongoDB...');
    await connectMongoDB();
    console.log('✅ Database connected');
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      console.log('❌ No userId provided');
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching plans for user:', userId);
    const plans = await StudyPlan.find({ userId }).sort({ createdAt: -1 });
    console.log('✅ Found', plans.length, 'plan(s)');

    return NextResponse.json({ plans }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error fetching plans:', error);
    console.error('❌ Error details:', error.message);
    
    return NextResponse.json(
      { error: 'Failed to fetch plans', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a study plan
export async function DELETE(req: Request) {
  try {
    console.log('📚 Study Plan API - DELETE called');
    
    await connectMongoDB();
    
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get('planId');
    const userId = searchParams.get('userId');

    if (!planId || !userId) {
      return NextResponse.json(
        { error: 'Plan ID and User ID required' },
        { status: 400 }
      );
    }

    const deletedPlan = await StudyPlan.findOneAndDelete({ 
      _id: planId, 
      userId 
    });

    if (!deletedPlan) {
      return NextResponse.json(
        { error: 'Study plan not found' },
        { status: 404 }
      );
    }

    console.log('✅ Study plan deleted:', planId);

    return NextResponse.json(
      { success: true, message: 'Study plan deleted successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error deleting plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan', message: error.message },
      { status: 500 }
    );
  }
}

function generateWeeklyPlan(subject: string, examDate: string) {
  const today = new Date();
  const exam = new Date(examDate);
  const weeksUntilExam = Math.ceil((exam.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000));

  const totalWeeks = Math.min(Math.max(weeksUntilExam, 1), 12);
  const duration = `${totalWeeks} weeks`;

  const weeklyPlans = [];

  for (let i = 1; i <= totalWeeks; i++) {
    weeklyPlans.push({
      week: `Week ${i}`,
      goals: [
        `Master fundamental concepts of ${subject}`,
        `Complete practice problems and exercises`,
        `Review and reinforce learning`,
      ],
      dailyTasks: [
        {
          day: 'Monday',
          tasks: ['Study core concepts', 'Take notes on key topics'],
          duration: '2 hours',
        },
        {
          day: 'Tuesday',
          tasks: ['Practice problems', 'Review previous material'],
          duration: '2 hours',
        },
        {
          day: 'Wednesday',
          tasks: ['Advanced topics', 'Work on difficult concepts'],
          duration: '2 hours',
        },
        {
          day: 'Thursday',
          tasks: ['Practice tests', 'Identify weak areas'],
          duration: '2 hours',
        },
        {
          day: 'Friday',
          tasks: ['Review and consolidate', 'Prepare for next week'],
          duration: '2 hours',
        },
      ],
    });
  }

  const recommendations = [
    `Focus on understanding fundamentals before moving to advanced topics`,
    `Practice regularly with sample problems`,
    `Take breaks every 45-60 minutes to maintain focus`,
    `Review notes at the end of each week`,
    `Join study groups or find a study partner`,
    `Use active recall and spaced repetition techniques`,
  ];

  return { weeklyPlans, duration, recommendations };
}