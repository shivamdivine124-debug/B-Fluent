import { createClient } from '@supabase/supabase-js';

// Helper to safely access process.env without crashing in browsers without polyfills
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
  } catch (e) {
    return undefined;
  }
};

// Supabase Credentials
const SUPABASE_URL = getEnv('SUPABASE_URL') || 'https://tydbsxzcpeabmmppjuut.supabase.co';
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY') || 'sb_publishable_TcjSCNPiGy5uR4JArhAF1Q_DDErNWUP';

export const isSupabaseConfigured = SUPABASE_URL !== 'https://placeholder.supabase.co';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);