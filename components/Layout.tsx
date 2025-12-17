import React from 'react';
import { AppRoute } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentRoute, onNavigate }) => {
  const isHome = currentRoute === AppRoute.HOME;

  return (
    <div className="h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative font-sans">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 px-6 py-4 pointer-events-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 pointer-events-auto">
            {!isHome && (
              <button 
                onClick={() => onNavigate(AppRoute.HOME)}
                className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg text-indigo-600 hover:scale-110 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {isHome && (
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-xs font-bold text-gray-600 tracking-wider uppercase">Online</span>
                </div>
            )}
          </div>
          
          {/* Logo removed as requested */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-50">
        {children}
      </main>

    </div>
  );
};

export default Layout;