// app/api/user/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { authOptions } from "@/lib/auth";

interface UpdateProfileRequest {
  name?: string;
  branch?: string;
  division?: string;
  college?: string;
  bio?: string;
  timezone?: string;
}

export async function PUT(req: Request) {
  try {
    console.log("=== Profile Update Started ===");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user?.id ? "Valid" : "Invalid", session?.user?.id);
    
    if (!session?.user?.id) {
      console.log("Authentication failed - no session");
      return NextResponse.json(
        { message: "You must be logged in to update your profile" },
        { status: 401 }
      );
    }

    const data = await req.json() as UpdateProfileRequest;
    console.log("Request data:", data);

    console.log("Connecting to MongoDB...");
    await connectMongoDB();
    console.log("MongoDB connected");

    console.log("Finding user with ID:", session.user.id);
    const user = await User.findById(session.user.id);
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      console.log("User not found in database");
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    console.log("Updating user fields...");
    // Allow updating name, branch, division, college, bio, and timezone
    // Email remains fixed from registration
    if (data.name !== undefined) user.name = data.name.trim();
    if (data.branch !== undefined) user.branch = data.branch.trim();
    if (data.division !== undefined) user.division = data.division.trim();
    if (data.college !== undefined) user.college = data.college.trim();
    if (data.bio !== undefined) user.bio = data.bio.trim();
    if (data.timezone !== undefined) user.timezone = data.timezone;

    console.log("Saving user...");
    await user.save();
    console.log("User saved successfully");

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        branch: user.branch,
        division: user.division,
        college: user.college,
        bio: user.bio,
        timezone: user.timezone,
        updatedAt: user.updatedAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error("=== Profile Update Error ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    console.error("Full error:", JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { 
        message: "Failed to update profile",
        error: error instanceof Error ? error.message : "Unknown error",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("=== Profile Fetch Started ===");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user?.id ? "Valid" : "Invalid");
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Connecting to MongoDB...");
    await connectMongoDB();
    console.log("MongoDB connected");
    
    console.log("Finding user:", session.user.id);
    const user = await User.findById(session.user.id);
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Return data directly without nesting in 'user' object
    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      branch: user.branch,
      division: user.division,
      college: user.college || 'ARMY INSTITUTE OF TECHNOLOGY DIGHI HILLS, PUNE 411015',
      bio: user.bio,
      timezone: user.timezone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });

  } catch (error) {
    console.error("=== Profile Fetch Error ===");
    console.error("Error:", error);
    return NextResponse.json(
      { 
        message: "Failed to fetch profile",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}