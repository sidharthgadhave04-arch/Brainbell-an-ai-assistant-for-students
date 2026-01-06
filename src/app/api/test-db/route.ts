import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function GET() {
  try {
    console.log("[API] Testing MongoDB connection...");
    
    const startTime = Date.now();
    const conn = await connectMongoDB();
    const connectTime = Date.now() - startTime;
    
    console.log("[API] Connection test successful!");
    
    return NextResponse.json({
      status: "success",
      message: "Connected to MongoDB successfully",
      connectTimeMs: connectTime,
      mongooseState: conn.connection.readyState,
      dbName: conn.connection.db?.databaseName || "unknown",
      collections: conn.connection.db?.listCollections ? "available" : "unavailable",
    });
  } catch (error) {
    console.error("[API] Connection test failed:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      {
        status: "error",
        message: errorMessage,
        error: {
          type: error instanceof Error ? error.constructor.name : typeof error,
          details: String(error),
        },
      },
      { status: 503 }
    );
  }
}
