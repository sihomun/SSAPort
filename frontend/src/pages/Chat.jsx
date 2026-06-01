import React, { useState } from 'react';
import { Send, User, Bot, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Chat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! SSAPort AI 어시스턴트입니다. 무엇이 궁금하신가요?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // In a real app, call backend API: POST /chat
    // Mocking response for now
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '질문하신 내용에 대해 답변해 드립니다. 미국 비자(F-1) 인터뷰를 위해서는 DS-160 확인서, I-20 원본, 그리고 비자 예약 확인서가 필요합니다.' 
      }]);
    }, 1000);
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
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
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
            className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />
          <button 
            onClick={handleSend}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
