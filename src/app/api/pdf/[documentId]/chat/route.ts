import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyDckN98ZyxB9WfAekINiy-pHxbBJyoAmxY');

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

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = `You are Scriba Assistant, an expert AI tutor specializing in engineering, mathematics, science, and academic problems. Provide clear, detailed explanations with step-by-step solutions.\n\n`;

    if (pdfContent) {
      prompt += `The user has uploaded a document. Content:\n\n${pdfContent.substring(0, 10000)}\n\n`;
    }

    if (conversationHistory && conversationHistory.length > 0) {
      prompt += `Previous conversation:\n`;
      conversationHistory.forEach((msg: any) => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      prompt += `\n`;
    }

    prompt += `User: ${message}\nAssistant:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const aiResponse = response.text();

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