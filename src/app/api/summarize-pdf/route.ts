import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');

    // Try gemini-1.5-pro instead
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Please provide a comprehensive summary of this PDF document. Include:
1. Main topic/theme
2. Key points (use bullet points)
3. Important details or findings
4. Conclusion or main takeaways

Please be thorough and organized in your summary.`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: 'application/pdf'
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({
      success: true,
      summary,
      fileName: file.name,
      fileSize: file.size
    });

  } catch (error: any) {
    console.error('Error summarizing PDF:', error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your Gemini API configuration.' },
        { status: 500 }
      );
    }
    
    if (error.message?.includes('not found') || error.message?.includes('404')) {
      return NextResponse.json(
        { error: 'Model not found. Please try a different model name or check your API access.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to summarize PDF' },
      { status: 500 }
    );
  }
}