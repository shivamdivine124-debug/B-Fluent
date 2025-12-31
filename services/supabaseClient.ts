import { createClient } from '@supabase/supabase-js';

// Accessing environment variables set in index.html or by the build tool
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// Robust check to determine if Supabase is actually configured with valid values
export const isSupabaseConfigured = 
  typeof SUPABASE_URL === 'string' && 
  SUPABASE_URL.length > 0 && 
  SUPABASE_URL.includes('supabase.co');

if (!isSupabaseConfigured) {
  console.warn("Supabase is not yet configured. Some features (Auth, Multiplayer, Progress) will be limited or disabled.");
}

// Fallback to a valid-format URL to prevent 'supabaseUrl is required' crash during app initialization
// The app checks 'isSupabaseConfigured' before using this client for actual data fetching
const urlToUse = isSupabaseConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co';
const keyToUse = isSupabaseConfigured ? SUPABASE_ANON_KEY : 'placeholder';

export const supabase = createClient(urlToUse, keyToUse);