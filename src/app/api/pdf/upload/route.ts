import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    console.log('📄 PDF Upload started');

    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      console.log('❌ No token - user not logged in');
      return NextResponse.json(
        { error: 'Please sign in to upload files' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', token.sub);

    const formData = await req.formData();
    const file = formData.get('pdf');

    if (!file || !(file instanceof File)) {
      console.log('❌ No file in request');
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    console.log('📄 File received:', file.name, 'Size:', file.size);

    if (file.type !== 'application/pdf') {
      console.log('❌ Wrong file type:', file.type);
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size);
      return NextResponse.json(
        { error: 'File must be less than 10MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'pdfs');
    console.log('📁 Creating upload directory:', uploadsDir);
    
    await mkdir(uploadsDir, { recursive: true });

    const userId = token.sub || 'unknown';
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${userId}_${timestamp}_${safeName}`;
    const filepath = path.join(uploadsDir, filename);

    console.log('💾 Saving file:', filename);

    await writeFile(filepath, buffer);

    console.log('✅ PDF uploaded successfully!');

    return NextResponse.json({
      success: true,
      filename,
      url: `/uploads/pdfs/${filename}`,
      size: file.size,
      originalName: file.name,
    });

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload PDF' },
      { status: 500 }
    );
  }
}