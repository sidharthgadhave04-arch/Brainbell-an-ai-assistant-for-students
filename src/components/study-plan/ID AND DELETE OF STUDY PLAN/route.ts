import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
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

studyPlanSchema.index({ userId: 1, 'overview.subject': 1 });

const StudyPlan = mongoose.models.StudyPlan || mongoose.model('StudyPlan', studyPlanSchema);

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ Study Plan API - DELETE called');
    console.log('📝 Plan ID:', params.id);
    
    await connectDB();
    console.log('✅ Database connected');

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.log('❌ Invalid ID format');
      return NextResponse.json(
        { error: 'INVALID_ID', message: 'Invalid plan ID format' },
        { status: 400 }
      );
    }

    const deletedPlan = await StudyPlan.findByIdAndDelete(params.id);

    if (!deletedPlan) {
      console.log('❌ Plan not found');
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Study plan not found' },
        { status: 404 }
      );
    }

    console.log('✅ Study plan deleted:', params.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Study plan deleted successfully',
        deletedPlan,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Delete Study Plan Error:', error);
    return NextResponse.json(
      {
        error: 'SERVER_ERROR',
        message: error.message || 'Failed to delete study plan',
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📚 Study Plan API - GET single plan called');
    console.log('📝 Plan ID:', params.id);
    
    await connectDB();
    console.log('✅ Database connected');

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.log('❌ Invalid ID format');
      return NextResponse.json(
        { error: 'INVALID_ID', message: 'Invalid plan ID format' },
        { status: 400 }
      );
    }

    const plan = await StudyPlan.findById(params.id);

    if (!plan) {
      console.log('❌ Plan not found');
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Study plan not found' },
        { status: 404 }
      );
    }

    console.log('✅ Study plan found:', params.id);

    return NextResponse.json(
      {
        success: true,
        plan,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Get Study Plan Error:', error);
    return NextResponse.json(
      {
        error: 'SERVER_ERROR',
        message: error.message || 'Failed to fetch study plan',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('✏️ Study Plan API - UPDATE called');
    console.log('📝 Plan ID:', params.id);
    
    await connectDB();
    console.log('✅ Database connected');

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.log('❌ Invalid ID format');
      return NextResponse.json(
        { error: 'INVALID_ID', message: 'Invalid plan ID format' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const updates = { ...body, updatedAt: new Date() };

    const updatedPlan = await StudyPlan.findByIdAndUpdate(
      params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      console.log('❌ Plan not found');
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Study plan not found' },
        { status: 404 }
      );
    }

    console.log('✅ Study plan updated:', params.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Study plan updated successfully',
        plan: updatedPlan,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Update Study Plan Error:', error);
    return NextResponse.json(
      {
        error: 'SERVER_ERROR',
        message: error.message || 'Failed to update study plan',
      },
      { status: 500 }
    );
  }
}