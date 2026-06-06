import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Circle, ExternalLink, Info } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { supabase } from '../lib/supabaseClient';

const ChecklistDetail = () => {
  const { category } = useParams(); // URL의 :category가 실제로는 STAGE 번호 (0, 1, 2...)
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [userId, setUserId] = useState(null);

  const stageMap = {
    "0": 'STAGE 0: 사전 준비',
    "1": 'STAGE 1: SSAP 신청',
    "2": 'STAGE 2: 결과 및 면접',
    "3": 'STAGE 3: 파견교 등록',
    "4": 'STAGE 4: 비자 및 허가',
    "5": 'STAGE 5: 숙소 신청',
    "6": 'STAGE 6: 출국 전 준비',
    "7": 'STAGE 7: 귀국 및 보고'
  };

  useEffect(() => {
    setCategoryName(stageMap[category] || '준비 항목');
    
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchItems(user.id);
      } else {
        navigate('/login');
      }
    };
    init();
  }, [category]);

  const fetchItems = async (uid) => {
    try {
      setLoading(true);
      // 전체 체크리스트를 가져와서 해당 stage인 것만 필터링
      const response = await apiClient.get('/checklist/', { user_id: uid });
      
      // response.categories를 순회하며 stage가 일치하는 항목만 추출
      const allItems = response.categories.flatMap(c => 
        c.items.map(i => ({...i, categoryId: c.id}))
      );
      
      // 백엔드에서 준 stage 데이터가 있으면 사용, 없으면 categoryId로 매핑 (하위 호환성)
      const filtered = allItems.filter(item => {
        if (item.stage !== undefined && item.stage !== null) {
          return String(item.stage) === category;
        }
        // 하위 호환 매핑 로직
        if (category === "3") return item.categoryId === 'flights';
        if (category === "4") return item.categoryId === 'visa';
        return false;
      });

      setItems(filtered);
    } catch (error) {
      console.error("Fetch items error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (itemId, currentStatus) => {
    if (!userId) return;
    try {
      await apiClient.patch(`/checklist/items/${itemId}`, { 
        is_done: !currentStatus 
      }, { user_id: userId });
      
      setItems(items.map(item => 
        item.id === itemId ? { ...item, is_done: !currentStatus } : item
      ));
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  if (loading) return <div className="p-10 text-center text-blue-600 font-bold">항목을 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-gray-200 flex items-center sticky top-0 z-10">
        <button onClick={() => navigate('/dashboard')} className="mr-4 text-gray-500 hover:text-gray-900">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{categoryName}</h1>
          <p className="text-xs text-gray-400 mt-0.5">필수 준비 사항을 체크하세요</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4 mt-4">
        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Info className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">이 단계에 등록된 항목이 없습니다.</p>
            <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 text-sm font-bold">대시보드로 돌아가기</button>
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white p-6 rounded-3xl shadow-sm border transition-all ${
                item.is_done ? 'border-green-100 bg-green-50/10' : 'border-gray-50 hover:shadow-md'
              }`}
            >
              <div className="flex items-start">
                <button 
                  onClick={() => toggleItem(item.id, item.is_done)}
                  className={`mt-1 mr-5 transition-transform active:scale-90 ${item.is_done ? 'text-green-500' : 'text-gray-200'}`}
                >
                  {item.is_done ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                </button>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold text-lg ${item.is_done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-2 py-1 rounded-lg uppercase tracking-tighter">
                      {item.deadline_label}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed mb-4 ${item.is_done ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                  
                  {item.links && item.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.links.map((link, idx) => (
                        <a 
                          key={idx}
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition"
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
