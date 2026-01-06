import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Event from '@/server/models/event';

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

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    await connectDB();

    const eventId = params.eventId;
    const body = await request.json();
    const { userId, name, branch, division, yearOfStudy } = body;

    console.log('📝 Registration request:', { eventId, userId, name, branch, division, yearOfStudy });

    // Validate eventId
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find the event
    const event = await Event.findById(eventId);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if already registered
    const isRegistered = event.attendees.some(
      (attendee: any) => attendee.userId?.toString() === userId
    );

    if (isRegistered) {
      // Unregister
      event.attendees = event.attendees.filter(
        (attendee: any) => attendee.userId?.toString() !== userId
      );
      await event.save();

      console.log('✅ User unregistered successfully');

      return NextResponse.json({
        success: true,
        registered: false,
        message: 'Unregistered from event successfully'
      });
    } else {
      // Register with student details
      event.attendees.push({
        userId,
        name,
        branch,
        division,
        yearOfStudy,
        registeredAt: new Date()
      });
      await event.save();

      console.log('✅ User registered successfully with details');

      return NextResponse.json({
        success: true,
        registered: true,
        message: 'Registered for event successfully'
      });
    }

  } catch (error: any) {
    console.error('❌ Error processing registration:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process registration' },
      { status: 500 }
    );
  }
}