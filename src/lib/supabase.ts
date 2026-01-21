import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

/**
 * Supabase 클라이언트 객체
 * 
 * 데이터베이스 CRUD 및 인증 기능에 사용됩니다.
 */
export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
