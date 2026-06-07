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

const uniqueItems = (items) => {
  const getSemanticTopic = (item) => {
    const text = `${item.title || ''} ${item.description || ''} ${item.deadline_label || ''}`
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
    const rules = [
      ['language-score', ['toeic', 'toefl', 'ielts', 'duolingo', '어학', '영어 성적', '성적표']],
      ['study-plan', ['study plan', '학업계획', '학업 계획', 'course code', 'syllabus', '수강 과목', 'course']],
      ['cv-documents', ['cv', '이력서', '서류', 'pdf', '병합', '서약서', '성적표']],
      ['interview-result', ['면접 대상', '합격자', '선발 결과', '결과 발표']],
      ['interview-prep', ['예상 질문', '면접 준비', '지원 동기', '답변 준비']],
      ['registration-link', ['registration link', '등록 링크', '비밀번호', 'service fee', '감면']],
      ['account', ['계정', 'portal', '포털', 'myucla', 'calcentral', 'calnet', 'mydce', '등록 번호', 'student id', 'uid']],
      ['course-registration', ['수강 신청', '등록비', '수업료', '납부', 'bruinbill', 'flywire', 'financial services', '결제']],
      ['i20-offer', ['i-20', 'i20', 'offer form', 'acceptance of offer', 'iss portal', 'visa request']],
      ['sevis', ['sevis', 'i-901', 'i901']],
      ['ds160', ['ds-160', 'ds160']],
      ['visa-interview', ['비자 인터뷰', '인터뷰 예약', 'ustraveldocs', '비자 수수료']],
      ['eta', ['eta', '영국 입국', '입국 허가']],
      ['housing-compare', ['숙소 선택', '숙소 비교', '기숙사', 'airbnb', 'i-house', '위치', '계약 조건']],
      ['housing-apply', ['숙소 신청', '숙소 예약', 'housing application', 'housing request', 'residences', '예약금']],
      ['move-in', ['입주', '체크인', '보증금', '주소', '담당자']],
      ['flight-route', ['항공권', '공항', '이동 동선', '교통편']],
      ['departure-essentials', ['출국 필수', '어댑터', '상비약', 'esim', '로밍', '결제 카드', '비상용 카드', '보조배터리']],
      ['emergency-contact', ['비상 연락', '긴급 연락', '연락망', '보험사']],
      ['report', ['결과보고서', '보고서']],
      ['receipt', ['영수증', '증빙', '정산']],
      ['final-submit', ['최종 제출', '제출 확인', '접수 여부']],
    ];
    const match = rules.find(([, keywords]) => keywords.some((keyword) => text.includes(keyword)));
    return match ? match[0] : (item.title || '').trim().toLowerCase().replace(/\s+/g, ' ');
  };
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.stage ?? ''}|${getSemanticTopic(item)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
        const allItems = uniqueItems(
          categories.flatMap((category) => category.items.map((item) => ({ ...item, categoryId: category.id }))),
        );

        const groupedStages = stageNames.map((name, index) => {
          const stageItems = allItems.filter((item) => {
            if (item.stage !== undefined && item.stage !== null) return Number(item.stage) === index;
            const title = (item.title || '').toLowerCase();
            if (
              index === 3 &&
              (title.includes('registration') ||
                title.includes('i-20') ||
                title.includes('offer') ||
                title.includes('파견교') ||
                title.includes('등록') ||
                title.includes('수강'))
            ) {
              return true;
            }
            if (
              index === 4 &&
              (title.includes('visa') ||
                title.includes('sevis') ||
                title.includes('ds-160') ||
                title.includes('eta') ||
                title.includes('비자') ||
                title.includes('입국'))
            ) {
              return true;
            }
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
          {stages.map((stage) => {
            return (
              <Link
                key={stage.id}
                to={`/checklist/${stage.id}`}
                className={`flex items-center justify-between rounded-2xl border-2 bg-white p-5 shadow-sm transition hover:border-blue-200 ${
                  stage.id === currentStage?.id ? 'border-blue-500' : 'border-transparent'
                }`}
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
                    <h4 className={`font-bold ${stage.id === currentStage?.id ? 'text-gray-900' : 'text-gray-600'}`}>
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
            );
          })}
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
