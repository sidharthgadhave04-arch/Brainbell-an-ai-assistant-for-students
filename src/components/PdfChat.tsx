// components/PdfChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PdfChatProps {
  documentId?: string;
}

const PdfChat: React.FC<PdfChatProps> = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are Scriba, a helpful and friendly AI assistant. You provide clear, concise, and accurate responses to help users with their questions.'
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(
          errorData.error?.message || 
          `API request failed: ${response.status}`
        );
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }

      const assistantMessage = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Error: ${errorMessage}\n\nPlease check:\n- Your API key is valid\n- You have internet connection\n- The API service is available` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#E8E4D9]">
      {/* Header */}
      <div className="bg-[#4A6B5C] text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold">Scriba</h1>
        <p className="text-sm text-gray-200 mt-1">Your AI Assistant</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl w-full mx-auto">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-600 mt-20">
              <Bot className="w-16 h-16 mx-auto mb-4 text-[#4A6B5C]" />
              <h2 className="text-2xl font-semibold mb-2">Welcome to Scriba! 👋</h2>
              <p>Ask me anything and I'll do my best to help you.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#4A6B5C] flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[75%] p-4 rounded-lg shadow-md ${
                    msg.role === 'user'
                      ? 'bg-[#4A6B5C] text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none'
                  }`}
                >
                  <p className="font-semibold mb-1 text-sm">
                    {msg.role === 'user' ? 'You' : 'Scriba'}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#4A6B5C] flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="bg-white text-gray-800 p-4 rounded-lg rounded-tl-none shadow-md">
                <p className="font-semibold mb-1 text-sm">Scriba</p>
                <p className="text-gray-500">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-300 bg-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A6B5C] focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-[#4A6B5C] text-white rounded-lg hover:bg-[#3d5a4d] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send size={20} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PdfChat;