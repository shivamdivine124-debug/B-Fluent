
import React from 'react';
import { AppRoute } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentRoute, onNavigate }) => {
  const isHome = currentRoute === AppRoute.HOME;
  const isAuth = currentRoute === AppRoute.AUTH;

  return (
    <div className="h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative font-sans">
      {/* Dynamic Header */}
      {!isAuth && (
        <header className="absolute top-0 left-0 right-0 z-50 p-4 pointer-events-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 pointer-events-auto">
              {!isHome && (
                <button 
                  onClick={() => onNavigate(AppRoute.HOME)}
                  className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-xl shadow-slate-200/50 text-slate-800 hover:scale-110 active:scale-95 transition-all border border-slate-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {isHome && (
                  <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl px-4 py-2.5 rounded-full shadow-lg border border-indigo-50">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></div>
                     <span className="text-[10px] font-black text-slate-800 tracking-[0.15em] uppercase">B fluent Live</span>
                  </div>
              )}
            </div>
            
            {/* Context Actions could go here */}
          </div>
        </header>
      )}

      {/* Main Content Area with optimized scrolling */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-50 overflow-x-hidden">
        {children}
      </main>

      {/* Persistent App Identifier for unauthenticated users */}
      {isAuth && (
        <div className="absolute top-0 left-0 right-0 p-8 flex justify-center z-50 pointer-events-none">
           {/* Branding managed in Auth.tsx */}
        </div>
      )}
    </div>
  );
};

export default Layout;
