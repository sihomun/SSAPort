import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

const ChecklistDetail = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  // In a real app, this would come from auth context
  const userId = "test-user-id";

  const categoryMap = {
    visa: '비자',
    flights: '항공',
    accommodation: '숙소',
    insurance: '보험',
    esim: '통신/eSIM',
    packing: '짐싸기'
  };

  useEffect(() => {
    setCategoryName(categoryMap[category] || category);
    fetchItems();
  }, [category]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/checklist/', { user_id: userId });
      const currentCategory = data.categories.find(c => c.id === category);
      if (currentCategory) {
        setItems(currentCategory.items);
      }
    } catch (error) {
      console.error("Fetch items error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (itemId, currentStatus) => {
    try {
      await apiClient.patch(`/checklist/items/${itemId}`, { 
        is_done: !currentStatus 
      }, { user_id: userId }); // Passing user_id as query param for simplicity in MVP
      
      // Update local state
      setItems(items.map(item => 
        item.id === itemId ? { ...item, is_done: !currentStatus } : item
      ));
    } catch (error) {
      console.error("Toggle item error:", error);
    }
  };

  if (loading) return <div className="p-10 text-center">항목을 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 flex items-center sticky top-0 z-10">
        <button onClick={() => navigate('/dashboard')} className="mr-4 text-gray-500 hover:text-gray-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">{categoryName} 준비</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            등록된 항목이 없습니다.
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white p-5 rounded-2xl shadow-sm border transition ${item.is_done ? 'border-green-100 bg-green-50/20' : 'border-gray-100'}`}
            >
              <div className="flex items-start">
                <button 
                  onClick={() => toggleItem(item.id, item.is_done)}
                  className={`mt-1 mr-4 transition ${item.is_done ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                >
                  {item.is_done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-gray-900 ${item.is_done ? 'line-through opacity-50' : ''}`}>
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">
                      {item.deadline_label}
                    </span>
                  </div>
                  <p className={`text-sm text-gray-600 mb-3 leading-relaxed ${item.is_done ? 'opacity-50' : ''}`}>
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
                          className="inline-flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                        >
                          <ExternalLink size={12} className="mr-1" />
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
