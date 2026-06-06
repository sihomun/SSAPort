import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    host_university: '',
    departure_date: '',
    stay_weeks: 4,
    is_first_time: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'stay_weeks' ? parseInt(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // For MVP, we use a fixed user_id or generate one
      const userId = "test-user-id"; 
      await apiClient.post('/users/onboarding', {
        ...formData,
        user_id: userId,
        email: "student@kentech.ac.kr"
      });
      navigate('/dashboard');
    } catch (error) {
      console.error("Onboarding failed:", error);
      alert("온보딩 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">출국 준비 시작하기</h1>
        <p className="text-gray-500 mb-8">몇 가지 정보만 입력하면 AI가 맞춤형 체크리스트를 만들어 드립니다.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">파견 대학</label>
            <input
              type="text"
              name="host_university"
              required
              placeholder="예: UCLA, UC Berkeley"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onChange={handleChange}
            />
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
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
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
