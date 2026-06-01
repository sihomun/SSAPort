import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plane, Calendar, CheckCircle2, AlertCircle, ChevronRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [progress, setProgress] = useState(67);

  useEffect(() => {
    // In a real app, fetch from backend API
    setUserData({
      name: "김켄텍",
      destination: "UCLA",
      departure_date: "2026-06-21",
      d_day: 20
    });
  }, []);

  const categories = [
    { id: 'visa', name: '비자', count: '4/5', date: 'D-3', color: 'bg-blue-100 text-blue-700' },
    { id: 'flights', name: '항공권', count: '1/1', date: '완료', color: 'bg-green-100 text-green-700' },
    { id: 'accommodation', name: '숙소', count: '1/2', date: 'D-15', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'insurance', name: '보험', count: '0/1', date: 'D-10', color: 'bg-red-100 text-red-700' },
    { id: 'esim', name: 'eSIM/유심', count: '0/1', date: 'D-7', color: 'bg-purple-100 text-purple-700' },
    { id: 'packing', name: '짐 꾸리기', count: '12/40', date: '진행중', color: 'bg-gray-100 text-gray-700' },
  ];

  if (!userData) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-between items-end">
          <div>
            <h2 className="text-gray-500 text-sm font-medium mb-1">Hello, {userData.name}!</h2>
            <h1 className="text-2xl font-bold text-gray-900">{userData.destination} 연수 준비 중</h1>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-blue-600">D-{userData.d_day}</span>
            <p className="text-xs text-gray-400 mt-1">{userData.departure_date} 출국</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        {/* Progress Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">전체 진행률</h3>
            <span className="text-blue-600 font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/checklist/${cat.id}`}
              className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${cat.color}`}>
                <CheckCircle2 size={20} />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{cat.name}</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{cat.count} 항목</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${cat.color.split(' ')[0]} bg-opacity-50`}>
                  {cat.date}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 rounded-2xl text-white flex justify-between items-center">
          <div>
            <p className="text-blue-100 text-sm mb-1">AI 추천 다음 할 일</p>
            <h4 className="text-lg font-bold">비자 인터뷰 예상 질문 확인하기</h4>
          </div>
          <ChevronRight />
        </div>
      </div>

      {/* Floating Chat Button */}
      <Link 
        to="/chat"
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition active:scale-95"
      >
        <MessageCircle size={30} />
      </Link>
    </div>
  );
};

export default Dashboard;
