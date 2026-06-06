import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Clock, MessageCircle } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { supabase } from '../lib/supabaseClient';

const stageNames = [
  'STAGE 0: 사전 준비',
  'STAGE 1: SSAP 신청',
  'STAGE 2: 결과 및 면접',
  'STAGE 3: 파견교 등록',
  'STAGE 4: 비자 및 허가',
  'STAGE 5: 숙소 신청',
  'STAGE 6: 출국 전 준비',
  'STAGE 7: 귀국 및 보고',
];

const calculateDDay = (dateString) => {
  if (!dateString) return 0;
  const diff = new Date(dateString) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [stages, setStages] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate('/login');
          return;
        }

        const userProfile = await apiClient.get('/users/me', { user_id: user.id });
        setUserData({
          ...userProfile,
          d_day: calculateDDay(userProfile.departure_date),
        });

        const response = await apiClient.get('/checklist/', { user_id: user.id });
        const categories = response.categories || [];
        const allItems = categories.flatMap((category) =>
          category.items.map((item) => ({ ...item, categoryId: category.id })),
        );

        const groupedStages = stageNames.map((name, index) => {
          const stageItems = allItems.filter((item) => {
            if (item.stage !== undefined && item.stage !== null) return item.stage === index;
            if (index === 3) return item.categoryId === 'flights';
            if (index === 4) return item.categoryId === 'visa';
            if (index === 5) return item.categoryId === 'accommodation';
            if (index === 6) return item.categoryId === 'packing';
            return false;
          });

          const doneCount = stageItems.filter((item) => item.is_done).length;
          return {
            id: index,
            name,
            itemsCount: stageItems.length,
            doneCount,
            progress: stageItems.length > 0 ? Math.round((doneCount / stageItems.length) * 100) : 0,
          };
        });

        setStages(groupedStages);
        setOverallProgress(response.overall_progress || 0);
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return <div className="p-10 text-center font-bold text-blue-600">준비 현황을 불러오는 중...</div>;
  }

  const currentStage =
    stages.find((stage) => stage.progress < 100 && stage.itemsCount > 0) || stages[stages.length - 1];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="border-b border-gray-200 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-4xl items-end justify-between">
          <div>
            <h2 className="mb-1 text-sm font-medium text-gray-500">
              {userData?.host_university || '파견교 미설정'} 파견 준비
            </h2>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentStage?.name.split(': ')[1] || '준비'} 단계 진행 중
            </h1>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-blue-600">D-{userData?.d_day || 0}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-4xl px-6">
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">전체 준비 완료율</h3>
            <span className="font-bold text-blue-600">{overallProgress}%</span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-blue-600 transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <h3 className="mb-4 ml-1 font-bold text-gray-900">단계별 준비 현황</h3>
        <div className="mb-8 space-y-4">
          {stages.map((stage) => (
            <Link
              key={stage.id}
              to={stage.itemsCount > 0 ? `/checklist/${stage.id}` : '#'}
              className={`flex items-center justify-between rounded-2xl border-2 bg-white p-5 shadow-sm transition ${
                stage.id === currentStage?.id ? 'border-blue-500' : 'border-transparent'
              } ${stage.itemsCount === 0 ? 'cursor-default opacity-50' : 'hover:border-blue-200'}`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    stage.progress === 100
                      ? 'bg-green-100 text-green-600'
                      : stage.id === currentStage?.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {stage.progress === 100 ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                </div>
                <div>
                  <h4 className={`font-bold ${stage.id === currentStage?.id ? 'text-gray-900' : 'text-gray-500'}`}>
                    {stage.name}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {stage.doneCount} / {stage.itemsCount} 항목 완료
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`text-sm font-bold ${stage.progress === 100 ? 'text-green-500' : 'text-blue-600'}`}>
                  {stage.progress}%
                </span>
                <ChevronRight className="text-gray-300" />
              </div>
            </Link>
          ))}
        </div>

        <Link to="/chat" className="flex items-center justify-between rounded-3xl bg-blue-900 p-6 text-white shadow-xl">
          <div>
            <p className="mb-1 text-sm text-blue-300">AI 가이드</p>
            <h4 className="text-lg font-bold">현재 단계에서 주의할 점을 물어보기</h4>
          </div>
          <div className="rounded-2xl bg-blue-800 p-3">
            <MessageCircle size={24} />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
