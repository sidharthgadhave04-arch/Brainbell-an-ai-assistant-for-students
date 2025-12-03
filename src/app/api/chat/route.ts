import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Please sign in to use chat' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { message, pdfContent, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const messages = [
      {
        role: 'system',
        content: `You are Scriba Assistant, an expert AI tutor specializing in engineering, mathematics, science, and academic problems. Provide clear, detailed explanations with step-by-step solutions.${pdfContent ? '\n\nDocument content:\n' + pdfContent.substring(0, 10000) : ''}`
      }
    ];

    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }

    messages.push({
      role: 'user',
      content: message
    });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-or-v1-free',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenRouter API failed');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return NextResponse.json({
      success: true,
      response: aiResponse,
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Chat API is working!' });
}