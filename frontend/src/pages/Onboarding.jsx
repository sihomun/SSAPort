import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { supabase } from '../lib/supabaseClient';

const universities = [
  { name: 'UCLA (미국)', value: 'UCLA' },
  { name: 'UC Berkeley (미국)', value: 'UC Berkeley' },
  { name: 'Harvard (미국)', value: 'Harvard' },
  { name: 'UCL (영국)', value: 'UCL' },
  { name: 'UPenn (미국)', value: 'UPenn' },
  { name: 'Utrecht (네덜란드)', value: 'Utrecht' },
  { name: 'TU Berlin (독일)', value: 'TU Berlin' },
  { name: 'TBS Education (프랑스)', value: 'TBS Edu.' },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    host_university: '',
    departure_date: '',
    stay_weeks: 4,
    is_first_time: true,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
      else navigate('/login');
    });
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: type === 'checkbox' ? checked : name === 'stay_weeks' ? Number.parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId || !formData.host_university) {
      alert('학교를 선택해 주세요.');
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await apiClient.post('/users/onboarding', {
        ...formData,
        user_id: userId,
        email: user?.email,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding failed:', error);
      alert('체크리스트를 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">출국 준비 시작하기</h1>
        <p className="mb-8 text-sm text-gray-500">
          파견 예정 학교와 일정을 선택하면 맞춤형 체크리스트를 생성합니다.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">파견 대학 선택</label>
            <select
              name="host_university"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              value={formData.host_university}
            >
              <option value="">학교를 선택하세요</option>
              {universities.map((university) => (
                <option key={university.value} value={university.value}>
                  {university.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">출국 예정일</label>
            <input
              type="date"
              name="departure_date"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">체류 기간 (주)</label>
            <input
              type="number"
              name="stay_weeks"
              min="1"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              value={formData.stay_weeks}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_first_time"
              id="is_first_time"
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formData.is_first_time}
              onChange={handleChange}
            />
            <label htmlFor="is_first_time" className="ml-2 text-sm text-gray-700">
              해외 연수가 처음입니다
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl py-4 font-bold text-white shadow-lg transition ${
              loading ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
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
