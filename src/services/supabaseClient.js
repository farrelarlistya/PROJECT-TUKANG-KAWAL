/**
 * supabaseClient.js — Singleton Supabase Client
 *
 * Satu instance untuk seluruh aplikasi.
 * Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY
 * sudah diisi di file .env sebelum menjalankan aplikasi.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum diisi di .env'
  );
} else {
  console.log('[Supabase] Client initialized with URL:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
