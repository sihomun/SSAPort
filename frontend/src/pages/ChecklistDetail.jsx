import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { supabase } from '../lib/supabaseClient';

const ChecklistDetail = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [userId, setUserId] = useState(null);

  const categoryMap = {
    "0": '사전 준비',
    "1": 'SSAP 신청',
    "2": '결과 및 면접',
    "3": '파견교 등록',
    "4": '비자 및 허가',
    "5": '숙소 신청',
    "6": '출국 전 준비',
    "7": '귀국 및 보고'
  };

  useEffect(() => {
    setCategoryName(categoryMap[category] || '준비 항목');
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchItems(user.id);
      } else {
        navigate('/login');
      }
    });
  }, [category, navigate]);

  const fetchItems = async (uid) => {
    try {
      setLoading(true);
      const data = await apiClient.get('/checklist/', { user_id: uid });
      
      // Stage 기반 필터링 (category 파라미터가 stage ID로 들어옴)
      const allItems = data.categories.flatMap(c => c.items.map(i => ({...i, categoryId: c.id})));
      const filteredItems = allItems.filter(item => String(item.stage) === category);
      
      setItems(filteredItems);
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
      console.error("Toggle item error:", error);
    }
  };

  if (loading) return <div className="p-10 text-center">항목 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white px-4 py-4 border-b border-gray-200 flex items-center sticky top-0 z-10">
        <button onClick={() => navigate('/dashboard')} className="mr-4 text-gray-500 hover:text-gray-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">{categoryName}</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-500">이 단계에 등록된 항목이 없습니다.</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className={`bg-white p-5 rounded-2xl shadow-sm border ${item.is_done ? 'border-green-100 bg-green-50/20' : 'border-gray-100'}`}>
              <div className="flex items-start">
                <button onClick={() => toggleItem(item.id, item.is_done)} className={`mt-1 mr-4 ${item.is_done ? 'text-green-500' : 'text-gray-300'}`}>
                  {item.is_done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <div className="flex-1">
                  <h3 className={`font-bold text-gray-900 ${item.is_done ? 'line-through opacity-50' : ''}`}>{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded">{item.deadline_label}</span>
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
