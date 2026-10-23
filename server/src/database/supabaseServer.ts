/**
 * DeepAstro Server Supabase Client
 * Authoritative interface to Supabase Auth and Database
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { evaluateIsolationPolicy, isProductionTarget } from '../config/isolationGuard.js';

const isolation = evaluateIsolationPolicy(process.env.SUPABASE_URL, process.env);
const isBlocked = !isolation.isAllowed || isolation.mode === 'blocked' || (isolation.environment !== 'production' && isProductionTarget(process.env.SUPABASE_URL));

const fallbackUrl = 'https://bytufynvpwqhphoirxfo.supabase.co';
const fallbackKey = 'placeholder-service-key-for-offline-eval';

const supabaseUrl = isBlocked
  ? 'http://127.0.0.1:54321'
  : (process.env.SUPABASE_URL || fallbackUrl);

const supabaseServiceKey = isBlocked
  ? 'placeholder-isolated-key-for-non-production'
  : (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || fallbackKey);

if (isBlocked) {
  console.warn(`[SupabaseServerIsolation] Blocked production Supabase service-role in ${isolation.environment} mode.`);
} else if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[SupabaseServer] Warning: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment, initialized with fallback.');
}

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
