// File: src/app/api/events/[eventId]/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Event from '@/server/models/event';

// Database connection helper
const connectDB = async () => {
  try {
    // Check if already connected (readyState 1 = connected)
    if (mongoose.connection.readyState === 1) {
      return;
    }

    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();

    // Await params (Next.js 15 requirement)
    const resolvedParams = await params;
    const eventId = resolvedParams.eventId;

    // Validate eventId
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Create or update event logic here
    const event = await Event.findByIdAndUpdate(
      eventId,
      body,
      { new: true, upsert: true, runValidators: true }
    );

    console.log('✅ Event registered successfully:', eventId);

    return NextResponse.json({
      success: true,
      message: 'Event registered successfully',
      event: event.toObject()
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error registering event:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to register event',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const eventId = resolvedParams.eventId;

    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event: event.toObject()
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching event:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch event',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}