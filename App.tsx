import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Auth from './features/Auth';
import Home from './features/Home';
import Course from './features/Course';
import AiPartner from './features/AiPartner';
import AiSolver from './features/AiSolver';
import HumanChat from './features/HumanChat';
import QuizGym from './features/QuizGym';
import Subscription from './features/Subscription';
import PolicyViewer from './features/PolicyViewer';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { AppRoute, User } from './types';
import { SubscriptionPlan } from './constants';

const ProtectedRoute: React.FC<{ children: React.ReactNode; user: User | null; onNavigate: (route: AppRoute) => void }> = ({ children, user, onNavigate }) => {
  if (user && !user.isSubscribed) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-white">
        <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex items-center justify-center text-4xl mb-6 shadow-xl animate-bounce">👑</div>
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Premium Only</h2>
        <p className="text-slate-400 mb-10 text-sm font-medium leading-relaxed px-4">This feature is reserved for B fluent Pro members. Upgrade now to unlock your full potential.</p>
        <button onClick={() => onNavigate(AppRoute.SUBSCRIPTION)} className="w-full max-w-[240px] bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-95">View Plans</button>
      </div>
    );
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.AUTH);
  const [user, setUser] = useState<User | null>(null);
  const [activePolicyPage, setActivePolicyPage] = useState<string>('terms');
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured || userId === 'demo') {
      return { isSubscribed: true, quizScore: 0, completedDays: [] }; // Default for demo or unconfigured
    }
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      const isSubscribed = data?.subscription_expiry ? new Date(data.subscription_expiry).getTime() > Date.now() : false;
      return {
        isSubscribed,
        quizScore: data?.quiz_score || 0,
        completedDays: data?.completed_days || []
      };
    } catch (e) {
      return { isSubscribed: false, quizScore: 0, completedDays: [] };
    }
  }, []);

  const handleAuthState = useCallback(async (session: any) => {
    if (session) {
      const profileData = await fetchUserData(session.user.id);
      setUser({ 
        id: session.user.id, 
        email: session.user.email || '', 
        ...profileData
      });
      setCurrentRoute(AppRoute.HOME);
    } else {
      setUser(null);
      setCurrentRoute(AppRoute.AUTH);
    }
    setLoading(false);
  }, [fetchUserData]);

  useEffect(() => {
    let isMounted = true;
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    
    const initAuth = async () => {
      // If Supabase isn't configured, we skip attempting to get the session
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) handleAuthState(session);

        // Setup listener
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (isMounted) handleAuthState(session);
        });
        authListener = data;
      } catch (error) {
        console.error("Auth init failed:", error);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, [handleAuthState]);

  const handleManualAuthSuccess = async (session: any) => {
    await handleAuthState(session);
  };

  const handleSubscriptionSuccess = async (plan: SubscriptionPlan) => {
    if (user) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + plan.days);
      if (isSupabaseConfigured && user.id !== 'demo') {
        await supabase.from('profiles').upsert({ 
          id: user.id, 
          subscription_expiry: expiryDate.toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      setUser(prev => prev ? { ...prev, isSubscribed: true } : null);
      setCurrentRoute(AppRoute.HOME);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setUser(null);
    setCurrentRoute(AppRoute.AUTH);
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center p-8 overflow-hidden text-center">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-8">B fluent</p>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentRoute) {
      case AppRoute.AUTH: 
        return <Auth onAuthSuccess={handleManualAuthSuccess} />;
      case AppRoute.HOME: 
        return <Home onNavigate={setCurrentRoute} onOpenPolicy={(id) => { setActivePolicyPage(id); setCurrentRoute(AppRoute.POLICY); }} onLogout={handleLogout} user={user} />;
      case AppRoute.COURSE: 
        return <ProtectedRoute user={user} onNavigate={setCurrentRoute}><Course /></ProtectedRoute>;
      case AppRoute.AI_PARTNER: 
        return <ProtectedRoute user={user} onNavigate={setCurrentRoute}><AiPartner /></ProtectedRoute>;
      case AppRoute.AI_SOLVER:
        return <ProtectedRoute user={user} onNavigate={setCurrentRoute}><AiSolver /></ProtectedRoute>;
      case AppRoute.HUMAN_CHAT:
        return <ProtectedRoute user={user} onNavigate={setCurrentRoute}><HumanChat user={user} /></ProtectedRoute>;
      case AppRoute.QUIZ: 
        return <QuizGym />;
      case AppRoute.SUBSCRIPTION: 
        return <Subscription user={user} onSuccess={handleSubscriptionSuccess} onCancel={() => setCurrentRoute(AppRoute.HOME)} />;
      case AppRoute.POLICY: 
        return <PolicyViewer pageId={activePolicyPage} onBack={() => setCurrentRoute(AppRoute.HOME)} />;
      default: 
        return <Home onNavigate={setCurrentRoute} onOpenPolicy={(id) => { setActivePolicyPage(id); setCurrentRoute(AppRoute.POLICY); }} onLogout={handleLogout} user={user} />;
    }
  };

  return <Layout currentRoute={currentRoute} onNavigate={setCurrentRoute}>{renderScreen()}</Layout>;
};

export default App;