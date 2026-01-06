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
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');
    const eventId = params.eventId;

    console.log('🗑️ Delete event request:', { eventId, userId, userRole });

    // Validate eventId
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
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

    // Check permissions
    const isAdmin = userRole === 'admin';
    const isCreator = event.created_by?.toString() === userId;

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this event' },
        { status: 403 }
      );
    }

    // Delete the event
    await Event.findByIdAndDelete(eventId);

    console.log('✅ Event deleted successfully:', eventId);

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}