import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Event from '@/server/models/event';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await connectDB();
    const { eventId } = await params;

    // Get secretKey from request body
    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {}

    const { userId, userRole, secretKey } = body;

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

    // Validate secret key
    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: 'Secret key required to delete event' },
        { status: 401 }
      );
    }

    const validKey = event.secretKey || process.env.ADMIN_PASSKEY;
    if (secretKey !== validKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid secret key' },
        { status: 403 }
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

    await Event.findByIdAndDelete(eventId);

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}