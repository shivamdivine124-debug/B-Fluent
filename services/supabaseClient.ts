import { createClient } from '@supabase/supabase-js';

// Accessing environment variables set in index.html or by the build tool
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = SUPABASE_URL.includes('supabase.co');

if (!isSupabaseConfigured) {
  console.warn("Supabase is not yet configured. Some features may be limited.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);