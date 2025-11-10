import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase and a number"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Server-side validation
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { message: firstError ? firstError.message : 'Invalid input' },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Ensure DB connection is established
    await connectMongoDB();

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Error during registration:", error);

    // Duplicate key error (unique index)
    if (error?.code === 11000) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    // Connection related errors might come from connectMongoDB
    const message = error instanceof Error ? error.message : 'An error occurred while registering the user';
    return NextResponse.json({ message }, { status: 500 });
  }
}