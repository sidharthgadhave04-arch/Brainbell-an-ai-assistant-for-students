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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await connectDB();
    const { eventId } = await params;

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { status, passkey } = body;

    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    if (status === 'approved' || status === 'rejected') {
      if (!passkey) {
        return NextResponse.json(
          { success: false, error: 'Secret key required' },
          { status: 401 }
        );
      }

      // Find event and validate against its stored secret key
      const existingEvent = await Event.findById(eventId);
      if (!existingEvent) {
        return NextResponse.json(
          { success: false, error: 'Event not found' },
          { status: 404 }
        );
      }

      // Use event's own secretKey, fallback to ADMIN_PASSKEY for old events
      const validKey = existingEvent.secretKey || process.env.ADMIN_PASSKEY;
      if (passkey !== validKey) {
        return NextResponse.json(
          { success: false, error: 'Invalid secret key' },
          { status: 403 }
        );
      }
    }

    const event = await Event.findByIdAndUpdate(
      eventId,
      {
        status,
        approvedAt: status === 'approved' ? new Date() : undefined,
        approvedBy: 'admin'
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: `Event ${status} successfully`,
      event
    });

  } catch (error: any) {
    console.error('Error updating event status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}