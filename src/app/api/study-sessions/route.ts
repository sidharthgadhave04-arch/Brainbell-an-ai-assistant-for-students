import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subject: { type: String, required: true },
  examDate: { type: String, required: true },
  weeks: [{
    week: Number,
    title: String,
    topics: [String],
    tasks: [String],
  }],
  createdAt: { type: Date, default: Date.now },
});

const StudyPlan = mongoose.models.StudyPlan || mongoose.model('StudyPlan', studyPlanSchema);

export async function POST(req: Request) {
  try {
    console.log('📚 Study Plan API called');
    
    await connectDB();
    console.log('✅ Database connected');
    
    const body = await req.json();
    const { userId, subject, examDate } = body;

    console.log('Received:', { userId, subject, examDate });

    if (!userId || !subject || !examDate) {
      return NextResponse.json(
        { error: 'MISSING_FIELDS', message: 'All fields are required' },
        { status: 400 }
      );
    }

    const existingPlan = await StudyPlan.findOne({
      userId,
      subject: subject.toLowerCase(),
    });

    if (existingPlan) {
      console.log('⚠️ Plan already exists');
      return NextResponse.json(
        {
          error: 'PLAN_EXISTS',
          message: `A study plan for "${subject}" already exists`,
        },
        { status: 409 }
      );
    }

    const weeks = generateWeeklyPlan(subject, examDate);

    const newPlan = await StudyPlan.create({
      userId,
      subject: subject.toLowerCase(),
      examDate,
      weeks,
    });

    console.log('✅ Study plan created:', newPlan._id);

    return NextResponse.json(
      {
        success: true,
        plan: newPlan,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ Study Plan Error:', error);
    return NextResponse.json(
      {
        error: 'SERVER_ERROR',
        message: error.message || 'Failed to create study plan',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const plans = await StudyPlan.find({ userId });

    return NextResponse.json({ plans }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

function generateWeeklyPlan(subject: string, examDate: string) {
  const today = new Date();
  const exam = new Date(examDate);
  const weeksUntilExam = Math.ceil((exam.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000));

  const weeks = [];
  const totalWeeks = Math.min(weeksUntilExam, 12);

  for (let i = 1; i <= totalWeeks; i++) {
    weeks.push({
      week: i,
      title: `Week ${i}: ${subject}`,
      topics: [
        `${subject} - Fundamentals ${i}`,
        `${subject} - Advanced Concepts ${i}`,
        `${subject} - Practice Problems ${i}`,
      ],
      tasks: [
        'Read and understand concepts',
        'Complete practice exercises',
        'Review and take notes',
        'Take weekly quiz',
      ],
    });
  }

  return weeks;
}