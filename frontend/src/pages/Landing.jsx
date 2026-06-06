import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, MessageSquare, Plane, Shield } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-b from-blue-50 to-white px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Plane size={28} />
          </div>
          <h1 className="mb-6 text-5xl font-bold text-gray-900">SSAPort</h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-gray-600">
            KENTECH SSAP 참가 학생을 위한 출국 준비 관리 서비스입니다. 학교, 일정,
            서류, 체크리스트, AI 상담을 한 곳에서 관리하세요.
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
          >
            Start My SSAP
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-20 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 p-8 text-center transition hover:shadow-lg">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <ClipboardCheck size={32} />
          </div>
          <h3 className="mb-4 text-xl font-bold">맞춤형 체크리스트</h3>
          <p className="text-gray-600">
            목적지와 일정에 맞춰 필요한 준비 항목을 단계별로 확인할 수 있습니다.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 p-8 text-center transition hover:shadow-lg">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <MessageSquare size={32} />
          </div>
          <h3 className="mb-4 text-xl font-bold">AI 어시스턴트</h3>
          <p className="text-gray-600">
            비자, 서류, 항공, 생활 준비와 관련된 질문을 바로 확인하세요.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 p-8 text-center transition hover:shadow-lg">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <Shield size={32} />
          </div>
          <h3 className="mb-4 text-xl font-bold">출국 준비 관리</h3>
          <p className="text-gray-600">
            마감일과 진행률을 한눈에 보고 빠진 준비를 줄일 수 있습니다.
          </p>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-10 text-center text-gray-400">
        <p>© 2026 KENTECH SSAP Team. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
