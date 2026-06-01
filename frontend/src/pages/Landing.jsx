import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Shield, MessageSquare, ClipboardCheck } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="px-6 py-20 text-center bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">SSAPort</h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          KENTECH 해외단기연수(SSAP) 참가 학생을 위한 
          출국 전 준비 관리 웹 서비스
        </p>
        <Link 
          to="/login" 
          className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition"
        >
          Start My SSAP
        </Link>
      </header>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
        <div className="text-center p-8 border border-gray-100 rounded-2xl hover:shadow-lg transition">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardCheck size={32} />
          </div>
          <h3 className="text-xl font-bold mb-4">맞춤형 체크리스트</h3>
          <p className="text-gray-600">목적지와 대학에 맞춰 AI가 생성한 필수 준비 항목을 관리하세요.</p>
        </div>
        <div className="text-center p-8 border border-gray-100 rounded-2xl hover:shadow-lg transition">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-xl font-bold mb-4">AI 어시스턴트</h3>
          <p className="text-gray-600">비자, 서류, 현지 생활 등 궁금한 점을 24시간 언제든 물어보세요.</p>
        </div>
        <div className="text-center p-8 border border-gray-100 rounded-2xl hover:shadow-lg transition">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plane size={32} />
          </div>
          <h3 className="text-xl font-bold mb-4">짐 목록 생성기</h3>
          <p className="text-gray-600">현지 기후와 기간에 딱 맞는 최적의 짐 목록을 AI로 만들어 드립니다.</p>
        </div>
      </section>

      <footer className="py-10 border-t border-gray-100 text-center text-gray-400">
        <p>© 2026 KENTECH SSAP Team. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
