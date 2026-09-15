/**
 * DeepAstro Client Supabase Integration
 * Handles browser-side session lifecycle, Google OAuth redirects, and token management
 */

import { createClient } from '@supabase/supabase-js';

const fallbackUrl = 'https://bytufynvpwqhphoirxfo.supabase.co';
const fallbackAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dHVmeW52cHdxaHBob2lyeGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1Nzc0MTMsImV4cCI6MjEwNDE1MzQxM30.7vn8Hln86t9_7npmFArUbSFDqNKYtBecp1Jv-gCl9fg';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
