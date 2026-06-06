import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { supabase } from '../lib/supabaseClient';

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    host_university: '',
    departure_date: '',
    stay_weeks: 4,
    is_first_time: true
  });

  const universities = [
    { name: "UCLA (미국)", value: "UCLA" },
    { name: "UC Berkeley (미국)", value: "UC Berkeley" },
    { name: "Harvard (미국)", value: "Harvard" },
    { name: "UCL (영국)", value: "UCL" },
    { name: "UPenn (미국)", value: "UPenn" },
    { name: "Utrecht (네덜란드)", value: "Utrecht" },
    { name: "TU Berlin (독일)", value: "TU Berlin" },
    { name: "TBS Edu. (프랑스)", value: "TBS Edu." }
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
      else navigate('/login');
    });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'stay_weeks' ? parseInt(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !formData.host_university) {
      alert("학교를 선택해주세요.");
      return;
    }
    
    setLoading(true);
    try {
      await apiClient.post('/users/onboarding', {
        ...formData,
        user_id: userId,
        email: (await supabase.auth.getUser()).data.user?.email
      });
      navigate('/dashboard');
    } catch (error) {
      console.error("Onboarding failed:", error);
      alert("체크리스트 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">출국 준비 시작하기</h1>
        <p className="text-gray-500 mb-8 text-sm">파견 예정인 대학을 선택하시면 AI가 맞춤형 가이드를 생성합니다.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">파견 대학 선택</label>
            <select
              name="host_university"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              onChange={handleChange}
              value={formData.host_university}
            >
              <option value="">학교를 선택하세요</option>
              {universities.map((uni, idx) => (
                <option key={idx} value={uni.value}>{uni.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">출국 예정일</label>
            <input
              type="date"
              name="departure_date"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">체류 기간 (주)</label>
            <input
              type="number"
              name="stay_weeks"
              min="1"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onChange={handleChange}
              value={formData.stay_weeks}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_first_time"
              id="is_first_time"
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              checked={formData.is_first_time}
              onChange={handleChange}
            />
            <label htmlFor="is_first_time" className="ml-2 text-sm text-gray-700">
              해외 연수가 처음인가요?
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {loading ? 'AI 체크리스트 생성 중...' : '준비 시작하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
