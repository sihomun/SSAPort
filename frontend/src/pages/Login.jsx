import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        });

        if (error) throw error;
        alert('회원가입 요청이 완료되었습니다. 이메일 인증을 확인해 주세요.');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-black text-blue-600">SSAPort</h1>
          <p className="text-sm text-gray-500">
            {isSignUp ? '새 계정을 만들고 SSAP 준비를 시작하세요.' : '다시 오신 것을 환영합니다.'}
          </p>
        </div>

        <div className="mb-8 flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
              !isSignUp ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
              isSignUp ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="mb-1 ml-1 block text-xs font-bold uppercase text-gray-400">
              이메일 주소
            </label>
            <input
              type="email"
              placeholder="student@kentech.ac.kr"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 ml-1 block text-xs font-bold uppercase text-gray-400">
              비밀번호
            </label>
            <input
              type="password"
              placeholder="비밀번호"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '처리 중...' : isSignUp ? '회원가입하기' : '로그인하기'}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-gray-400">
          Secure Authentication by Supabase
        </p>
      </div>
    </div>
  );
};

export default Login;
