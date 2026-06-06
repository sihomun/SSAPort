import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Circle, ExternalLink, Info } from 'lucide-react';
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

const uniqueItems = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.stage ?? ''}|${item.categoryId ?? ''}|${(item.title ?? '').trim().toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const ChecklistDetail = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchItems = async (uid) => {
      try {
        setLoading(true);
        const response = await apiClient.get('/checklist/', { user_id: uid });
        const categories = response.categories || [];
        const allItems = categories.flatMap((itemCategory) =>
          itemCategory.items.map((item) => ({ ...item, categoryId: itemCategory.id })),
        );

        const filtered = allItems.filter((item) => {
          if (item.stage !== undefined && item.stage !== null) return String(item.stage) === category;
          if (category === '3') return item.categoryId === 'flights';
          if (category === '4') return item.categoryId === 'visa';
          if (category === '5') return item.categoryId === 'accommodation';
          if (category === '6') return item.categoryId === 'packing';
          return false;
        });

        setItems(uniqueItems(filtered));
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
  }, [category, navigate]);

  const toggleItem = async (itemId, currentStatus) => {
    if (!userId) return;

    try {
      await apiClient.patch(`/checklist/items/${itemId}`, { is_done: !currentStatus }, { user_id: userId });
      setItems((currentItems) =>
        currentItems.map((item) => (item.id === itemId ? { ...item, is_done: !currentStatus } : item)),
      );
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  if (loading) {
    return <div className="p-10 text-center font-bold text-blue-600">항목을 불러오는 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="sticky top-0 z-10 flex items-center border-b border-gray-200 bg-white px-4 py-6">
        <button type="button" onClick={() => navigate('/dashboard')} className="mr-4 text-gray-500 hover:text-gray-900">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{stageMap[category] || '준비 항목'}</h1>
          <p className="mt-0.5 text-xs text-gray-400">필수 준비 사항을 체크하세요.</p>
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-2xl space-y-4 p-4">
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
