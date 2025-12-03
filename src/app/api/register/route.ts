// app/api/register/route.ts
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('\n========================================');
  console.log('🔵 NEW REGISTRATION REQUEST');
  console.log('========================================');
  
  try {
    // Step 1: Parse body
    console.log('📦 Step 1: Parsing request body...');
    const body = await req.json();
    console.log('✅ Body parsed successfully');
    console.log('📝 Received data:', {
      name: body.name || 'MISSING',
      email: body.email || 'MISSING',
      password: body.password ? '***EXISTS***' : 'MISSING',
      branch: body.branch || 'MISSING',
      division: body.division || 'MISSING',
      allKeys: Object.keys(body)
    });

    const { name, email, password, branch, division } = body;

    // Step 2: Validation
    console.log('🔍 Step 2: Validating fields...');
    
    if (!name) {
      console.log('❌ VALIDATION FAILED: Name is missing');
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    console.log('✅ Name validation passed');

    if (!email) {
      console.log('❌ VALIDATION FAILED: Email is missing');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    console.log('✅ Email validation passed');

    if (!password) {
      console.log('❌ VALIDATION FAILED: Password is missing');
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }
    console.log('✅ Password validation passed');

    if (password.length < 6) {
      console.log('❌ VALIDATION FAILED: Password too short');
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }
    console.log('✅ Password length validation passed');

    if (!branch) {
      console.log('❌ VALIDATION FAILED: Branch is missing');
      return NextResponse.json(
        { error: 'Branch is required' },
        { status: 400 }
      );
    }
    console.log('✅ Branch validation passed');

    if (!division) {
      console.log('❌ VALIDATION FAILED: Division is missing');
      return NextResponse.json(
        { error: 'Division is required' },
        { status: 400 }
      );
    }
    console.log('✅ Division validation passed');

    // Step 3: Connect to database
    console.log('🔌 Step 3: Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');

    // Step 4: Check existing user
    console.log('🔎 Step 4: Checking for existing user...');
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      console.log('❌ USER ALREADY EXISTS:', email);
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }
    console.log('✅ Email is available');

    // Step 5: Hash password
    console.log('🔐 Step 5: Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');

    // Step 6: Create user
    console.log('💾 Step 6: Creating user in database...');
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      branch,
      division,
    });
    console.log('✅ User created successfully:', user.email);
    console.log('📚 Branch:', user.branch);
    console.log('📋 Division:', user.division);

    console.log('========================================');
    console.log('✅ REGISTRATION SUCCESSFUL');
    console.log('========================================\n');

    return NextResponse.json(
      { 
        success: true,
        message: 'User registered successfully',
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email,
          branch: user.branch,
          division: user.division
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.log('========================================');
    console.error('❌ REGISTRATION ERROR');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    console.log('========================================\n');

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}