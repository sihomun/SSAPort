import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';
import { CheckCircle2, ChevronRight, MessageCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [stages, setStages] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const userId = "test-user-id";

  const stageNames = [
    "STAGE 0: 사전 준비",
    "STAGE 1: SSAP 신청",
    "STAGE 2: 결과 및 면접",
    "STAGE 3: 파견교 등록",
    "STAGE 4: 비자 및 허가",
    "STAGE 5: 숙소 신청",
    "STAGE 6: 출국 전 준비",
    "STAGE 7: 귀국 및 보고"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch user profile
        const user = await apiClient.get(`/users/me?user_id=${userId}`);
        setUserData({
          ...user,
          d_day: calculateDDay(user.departure_date)
        });

        // 2. Fetch all checklist items and group by Stage
        const response = await apiClient.get('/checklist/', { user_id: userId });
        
        // Regroup items by stage from the flat list
        const allItems = response.categories.flatMap(c => c.items.map(i => ({...i, categoryId: c.id})));
        
        // We'll fetch the items again with stage info if possible, 
        // but for now let's simulate the stage grouping logic
        const groupedStages = stageNames.map((name, index) => {
          // This part assumes items have a 'stage' property from the DB
          // For current items, we'll map them based on their content or category
          const stageItems = allItems.filter(item => {
              // Temporary mapping logic until data is fully migrated
              if (index === 0) return item.title.includes('어학') || item.title.includes('공고');
              if (index === 3) return item.categoryId === 'flights';
              if (index === 4) return item.categoryId === 'visa';
              if (index === 5) return item.categoryId === 'accommodation';
              if (index === 6) return item.categoryId === 'packing';
              return false;
          });

          const doneCount = stageItems.filter(i => i.is_done).length;
          return {
            id: index,
            name: name,
            itemsCount: stageItems.length,
            doneCount: doneCount,
            progress: stageItems.length > 0 ? Math.round((doneCount / stageItems.length) * 100) : 0
          };
        });

        setStages(groupedStages);
        setOverallProgress(response.overall_progress);
      } catch (error) {
        console.error("Dashboard Error:", error);
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

  if (loading) return <div className="p-10 text-center">준비 현황 로딩 중...</div>;

  // Find the current active stage (first stage with progress < 100)
  const currentStage = stages.find(s => s.progress < 100 && s.itemsCount > 0) || stages[stages.length - 1];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-between items-end">
          <div>
            <h2 className="text-gray-500 text-sm font-medium mb-1">{userData?.host_university} 파견 준비</h2>
            <h1 className="text-2xl font-bold text-gray-900">{currentStage?.name.split(': ')[1]} 단계 진행 중</h1>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-blue-600">D-{userData?.d_day}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        {/* Progress Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">전체 준비 완료도</h3>
            <span className="text-blue-600 font-bold">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-700" 
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Stages Timeline */}
        <h3 className="font-bold text-gray-900 mb-4 ml-1">단계별 준비 현황</h3>
        <div className="space-y-4 mb-8">
          {stages.map((stage) => (
            <div 
              key={stage.id}
              className={`bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between border-2 transition ${
                stage.id === currentStage?.id ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  stage.progress === 100 ? 'bg-green-100 text-green-600' : 
                  stage.id === currentStage?.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {stage.progress === 100 ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                </div>
                <div>
                  <h4 className={`font-bold ${stage.id === currentStage?.id ? 'text-gray-900' : 'text-gray-500'}`}>
                    {stage.name}
                  </h4>
                  <p className="text-xs text-gray-400">{stage.doneCount} / {stage.itemsCount} 항목 완료</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className={`text-sm font-bold ${stage.progress === 100 ? 'text-green-500' : 'text-blue-600'}`}>
                    {stage.progress}%
                  </span>
                </div>
                <ChevronRight className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>

        {/* AI Call to Action */}
        <Link to="/chat" className="bg-blue-900 p-6 rounded-3xl text-white flex justify-between items-center shadow-xl">
          <div>
            <p className="text-blue-300 text-sm mb-1">AI 가이드</p>
            <h4 className="text-lg font-bold">현재 단계에서 주의할 점 물어보기</h4>
          </div>
          <div className="bg-blue-800 p-3 rounded-2xl">
            <MessageCircle size={24} />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
