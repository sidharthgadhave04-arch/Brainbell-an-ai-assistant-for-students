import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Event from '@/models/event';

// MongoDB connection helper
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// GET /api/events - Get all events with filters
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const events = await Event.find(query).sort({ date: 1 });
    
    return NextResponse.json({ 
      success: true, 
      events 
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch events',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { title, description, date, venue, category, created_by, organizerRole, organizerEmail } = body;

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'INVALID_INPUT',
          message: 'Title is required' 
        },
        { status: 400 }
      );
    }

    if (!description?.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'INVALID_INPUT',
          message: 'Description is required' 
        },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'INVALID_INPUT',
          message: 'Date is required' 
        },
        { status: 400 }
      );
    }

    if (!venue?.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'INVALID_INPUT',
          message: 'Venue is required' 
        },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'INVALID_INPUT',
          message: 'Category is required' 
        },
        { status: 400 }
      );
    }

    if (!created_by) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'INVALID_INPUT',
          message: 'Creator ID is required' 
        },
        { status: 400 }
      );
    }

    // Validate date is in the future
    const eventDate = new Date(date);
    if (eventDate < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_INPUT',
          message: 'Event date must be in the future'
        },
        { status: 400 }
      );
    }

    // Auto-approve if admin, otherwise pending
    const status = organizerRole === 'admin' ? 'approved' : 'pending';

    const newEvent = new Event({
      title: title.trim(),
      description: description.trim(),
      date: eventDate,
      venue: venue.trim(),
      category,
      created_by,
      status,
      attendees: [],
      feedback: [],
      organizerEmail,
      organizerRole: organizerRole || 'student'
    });

    const savedEvent = await newEvent.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Event created successfully',
        event: savedEvent
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating event:', error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: Object.values(error.errors).map(e => e.message).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR',
        message: error.message || 'An error occurred while creating the event'
      },
      { status: 500 }
    );
  }
}