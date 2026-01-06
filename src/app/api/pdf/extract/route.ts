import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { readFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { filename } = await req.json();

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename required' },
        { status: 400 }
      );
    }

    const filepath = path.join(process.cwd(), 'public', 'uploads', 'pdfs', filename);
    const buffer = await readFile(filepath);
    const text = buffer.toString('utf-8');

    return NextResponse.json({
      success: true,
      text,
    });

  } catch (error: any) {
    console.error('PDF extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract PDF text' },
      { status: 500 }
    );
  }
}