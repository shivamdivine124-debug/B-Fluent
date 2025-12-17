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
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMsg('');

    // Pre-check for configuration to avoid "Failed to fetch"
    if (!isSupabaseConfigured) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const demoSession = {
        user: { 
          id: 'demo-user-id', 
          email: email || 'demo@example.com',
          user_metadata: { phone: phone }
        },
        access_token: 'demo-token'
      };
      
      setErrorMsg('Demo Mode: Backend not configured. Logging in locally...');
      
      setTimeout(() => {
        onAuthSuccess(demoSession);
      }, 1500);
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Login Flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        if (data.session) {
            onAuthSuccess(data.session);
        }
      } else {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              phone: phone, // Saving phone number to user metadata
            },
          },
        });

        if (error) throw error;

        if (data.session) {
            onAuthSuccess(data.session);
        } else if (data.user && !data.session) {
            setMessage('Sign up successful! Please check your email to confirm your account.');
        }
      }
    } catch (error: any) {
      // Fallback for unexpected failures even if config seemed present
      if (error?.message === 'Failed to fetch' || error?.message?.includes('fetch')) {
        const demoSession = {
          user: { 
            id: 'demo-user-id', 
            email: email || 'demo@example.com',
            user_metadata: { phone: phone }
          },
          access_token: 'demo-token'
        };
        setErrorMsg('Network Error. Entering Demo Mode...');
        setTimeout(() => {
          onAuthSuccess(demoSession);
        }, 1500);
        return;
      }

      console.error("Auth Error:", error);
      if (error.message === 'Invalid login credentials') {
         setErrorMsg('Invalid email or password. Please try again.');
      } else {
         setErrorMsg(error.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-indigo-700">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-500 mt-2">
            {isLogin ? 'Sign in to continue learning' : 'Join B Fluent today'}
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6 relative">
          <button
            onClick={() => { setIsLogin(true); setMessage(''); setErrorMsg(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 z-10 ${
              isLogin ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setMessage(''); setErrorMsg(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 z-10 ${
              !isLogin ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div className="animate-fade-in-down">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="+91 99999 99999"
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-70 flex justify-center items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : (isLogin ? 'Log In' : 'Create Account')}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 rounded-lg text-sm text-center bg-green-100 text-green-700 border border-green-200">
            {message}
          </div>
        )}
        
        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg text-sm text-center bg-red-100 text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}
        
        <div className="mt-8 text-center text-xs text-gray-400">
           By continuing, you agree to our Terms & Conditions.
        </div>
      </div>
    </div>
  );
};

export default Auth;