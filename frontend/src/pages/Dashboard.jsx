import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';
import { Plane, Calendar, CheckCircle2, AlertCircle, ChevronRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);

  // In a real app, this would come from auth context
  const userId = "test-user-id";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch user profile
        const user = await apiClient.get('/users/me'); // Note: Backend needs this endpoint or we use mock
        setUserData({
            ...user,
            d_day: calculateDDay(user.departure_date)
        });

        // 2. Fetch checklist
        const checklistData = await apiClient.get('/checklist/', { user_id: userId });
        setChecklist(checklistData);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        // Fallback for demo if backend isn't ready
        setUserData({
            name: "User",
            host_university: "UCLA",
            departure_date: "2026-06-21",
            d_day: 20
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateDDay = (dateString) => {
    const diff = new Date(dateString) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getCategoryColor = (id) => {
    const colors = {
      visa: 'bg-blue-100 text-blue-700',
      flights: 'bg-green-100 text-green-700',
      accommodation: 'bg-yellow-100 text-yellow-700',
      insurance: 'bg-red-100 text-red-700',
      esim: 'bg-purple-100 text-purple-700',
      packing: 'bg-gray-100 text-gray-700',
    };
    return colors[id] || 'bg-gray-100 text-gray-700';
  };

  if (loading) return <div className="p-10 text-center">준비 정보를 가져오는 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-between items-end">
          <div>
            <h2 className="text-gray-500 text-sm font-medium mb-1">Hello, {userData?.email?.split('@')[0] || 'Student'}!</h2>
            <h1 className="text-2xl font-bold text-gray-900">{userData?.host_university} 연수 준비 중</h1>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-blue-600">D-{userData?.d_day}</span>
            <p className="text-xs text-gray-400 mt-1">{userData?.departure_date} 출국</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        {/* Progress Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">전체 진행률</h3>
            <span className="text-blue-600 font-bold">{checklist?.overall_progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-500" 
              style={{ width: `${checklist?.overall_progress || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {checklist?.categories?.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/checklist/${cat.id}`}
              className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${getCategoryColor(cat.id)}`}>
                <CheckCircle2 size={20} />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{cat.name}</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{cat.items.length} 항목</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${getCategoryColor(cat.id).split(' ')[0]} bg-opacity-50`}>
                  {cat.progress}%
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* AI Recommendations */}
        <Link to="/chat" className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 rounded-2xl text-white flex justify-between items-center">
          <div>
            <p className="text-blue-100 text-sm mb-1">AI 어시스턴트에게 물어보기</p>
            <h4 className="text-lg font-bold">비자 인터뷰나 짐 싸기 팁이 궁금하신가요?</h4>
          </div>
          <ChevronRight />
        </Link>
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
