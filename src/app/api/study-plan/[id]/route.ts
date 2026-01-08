// File: app/api/study-plan/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import StudyPlan from '@/models/studyPlan';

// Database connection helper with connection state check
const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      return;
    }
    
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// DELETE method to remove a study plan by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🗑️ DELETE request received for study plan');
  
  try {
    // Connect to database
    await connectDB();

    // Await params (Next.js 15 requirement)
    const resolvedParams = await params;
    const planId = resolvedParams.id;

    console.log('📋 Plan ID to delete:', planId);

    // Validate the planId
    if (!planId) {
      console.error('❌ Plan ID is missing');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Plan ID is required',
          message: 'No plan ID provided in the request'
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      console.error('❌ Invalid plan ID format:', planId);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid plan ID format',
          message: 'The provided plan ID is not a valid MongoDB ObjectId'
        },
        { status: 400 }
      );
    }

    // Delete the study plan using Mongoose
    console.log('🔍 Attempting to find and delete plan...');
    const deletedPlan = await StudyPlan.findByIdAndDelete(planId);

    if (!deletedPlan) {
      console.error('❌ Study plan not found:', planId);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Study plan not found',
          message: 'No study plan exists with the provided ID'
        },
        { status: 404 }
      );
    }

    console.log('✅ Study plan deleted successfully:', {
      planId,
      title: deletedPlan.title || 'Untitled'
    });

    return NextResponse.json({
      success: true,
      message: 'Study plan deleted successfully',
      deletedId: planId
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error deleting study plan:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete study plan',
        message: errorMessage
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
  console.log('📖 GET request received for study plan');
  
  try {
    // Connect to database
    await connectDB();

    // Await params (Next.js 15 requirement)
    const resolvedParams = await params;
    const planId = resolvedParams.id;

    console.log('📋 Plan ID to fetch:', planId);

    // Validate the planId
    if (!planId) {
      return NextResponse.json(
        { success: false, error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan ID format' },
        { status: 400 }
      );
    }

    // Fetch the study plan
    const plan = await StudyPlan.findById(planId);

    if (!plan) {
      console.error('❌ Study plan not found:', planId);
      return NextResponse.json(
        { success: false, error: 'Study plan not found' },
        { status: 404 }
      );
    }

    console.log('✅ Study plan fetched successfully:', planId);

    return NextResponse.json({ 
      success: true,
      plan: plan.toObject() // Convert mongoose document to plain object
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching study plan:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch study plan',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}

// PUT method to update a study plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('✏️ PUT request received for study plan');
  
  try {
    await connectDB();

    const resolvedParams = await params;
    const planId = resolvedParams.id;

    console.log('📋 Plan ID to update:', planId);

    if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('❌ Invalid JSON in request body');
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const updatedPlan = await StudyPlan.findByIdAndUpdate(
      planId,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      console.error('❌ Study plan not found:', planId);
      return NextResponse.json(
        { success: false, error: 'Study plan not found' },
        { status: 404 }
      );
    }

    console.log('✅ Study plan updated successfully:', planId);

    return NextResponse.json({
      success: true,
      message: 'Study plan updated successfully',
      plan: updatedPlan.toObject()
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error updating study plan:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update study plan',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}