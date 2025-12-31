
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface AuthProps {
  onAuthSuccess: (session: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handleGuestLogin = async () => {
    setLoading(true);
    // Simulate a short delay for effect
    await new Promise(resolve => setTimeout(resolve, 800));
    // Create a dummy session for the guest
    onAuthSuccess({ 
        user: { 
            id: 'guest_' + Math.floor(Math.random() * 10000), 
            email: 'guest@b-fluent.app' 
        } 
    });
    setLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!isSupabaseConfigured) {
      await new Promise(resolve => setTimeout(resolve, 800));
      onAuthSuccess({ user: { id: 'demo', email: email || 'demo@example.com' } });
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes('confirm')) {
            throw new Error("Please verify your email address. Check your inbox for the link.");
          }
          throw error;
        }
        if (data.session) onAuthSuccess(data.session);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { phone },
            emailRedirectTo: window.location.origin 
          },
        });
        if (error) throw error;
        if (data.session) {
          onAuthSuccess(data.session);
        } else {
          setVerificationSent(true);
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center bg-white animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-5xl mb-8 animate-bounce">📧</div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Check Your Inbox</h2>
        <p className="text-slate-500 mb-10 leading-relaxed text-lg">
          We've sent a magic link to <span className="font-bold text-indigo-600 underline underline-offset-4">{email}</span>. 
          Confirm it to unlock your fluency.
        </p>
        <button 
          onClick={() => { setVerificationSent(false); setIsLogin(true); }}
          className="w-full max-w-xs bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden relative">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-b-[4rem] z-0"></div>
      
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center px-8 py-12">
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-white rounded-3xl mb-6 shadow-2xl shadow-indigo-200">
            <span className="text-4xl">🗣️</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">B fluent</h1>
          <p className="text-indigo-100 font-bold text-xs uppercase tracking-widest opacity-80">
            {isLogin ? 'Welcome back to the club' : 'Begin your journey today'}
          </p>
        </div>

        <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-50">
          <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 border border-slate-100">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {!isLogin && (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+91 00000 00000"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (isLogin ? 'Start Learning' : 'Join Now')}
            </button>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white px-2 text-slate-400">Or</span></div>
            </div>

            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full bg-indigo-50 text-indigo-600 font-black py-4 rounded-2xl border-2 border-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
            >
              Continue as Guest
            </button>
          </form>

          {errorMsg && (
            <div className="mt-6 p-4 rounded-2xl bg-red-50 text-red-600 text-[10px] font-bold text-center border border-red-100 animate-in shake duration-500 uppercase tracking-wider">
              {errorMsg}
            </div>
          )}
        </div>
        
        <p className="mt-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">© 2025 B fluent Learning</p>
      </div>
    </div>
  );
};

export default Auth;
