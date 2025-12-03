// File: app/api/study-plan/[id]/route.ts
// Create this file to handle DELETE requests

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const planId = params.id;

    // Validate the planId
    if (!planId || !ObjectId.isValid(planId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('brainbell'); // Replace with your database name
    const collection = db.collection('studyPlans'); // Replace with your collection name

    // Delete the study plan
    const result = await collection.deleteOne({
      _id: new ObjectId(planId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Study plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Study plan deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting study plan:', error);
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

// Optional: GET method to fetch a single plan by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const planId = params.id;

    if (!planId || !ObjectId.isValid(planId)) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('brainbell');
    const collection = db.collection('studyPlans');

    const plan = await collection.findOne({
      _id: new ObjectId(planId)
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Study plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ plan });

  } catch (error) {
    console.error('Error fetching study plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study plan' },
      { status: 500 }
    );
  }
}