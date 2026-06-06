import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { supabase } from '../lib/supabaseClient';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '안녕하세요. SSAPort AI 어시스턴트입니다. SSAP 준비와 관련해 궁금한 점을 물어보세요.',
    },
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
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/chat/', {
        user_id: userId,
        message: input,
        history: messages.slice(-5),
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: 'assistant',
          content: response.reply,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: 'assistant',
          content: '죄송합니다. 서버와 통신하는 중 오류가 발생했습니다.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <div className="flex items-center border-b border-gray-200 bg-white px-4 py-4">
        <Link to="/dashboard" className="mr-4 text-gray-500 hover:text-gray-900">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold">AI 어시스턴트</h1>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'rounded-tr-none bg-blue-600 text-white'
                  : 'rounded-tl-none border border-gray-100 bg-white text-gray-900 shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-xs text-gray-400">AI가 답변을 작성하는 중...</div>}
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSend();
            }}
            placeholder="궁금한 점을 물어보세요."
            className="flex-1 rounded-full border-none bg-gray-100 px-5 py-3 text-sm focus:outline-none"
          />
          <button type="button" onClick={handleSend} className="rounded-full bg-blue-600 p-3 text-white">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
