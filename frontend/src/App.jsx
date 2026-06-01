import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';

// Mock components for other pages
const Login = () => <div className="p-10">Login Page (Coming Soon)</div>;
const Onboarding = () => <div className="p-10">Onboarding Page (Coming Soon)</div>;
const ChecklistDetail = () => <div className="p-10">Checklist Detail Page (Coming Soon)</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/checklist/:category" element={<ChecklistDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
