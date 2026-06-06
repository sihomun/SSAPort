import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (isSignUp) {
      // Sign Up
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/onboarding'
        }
      });
      if (error) {
        alert(error.message);
      } else {
        alert('회원가입 신청이 완료되었습니다! 이메일을 확인하여 인증해주세요.');
      }
    } else {
      // Login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        alert(error.message);
      } else {
        navigate('/dashboard');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-blue-600 mb-2">SSAPort</h1>
          <p className="text-gray-500 text-sm">
            {isSignUp ? '새로운 계정 만들기' : '다시 오신 것을 환영합니다'}
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
          <button 
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${!isSignUp ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
          >
            로그인
          </button>
          <button 
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${isSignUp ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">이메일 주소</label>
            <input
              type="email"
              placeholder="student@kentech.ac.kr"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">비밀번호</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400 mt-4"
          >
            {loading ? '처리 중...' : (isSignUp ? '회원가입하기' : '로그인하기')}
          </button>
        </form>
        
        <p className="mt-8 text-center text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest">
          Secure Authentication by Supabase
        </p>
      </div>
    </div>
  );
};

export default Login;
