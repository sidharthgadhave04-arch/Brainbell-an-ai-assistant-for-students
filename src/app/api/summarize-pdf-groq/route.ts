import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { extractText } from 'unpdf';
import Tesseract from 'tesseract.js';
import { fromBuffer } from 'pdf2pic';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
  timeout: 60000, // 60 second timeout
  maxRetries: 2,  // Retry failed requests
});

async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  // First, try to extract text normally
  const uint8Array = new Uint8Array(buffer);
  const pdfResult = await extractText(uint8Array);
  const normalText = String(pdfResult.text || '');
  
  // If we got good text, return it
  if (normalText.trim().length > 50) {
    return {
      text: normalText,
      numPages: pdfResult.totalPages
    };
  }
  
  // Otherwise, it's probably a scanned PDF - use OCR
  console.log('Text extraction yielded little text, attempting OCR...');
  
  try {
    const options = {
      density: 100,
      format: 'png',
      width: 2000,
      height: 2000
    };
    
    const convert = fromBuffer(buffer, options);
    let ocrText = '';
    let pageCount = 0;
    
    // Try to convert first 10 pages
    for (let i = 1; i <= 10; i++) {
      try {
        const page = await convert(i, { responseType: 'buffer' });
        pageCount = i;
        
        console.log(`Processing page ${i} with OCR...`);
        
        const { data: { text } } = await Tesseract.recognize(
          page.buffer,
          'eng',
          {
            logger: m => console.log(m)
          }
        );
        
        ocrText += text + '\n\n';
      } catch (pageError) {
        // No more pages
        console.log(`Finished at page ${i-1}`);
        break;
      }
    }
    
    if (ocrText.trim().length === 0) {
      throw new Error('OCR extracted no text');
    }
    
    return {
      text: ocrText,
      numPages: pageCount
    };
  } catch (ocrError) {
    console.error('OCR failed:', ocrError);
    throw new Error('Could not extract text from PDF. The PDF may be encrypted, corrupted, or image-based without readable content.');
  }
}

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Attempting to extract text from PDF...');
    const extractedData = await extractTextFromPDF(buffer);
    const pdfText = String(extractedData.text);
    const numPages = extractedData.numPages;
    console.log('Extracted text length:', pdfText.length);

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract any text from the PDF.' },
        { status: 400 }
      );
    }

    const maxLength = 25000;
    const truncatedText = pdfText.substring(0, maxLength);

    console.log('Sending request to Groq API...');

    // Add timeout wrapper to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - PDF processing took too long')), 60000);
    });

    const groqPromise = groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates comprehensive, well-structured summaries of documents. Focus on extracting key information and presenting it in a clear, organized manner."
        },
        {
          role: "user",
          content: `Please provide a comprehensive summary of this document. Include:

1. **Main Topic/Theme**: What is this document primarily about?
2. **Key Points**: List the most important points (use bullet points)
3. **Important Details**: Highlight any significant findings, data, or arguments
4. **Conclusion**: What are the main takeaways?

Document text:
${truncatedText}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2000,
    });

    const chatCompletion = await Promise.race([groqPromise, timeoutPromise]) as any;
    console.log('Received response from Groq API');

    const summary = chatCompletion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      summary,
      fileName: file.name,
      fileSize: file.size,
      textLength: pdfText.length,
      wasTruncated: pdfText.length > maxLength,
      pagesProcessed: numPages
    });

  } catch (error: any) {
    console.error('Error summarizing PDF:', error);
    
    // Handle timeout errors
    if (error.message?.includes('timeout') || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { error: 'Request timeout. The PDF might be too large or complex. Please try a smaller file or check your internet connection.' },
        { status: 408 }
      );
    }
    
    if (error.message?.includes('rate_limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid GROQ API key. Please check your configuration.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to summarize PDF. Please try again.' },
      { status: 500 }
    );
  }
}