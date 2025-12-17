import React from 'react';
import { AppRoute, User } from '../types';

interface HomeProps {
  onNavigate: (route: AppRoute) => void;
  onOpenPolicy: (policyId: string) => void;
  onLogout: () => void;
  user: User | null;
}

const Home: React.FC<HomeProps> = ({ onNavigate, onOpenPolicy, onLogout, user }) => {
  return (
    <div className="h-full bg-gradient-to-b from-indigo-50 to-white pt-24 pb-6 px-6 overflow-y-auto no-scrollbar">
      
      {/* Welcome Section */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Hi, <span className="text-indigo-600">{user?.email?.split('@')[0] || 'Learner'}</span>
          </h2>
          <p className="text-slate-500 text-sm font-medium">{user?.email}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
            {user?.isSubscribed ? (
               <div className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">
                  Pro Member
               </div>
            ) : (
                <div className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-300">
                  Free Plan
               </div>
            )}
            <button 
                onClick={onLogout}
                className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-600 transition"
            >
                Logout
            </button>
        </div>
      </div>

      {/* Premium CTA */}
      {!user?.isSubscribed && (
        <button 
          onClick={() => onNavigate(AppRoute.SUBSCRIPTION)}
          className="w-full mb-8 bg-gradient-to-r from-amber-400 to-orange-500 p-4 rounded-3xl shadow-lg shadow-amber-200 flex items-center justify-between text-left group"
        >
          <div>
            <h4 className="text-white font-black text-lg">Unlock Pro Access</h4>
            <p className="text-amber-50 text-xs font-medium">Get Sonia, Global Call & Course</p>
          </div>
          <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </div>
        </button>
      )}

      {/* Stats Cards */}
      <div className="flex gap-4 mb-10">
         <div className="flex-1 bg-white p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-2xl mb-1">🔥</span>
            <span className="text-xl font-black text-slate-800 leading-none">12</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Day Streak</span>
         </div>
         <div className="flex-1 bg-white p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-2xl mb-1">🎯</span>
            <span className="text-xl font-black text-slate-800 leading-none">85%</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Accuracy</span>
         </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
         <div className="h-1 w-1 rounded-full bg-slate-300"></div>
         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Learning Features</h3>
         <div className="h-px flex-1 bg-slate-100"></div>
      </div>
      
      {/* Feature Grid */}
      <div className="grid grid-cols-1 gap-5 pb-8">
        <button
            onClick={() => onNavigate(AppRoute.COURSE)}
            className="group relative w-full bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 shadow-lg shadow-orange-200 text-left overflow-hidden transition-transform transform active:scale-95"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="relative z-10">
                <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4 text-2xl">📚</div>
                <h4 className="text-2xl font-black text-white mb-1">AI Course</h4>
                <p className="text-orange-50 text-sm font-medium">Learn from your native language.</p>
            </div>
        </button>

        <button
            onClick={() => onNavigate(AppRoute.AI_PARTNER)}
            className="group relative w-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 shadow-lg shadow-blue-200 text-left overflow-hidden transition-transform transform active:scale-95"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="relative z-10">
                <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4 text-2xl">🤖</div>
                <h4 className="text-2xl font-black text-white mb-1">AI Partner</h4>
                <p className="text-blue-50 text-sm font-medium">Practice speaking with Sonia.</p>
            </div>
        </button>

        <button
            onClick={() => onNavigate(AppRoute.HUMAN_CHAT)}
            className="group relative w-full bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl p-6 shadow-lg shadow-emerald-200 text-left overflow-hidden transition-transform transform active:scale-95"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="relative z-10">
                <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4 text-2xl">🌍</div>
                <h4 className="text-2xl font-black text-white mb-1">Global Connect</h4>
                <p className="text-emerald-50 text-sm font-medium">Voice chat with random learners.</p>
            </div>
        </button>

        <button
            onClick={() => onNavigate(AppRoute.QUIZ)}
            className="group relative w-full bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-6 shadow-lg shadow-violet-200 text-left overflow-hidden transition-transform transform active:scale-95"
        >
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="relative z-10">
                <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4 text-2xl">🏋️</div>
                <h4 className="text-2xl font-black text-white mb-1">The Gym</h4>
                <p className="text-violet-50 text-sm font-medium">Compete in multiplayer quizzes.</p>
            </div>
        </button>
      </div>

      <footer className="mt-8 pt-8 pb-4 border-t border-slate-200 text-center">
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[10px] text-slate-500 mb-6 font-bold uppercase tracking-wider">
            <button onClick={() => onOpenPolicy('terms')} className="hover:text-indigo-600 transition-colors">Terms</button>
            <button onClick={() => onOpenPolicy('privacy')} className="hover:text-indigo-600 transition-colors">Privacy</button>
            <button onClick={() => onOpenPolicy('refund')} className="hover:text-indigo-600 transition-colors">Refund</button>
            <button onClick={() => onOpenPolicy('contact')} className="hover:text-indigo-600 transition-colors">Contact</button>
        </div>
        <p className="text-[10px] text-slate-400">© 2024 BFluent. Made in India 🇮🇳</p>
      </footer>
    </div>
  );
};

export default Home;