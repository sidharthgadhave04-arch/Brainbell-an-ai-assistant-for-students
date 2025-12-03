import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb"; // CHANGED: was connectMongoDB
import { authOptions } from "@/lib/auth";
import Note from "@/models/note";

// Get all notes for the user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId') || null;

    await connectDB(); // CHANGED: was connectMongoDB
    
    const notes = await Note.find({
      userId: session.user.id,
      parentId,
      isArchived: false
    }).sort({ updatedAt: -1 });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// Create a new note
export async function POST(req: Request) {
  try {
    console.log("=== POST /api/notes called ===");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.log("No session or user ID found - Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    console.log("Data received:", JSON.stringify(data, null, 2));
    
    console.log("Attempting to connect to MongoDB...");
    await connectDB(); // CHANGED: was connectMongoDB
    console.log("MongoDB connected successfully");

    // Create note with proper content structure
    const noteData = {
      userId: session.user.id,
      title: data.title || 'Untitled',
      content: [{
        type: 'paragraph',
        content: data.content || ''
      }],
      parentId: data.parentId || null
    };
    
    console.log("Creating note with data:", JSON.stringify(noteData, null, 2));
    
    const note = new Note(noteData);
    console.log("Note object created, attempting to save...");
    
    await note.save();
    console.log("Note saved successfully!");
    console.log("Saved note:", JSON.stringify(note, null, 2));
    
    return NextResponse.json(note);
  } catch (error) {
    console.error("=== ERROR CREATING NOTE ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    
    return NextResponse.json(
      { error: "Failed to create note", details: error.message },
      { status: 500 }
    );
  }
}