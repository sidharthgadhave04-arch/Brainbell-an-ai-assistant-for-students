import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Event from '@/server/models/event';

// Database connection helper with caching
let isConnected = false;

const connectDB = async () => {
  // Set strict query mode
  mongoose.set('strictQuery', true);

  // If already connected, return
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('Using existing database connection');
    return;
  }
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'brainbell', // Replace with your actual database name
      bufferCommands: false, // Disable command buffering
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
};

export async function GET(request) {
  try {
    // IMPORTANT: Await the connection BEFORE any database operations
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const events = await Event.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      events
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch events',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // IMPORTANT: Await the connection BEFORE any database operations
    await connectDB();

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const newEvent = new Event({
      ...body,
      status: body.organizerRole === 'admin' ? 'approved' : 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newEvent.save();

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      event: newEvent
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create event',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}