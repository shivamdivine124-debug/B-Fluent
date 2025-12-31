
import React from 'react';
import { AppRoute, User } from '../types';

interface HomeProps {
  onNavigate: (route: AppRoute) => void;
  onOpenPolicy: (policyId: string) => void;
  onLogout: () => void;
  user: User | null;
}

const Home: React.FC<HomeProps> = ({ onNavigate, onOpenPolicy, onLogout, user }) => {
  const userName = user?.email?.split('@')[0] || 'Learner';
  const streak = user?.completedDays?.length || 0;
  const score = user?.quizScore || 0;

  return (
    <div className="min-h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-12 overflow-y-auto no-scrollbar relative font-sans text-slate-900">
      
      {/* Top Header Section */}
      <div className="pt-24 px-8 relative z-10">
        
        <h1 className="text-4xl font-extrabold tracking-tight mb-1 text-slate-900">
          Hello, <span className="text-indigo-600 capitalize">{userName}!</span>
        </h1>
        <p className="text-slate-500 font-semibold text-sm mb-8">Ready to master English today?</p>

        {/* Premium Banner */}
        <button 
          onClick={() => onNavigate(AppRoute.SUBSCRIPTION)}
          className="w-full bg-[#1a1c2e] p-6 rounded-[2rem] flex items-center justify-between mb-10 shadow-xl shadow-indigo-900/10 active:scale-[0.98] transition-all group"
        >
          <div className="text-left">
            <div className="bg-amber-400 text-[#1a1c2e] text-[8px] font-black uppercase px-2 py-0.5 rounded-md inline-block mb-2 tracking-tighter">PRO</div>
            <h3 className="text-white text-lg font-bold leading-tight group-hover:text-indigo-300 transition-colors">Unlock Premium</h3>
            <p className="text-slate-400 text-xs font-medium">Get unlimited access & more.</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-indigo-500 transition-all">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          </div>
        </button>

        {/* Stats Row - Dark Colored Cards */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-orange-600 border border-orange-500 shadow-[0_10px_30px_rgba(234,88,12,0.3)] p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
            <span className="text-2xl mb-2 drop-shadow-sm relative z-10 group-hover:scale-110 transition-transform">🔥</span>
            <span className="text-2xl font-black text-white leading-none relative z-10">{streak}</span>
            <span className="text-[9px] font-black text-orange-100 uppercase tracking-[0.2em] mt-1 relative z-10">Day Streak</span>
          </div>
          <div className="bg-violet-600 border border-violet-500 shadow-[0_10px_30px_rgba(124,58,237,0.3)] p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
            <span className="text-2xl mb-2 drop-shadow-sm relative z-10 group-hover:scale-110 transition-transform">🎯</span>
            <span className="text-2xl font-black text-white leading-none relative z-10">{score}</span>
            <span className="text-[9px] font-black text-violet-100 uppercase tracking-[0.2em] mt-1 relative z-10">Quiz Score</span>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-indigo-100"></div>
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Learning Features</span>
            <div className="h-px flex-1 bg-indigo-100"></div>
          </div>

          <div className="space-y-4">
            {/* 1. AI Course */}
            <button 
              onClick={() => onNavigate(AppRoute.COURSE)}
              className="w-full bg-gradient-to-r from-orange-400 to-rose-500 p-6 rounded-[2.5rem] flex flex-col items-start gap-4 shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-20 text-6xl mix-blend-overlay group-hover:scale-110 transition-transform duration-500">📚</div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner backdrop-blur-md border border-white/20">📚</div>
              <div className="text-left relative z-10">
                <h3 className="text-white text-2xl font-black tracking-tight leading-none">AI Course</h3>
                <p className="text-white/80 text-xs font-bold mt-1">Learn from your native language.</p>
              </div>
            </button>

            {/* 2. AI Partner */}
            <button 
              onClick={() => onNavigate(AppRoute.AI_PARTNER)}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-[2.5rem] flex flex-col items-start gap-4 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-20 text-6xl mix-blend-overlay group-hover:scale-110 transition-transform duration-500">🤖</div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner backdrop-blur-md border border-white/20">🤖</div>
              <div className="text-left relative z-10">
                <h3 className="text-white text-2xl font-black tracking-tight leading-none">AI Partner</h3>
                <p className="text-white/80 text-xs font-bold mt-1">Practice speaking with Sonia.</p>
              </div>
            </button>

            {/* 3. AI Problem Solver */}
            <button 
              onClick={() => onNavigate(AppRoute.AI_SOLVER)}
              className="w-full bg-gradient-to-r from-emerald-400 to-teal-600 p-6 rounded-[2.5rem] flex flex-col items-start gap-4 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-20 text-6xl mix-blend-overlay group-hover:scale-110 transition-transform duration-500">💡</div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner backdrop-blur-md border border-white/20">💡</div>
              <div className="text-left relative z-10">
                <h3 className="text-white text-2xl font-black tracking-tight leading-none">AI Problem Solver</h3>
                <p className="text-white/80 text-xs font-bold mt-1">Clear your doubts in native language.</p>
              </div>
            </button>

            {/* 4. Global Connect */}
            <button 
              onClick={() => onNavigate(AppRoute.HUMAN_CHAT)}
              className="w-full bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] flex flex-col items-start gap-4 shadow-lg shadow-slate-900/30 active:scale-[0.98] transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 text-8xl grayscale group-hover:scale-110 transition-transform duration-500">🌍</div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/10">🗣️</div>
              <div className="text-left relative z-10">
                <h3 className="text-white text-2xl font-black tracking-tight leading-none">Global Connect</h3>
                <p className="text-slate-400 text-xs font-bold mt-1">Talk to real people via Zego.</p>
              </div>
            </button>

            {/* 5. Quiz Gym */}
            <button 
              onClick={() => onNavigate(AppRoute.QUIZ)}
              className="w-full bg-gradient-to-r from-purple-500 to-violet-600 p-6 rounded-[2.5rem] flex flex-col items-start gap-4 shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-20 text-6xl mix-blend-overlay group-hover:scale-110 transition-transform duration-500">🏋️</div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner backdrop-blur-md border border-white/20">🏋️</div>
              <div className="text-left relative z-10">
                <h3 className="text-white text-2xl font-black tracking-tight leading-none">Quiz Gym</h3>
                <p className="text-white/80 text-xs font-bold mt-1">Workout your grammar power.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer & Logout */}
        <footer className="mt-12 pt-8 border-t border-indigo-50 text-center pb-12">
          <div className="flex flex-wrap justify-center gap-6 text-[10px] text-slate-400 font-black uppercase tracking-widest mb-10">
              <button onClick={() => onOpenPolicy('terms')} className="hover:text-slate-600 transition">Terms</button>
              <button onClick={() => onOpenPolicy('privacy')} className="hover:text-slate-600 transition">Privacy</button>
              <button onClick={() => onOpenPolicy('contact')} className="hover:text-slate-600 transition">Support</button>
              <button onClick={onLogout} className="text-rose-500 hover:text-rose-600 transition">Logout</button>
          </div>
          <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.5em]">B Fluent 2025</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
