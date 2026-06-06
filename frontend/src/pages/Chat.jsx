import React, { useState, useEffect } from 'react';
import { Send, User, Bot, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';

const Chat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! SSAPort AI 어시스턴트입니다. 무엇이 궁금하신가요?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // In a real app, this would come from auth context
  const userId = "test-user-id";

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/chat/', {
        user_id: userId,
        message: input,
        history: messages.slice(-5) // Send last 5 messages for context
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.reply 
      }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "죄송합니다. 서버와 통신 중 오류가 발생했습니다." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 flex items-center">
        <Link to="/dashboard" className="mr-4 text-gray-500 hover:text-gray-900">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold">AI 어시스턴트</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none shadow-sm'
            }`}>
              <div className="flex items-center mb-1">
                {msg.role === 'assistant' ? <Bot size={14} className="mr-1 text-blue-500" /> : <User size={14} className="mr-1 opacity-70" />}
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                  {msg.role}
                </span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
              <span className="flex space-x-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="비자 준비물에 대해 물어보세요..."
            disabled={isLoading}
            className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className={`${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white p-3 rounded-full transition active:scale-95`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
