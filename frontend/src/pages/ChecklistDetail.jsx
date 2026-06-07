import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, ExternalLink, Info } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { supabase } from '../lib/supabaseClient';

const stageMap = {
  0: 'STAGE 0: 사전 준비',
  1: 'STAGE 1: SSAP 신청',
  2: 'STAGE 2: 결과 및 면접',
  3: 'STAGE 3: 파견교 등록',
  4: 'STAGE 4: 비자 및 허가',
  5: 'STAGE 5: 숙소 신청',
  6: 'STAGE 6: 출국 전 준비',
  7: 'STAGE 7: 귀국 및 보고',
};

const stageIds = Object.keys(stageMap).map(Number);

const getSemanticTopic = (item) => {
  const text = `${item.title || ''} ${item.description || ''} ${item.deadline_label || ''}`
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
  const rules = [
    ['language-score', ['toeic', 'toefl', 'ielts', 'duolingo', '어학', '영어 성적', '성적표']],
    ['english-name', ['영문명', '여권', 'passport name']],
    ['application-deadline', ['지원서', '신청', '제출', '마감', '이메일', 'application']],
    ['study-plan', ['study plan', '학업계획', '학업 계획', 'course code', 'syllabus', '수강 과목', 'course']],
    ['cv-documents', ['cv', '이력서', '서류', 'pdf', '병합', '서약서', '성적표']],
    ['interview-result', ['면접 대상', '합격자', '선발 결과', '결과 발표', '발표 확인']],
    ['interview-prep', ['예상 질문', '면접 준비', '지원 동기', '답변 준비']],
    ['interview', ['면접 진행', '인터뷰 진행']],
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

const uniqueItems = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.resolvedStage ?? item.stage ?? ''}|${getSemanticTopic(item)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getItemStage = (item, fallbackCategory) => {
  if (item.stage !== undefined && item.stage !== null) return Number(item.stage);
  const title = (item.title || '').toLowerCase();
  if (
    title.includes('registration') ||
    title.includes('i-20') ||
    title.includes('offer') ||
    title.includes('파견교') ||
    title.includes('등록') ||
    title.includes('수강')
  ) {
    return 3;
  }
  if (
    title.includes('visa') ||
    title.includes('sevis') ||
    title.includes('ds-160') ||
    title.includes('eta') ||
    title.includes('비자') ||
    title.includes('입국')
  ) {
    return 4;
  }
  if (item.categoryId === 'flights') return 3;
  if (item.categoryId === 'visa') return 4;
  if (item.categoryId === 'accommodation') return 5;
  if (item.categoryId === 'packing') return 6;
  return Number(fallbackCategory);
};

const getDeadlineSortValue = (deadlineLabel) => {
  const label = String(deadlineLabel || '').trim();
  const dDayMatch = label.match(/D\s*-\s*(\d+)/i);
  if (dDayMatch) return -Number(dDayMatch[1]);

  const dPlusMatch = label.match(/D\s*\+\s*(\d+)/i);
  if (dPlusMatch) return Number(dPlusMatch[1]);

  const afterReturnMatch = label.match(/귀국\s*후\s*(\d+)/);
  if (afterReturnMatch) return 1000 + Number(afterReturnMatch[1]);

  if (label.includes('귀국')) return 1000;
  if (label.toLowerCase() === 'd-day') return 0;
  return 500;
};

const sortByDeadline = (items) =>
  [...items].sort((a, b) => {
    const deadlineDiff = getDeadlineSortValue(a.deadline_label) - getDeadlineSortValue(b.deadline_label);
    if (deadlineDiff !== 0) return deadlineDiff;
    return String(a.title || '').localeCompare(String(b.title || ''), 'ko');
  });

const ChecklistDetail = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const currentStage = Number(category);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const previousStage = useMemo(
    () => [...stageIds].reverse().find((stage) => stage < currentStage),
    [currentStage],
  );
  const nextStage = useMemo(
    () => stageIds.find((stage) => stage > currentStage),
    [currentStage],
  );

  useEffect(() => {
    const fetchItems = async (uid) => {
      try {
        setLoading(true);
        const response = await apiClient.get('/checklist/', { user_id: uid });
        const categories = response.categories || [];
        const allItems = uniqueItems(
          categories.flatMap((itemCategory) =>
            itemCategory.items.map((item) => ({
              ...item,
              categoryId: itemCategory.id,
              resolvedStage: getItemStage({ ...item, categoryId: itemCategory.id }, category),
            })),
          ),
        );

        setItems(sortByDeadline(allItems.filter((item) => item.resolvedStage === currentStage)));
      } catch (error) {
        console.error('Fetch items error:', error);
      } finally {
        setLoading(false);
      }
    };

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      setUserId(user.id);
      fetchItems(user.id);
    };

    init();
  }, [category, currentStage, navigate]);

  const goToNextStage = () => {
    window.setTimeout(() => {
      if (nextStage !== undefined) {
        navigate(`/checklist/${nextStage}`);
      } else {
        navigate('/dashboard');
      }
    }, 350);
  };

  const toggleItem = async (itemId, currentStatus) => {
    if (!userId) return;

    try {
      const nextStatus = !currentStatus;
      await apiClient.patch(`/checklist/items/${itemId}`, { is_done: nextStatus }, { user_id: userId });

      const updatedItems = items.map((item) => (item.id === itemId ? { ...item, is_done: nextStatus } : item));
      setItems(updatedItems);

      if (nextStatus && updatedItems.length > 0 && updatedItems.every((item) => item.is_done)) {
        goToNextStage();
      }
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  if (loading) {
    return <div className="p-10 text-center font-bold text-blue-600">항목을 불러오는 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-5">
        <div className="mx-auto flex max-w-2xl items-center">
          <button type="button" onClick={() => navigate('/dashboard')} className="mr-4 text-gray-500 hover:text-gray-900">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{stageMap[category] || '준비 항목'}</h1>
            <p className="mt-0.5 text-xs text-gray-400">지난 단계도 언제든 다시 열어 수정할 수 있습니다.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-2xl space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          {previousStage !== undefined ? (
            <Link
              to={`/checklist/${previousStage}`}
              className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-sm hover:border-blue-200"
            >
              <ChevronLeft size={16} className="mr-1" />
              이전 단계
            </Link>
          ) : (
            <span />
          )}

          {nextStage !== undefined && (
            <Link
              to={`/checklist/${nextStage}`}
              className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-sm hover:border-blue-200"
            >
              다음 단계
              <ChevronRight size={16} className="ml-1" />
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <Info className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-500">이 단계에 등록된 항목이 없습니다.</p>
            <button type="button" onClick={() => navigate('/dashboard')} className="mt-4 text-sm font-bold text-blue-600">
              대시보드로 돌아가기
            </button>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl border bg-white p-6 shadow-sm transition-all ${
                item.is_done ? 'border-green-100 bg-green-50/10' : 'border-gray-50 hover:shadow-md'
              }`}
            >
              <div className="flex items-start">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id, item.is_done)}
                  className={`mr-5 mt-1 transition-transform active:scale-90 ${
                    item.is_done ? 'text-green-500' : 'text-gray-200'
                  }`}
                >
                  {item.is_done ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                </button>
                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h3 className={`text-lg font-bold ${item.is_done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {item.title}
                    </h3>
                    {item.deadline_label && (
                      <span className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-black uppercase text-gray-400">
                        {item.deadline_label}
                      </span>
                    )}
                  </div>
                  <p className={`mb-4 text-sm leading-relaxed ${item.is_done ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.description}
                  </p>

                  {!item.is_done && (item.source_detail || (item.source_links && item.source_links.length > 0)) && (
                    <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-950">
                      <p className="mb-1 font-bold text-blue-700">준비 안내</p>
                      {item.source_detail && <p>{item.source_detail}</p>}
                      {item.source_links && item.source_links.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.source_links.map((link, index) => (
                            <a
                              key={`${link.url}-${index}`}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center rounded-xl bg-white px-3 py-2 text-xs font-bold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100"
                            >
                              <ExternalLink size={13} className="mr-1.5" />
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {item.links && item.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.links.map((link, index) => (
                        <a
                          key={`${link.url}-${index}`}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                        >
                          <ExternalLink size={14} className="mr-2" />
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChecklistDetail;
