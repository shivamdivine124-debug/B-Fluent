import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Auth from './features/Auth';
import Home from './features/Home';
import Course from './features/Course';
import AiPartner from './features/AiPartner';
import HumanChat from './features/HumanChat';
import QuizGym from './features/QuizGym';
import Subscription from './features/Subscription';
import PolicyViewer from './features/PolicyViewer';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { AppRoute, User } from './types';
import { SubscriptionPlan } from './constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: User | null;
  onNavigate: (route: AppRoute) => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, user, onNavigate }) => {
  if (user && !user.isSubscribed) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-50">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-3xl mb-4">👑</div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Premium Feature</h2>
        <p className="text-slate-500 mb-8">This feature is reserved for our premium learners. Upgrade to unlock everything!</p>
        <button 
          onClick={() => onNavigate(AppRoute.SUBSCRIPTION)}
          className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-200"
        >
          View Plans
        </button>
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

  // Checks both LocalStorage (for speed) and Supabase (for truth)
  const getSubscriptionStatus = useCallback(async (userId: string): Promise<boolean> => {
    let cloudExpiry: number | null = null;
    let localExpiry: number | null = null;

    // 1. Check LocalStorage
    const localKey = `bf_sub_${userId}`;
    const stored = localStorage.getItem(localKey);
    if (stored) {
      try {
        localExpiry = JSON.parse(stored).expiry;
      } catch (e) { /* ignore */ }
    }

    // 2. Check Supabase 'profiles' table
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_expiry')
          .eq('id', userId)
          .maybeSingle();

        if (data?.subscription_expiry) {
          cloudExpiry = new Date(data.subscription_expiry).getTime();
        }
      } catch (err) {
        console.error("Subscription check failed", err);
      }
    }

    const finalExpiry = Math.max(cloudExpiry || 0, localExpiry || 0);
    const isCurrentlySubscribed = finalExpiry > Date.now();

    // Keep LocalStorage in sync if cloud had the data
    if (cloudExpiry && cloudExpiry > (localExpiry || 0)) {
        localStorage.setItem(localKey, JSON.stringify({ expiry: cloudExpiry }));
    }

    return isCurrentlySubscribed;
  }, []);

  const saveSubscriptionToDatabase = async (userId: string, days: number) => {
    const expiryTimestamp = Date.now() + (days * 24 * 60 * 60 * 1000);
    const expiryISO = new Date(expiryTimestamp).toISOString();

    // Save locally
    const localKey = `bf_sub_${userId}`;
    localStorage.setItem(localKey, JSON.stringify({ expiry: expiryTimestamp }));

    // Save to Supabase
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('profiles').upsert({
          id: userId,
          subscription_expiry: expiryISO
        });
        if (error) console.error("Sync error:", error.message);
      } catch (err) {
        console.error("Database sync failed", err);
      }
    }
    
    // Update local app state
    setUser(prev => prev ? { ...prev, isSubscribed: true } : null);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setUser(null);
    setCurrentRoute(AppRoute.AUTH);
  };

  useEffect(() => {
    // Initial load: Check if user is already logged in
    const initSession = async () => {
      setLoading(true);
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const subStatus = await getSubscriptionStatus(session.user.id);
          setUser({ 
            id: session.user.id, 
            email: session.user.email || '', 
            isSubscribed: subStatus 
          });
          setCurrentRoute(AppRoute.HOME);
        }
      } catch (error) {
        console.error("Session init error", error);
      } finally {
        setLoading(false);
      }
    };
    initSession();

    // Listen for Login/Logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const subStatus = await getSubscriptionStatus(session.user.id);
        setUser({ 
          id: session.user.id, 
          email: session.user.email || '', 
          isSubscribed: subStatus 
        });
        if (event === 'SIGNED_IN') setCurrentRoute(AppRoute.HOME);
      } else {
        setUser(null);
        setCurrentRoute(AppRoute.AUTH);
      }
    });
    return () => subscription.unsubscribe();
  }, [getSubscriptionStatus]);

  const handleSubscriptionSuccess = async (plan: SubscriptionPlan) => {
    if (user) {
      await saveSubscriptionToDatabase(user.id, plan.days);
      setCurrentRoute(AppRoute.HOME);
      alert(`Payment Successful! Your ${plan.name} is now active.`);
    }
  };

  if (loading && currentRoute !== AppRoute.AUTH) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold">Resuming session...</p>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentRoute) {
      case AppRoute.AUTH:
        return <Auth onAuthSuccess={async (session) => {
          const sub = await getSubscriptionStatus(session.user.id);
          setUser({ id: session.user.id, email: session.user.email!, isSubscribed: sub });
          setCurrentRoute(AppRoute.HOME);
        }} />;
      case AppRoute.HOME:
        return <Home onNavigate={setCurrentRoute} onOpenPolicy={(id) => { setActivePolicyPage(id); setCurrentRoute(AppRoute.POLICY); }} onLogout={handleLogout} user={user} />;
      case AppRoute.COURSE:
        return <ProtectedRoute user={user} onNavigate={setCurrentRoute}><Course /></ProtectedRoute>;
      case AppRoute.AI_PARTNER:
        return <ProtectedRoute user={user} onNavigate={setCurrentRoute}><AiPartner /></ProtectedRoute>;
      case AppRoute.HUMAN_CHAT:
        return <ProtectedRoute user={user} onNavigate={setCurrentRoute}><HumanChat user={user} /></ProtectedRoute>;
      case AppRoute.QUIZ:
        return <QuizGym />;
      case AppRoute.SUBSCRIPTION:
        return <Subscription user={user} onSuccess={handleSubscriptionSuccess} onCancel={() => setCurrentRoute(AppRoute.HOME)} />;
      case AppRoute.POLICY:
        return <PolicyViewer pageId={activePolicyPage} />;
      default:
        return <Home onNavigate={setCurrentRoute} onOpenPolicy={(id) => { setActivePolicyPage(id); setCurrentRoute(AppRoute.POLICY); }} onLogout={handleLogout} user={user} />;
    }
  };

  return (
    <Layout currentRoute={currentRoute} onNavigate={setCurrentRoute}>
      {renderScreen()}
    </Layout>
  );
};

export default App;