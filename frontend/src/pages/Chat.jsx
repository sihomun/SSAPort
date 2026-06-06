import React, { useState, useEffect } from 'react';
import { Send, User, Bot, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { supabase } from '../lib/supabaseClient';

const Chat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! SSAPort AI 어시스턴트입니다. 무엇이 궁금하신가요?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
      else navigate('/login');
    });
  }, [navigate]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !userId) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/chat/', {
        user_id: userId,
        message: input,
        history: messages.slice(-5)
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
      <div className="bg-white px-4 py-4 border-b border-gray-200 flex items-center">
        <Link to="/dashboard" className="mr-4 text-gray-500 hover:text-gray-900">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold">AI 어시스턴트</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none shadow-sm'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-xs text-gray-400">AI가 생각 중...</div>}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="궁금한 점을 물어보세요..."
            className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 focus:outline-none text-sm"
          />
          <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-full">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
