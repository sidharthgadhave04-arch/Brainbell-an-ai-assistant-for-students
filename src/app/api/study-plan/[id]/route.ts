// File: app/api/study-plan/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import StudyPlan from '@/models/studyPlan';

// Database connection helper
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }
  
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Await params (Next.js 15 requirement)
    const { id: planId } = await params;

    // Validate the planId
    if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    // Delete the study plan using Mongoose
    const result = await StudyPlan.findByIdAndDelete(planId);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Study plan not found' },
        { status: 404 }
      );
    }

    console.log('✅ Study plan deleted successfully:', planId);

    return NextResponse.json({
      success: true,
      message: 'Study plan deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting study plan:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete study plan',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET method to fetch a single plan by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Await params (Next.js 15 requirement)
    const { id: planId } = await params;

    if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    const plan = await StudyPlan.findById(planId);

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Study plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      plan 
    });

  } catch (error) {
    console.error('❌ Error fetching study plan:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch study plan' 
      },
      { status: 500 }
    );
  }
}