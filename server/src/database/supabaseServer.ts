/**
 * DeepAstro Server Supabase Client
 * Authoritative interface to Supabase Auth and Database
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const fallbackUrl = 'https://bytufynvpwqhphoirxfo.supabase.co';
const fallbackKey = 'placeholder-service-key-for-offline-eval';

const supabaseUrl = process.env.SUPABASE_URL || fallbackUrl;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || fallbackKey;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[SupabaseServer] Warning: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment, initialized with fallback.');
}

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
