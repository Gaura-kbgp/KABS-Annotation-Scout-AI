import { createClient } from '@supabase/supabase-js';

// --- AWS MIGRATION CONFIGURATION ---

// 1. ENDPOINT
// This should point to your AWS EC2 Public IP or Domain.
// Example: 'http://54.123.45.67:8000' or 'https://api.yourdomain.com'
// 1. ENDPOINT
// Hardcoded to ensure connection works even if Vite env vars fail
const SUPABASE_URL = 'https://ecmltjcajtneflsyxuil.supabase.co';

// 2. API KEY (ANON)
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbWx0amNhanRuZWZsc3l4dWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NjA0OTksImV4cCI6MjA4NDEzNjQ5OX0.4A3grp4owhpGLXgYd4b_be5G1MnoQmoOrQ5EOiW4SGI';

// Safety Check & Fallback
// If credentials are missing, we use a placeholder to prevent the app from crashing on load.
// Calls will simply fail or log errors instead of breaking the entire UI.
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "⚠️ Supabase Credentials Missing! \n" +
    "Please create a .env file in the project root with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n" +
    "Refer to AWS_MIGRATION.md for details."
  );
}

// 3. INITIALIZE CLIENT
// We provide a fallback URL to satisfy the Supabase client constructor if env vars are missing.
const effectiveUrl = SUPABASE_URL || 'https://placeholder.supabase.co';
const effectiveKey = SUPABASE_ANON_KEY || 'placeholder-key';

console.log('🔌 Initializing Supabase Client...');
console.log('   URL:', effectiveUrl);
if (!SUPABASE_URL) console.error('   ❌ VITE_SUPABASE_URL is missing! Using placeholder.');
if (!SUPABASE_ANON_KEY) console.error('   ❌ VITE_SUPABASE_ANON_KEY is missing! Using placeholder.');

export const supabase = createClient(effectiveUrl, effectiveKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
