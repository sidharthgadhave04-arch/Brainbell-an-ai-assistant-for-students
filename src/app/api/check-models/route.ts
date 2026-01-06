import { NextRequest, NextResponse } from 'next/server';

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

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

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

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Use the REST API directly with gemini-1.5-flash-latest
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{
        parts: [
          {
            text: `Please provide a comprehensive summary of this PDF document. Include:
1. Main topic/theme
2. Key points (use bullet points)
3. Important details or findings
4. Conclusion or main takeaways

Please be thorough and organized in your summary.`
          },
          {
            inline_data: {
              mime_type: 'application/pdf',
              data: base64Data
            }
          }
        ]
      }]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate summary');
    }

    const data = await response.json();
    const summary = data.candidates[0].content.parts[0].text;

    return NextResponse.json({
      success: true,
      summary,
      fileName: file.name,
      fileSize: file.size
    });

  } catch (error: any) {
    console.error('Error summarizing PDF:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to summarize PDF' },
      { status: 500 }
    );
  }
}