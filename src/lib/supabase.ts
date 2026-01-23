import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// URL 유효성 검사 함수
const isValidUrl = (urlString: string) => {
    try {
        return Boolean(new URL(urlString));
    } catch {
        return false;
    }
};

const isUrlValid = supabaseUrl && isValidUrl(supabaseUrl);
const isKeyValid = !!supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key';

export const isSupabaseConfigured = isUrlValid && isKeyValid;

if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase credentials not found or invalid. Please verify your .env file.');
}

// URL이 유효하지 않으면 더미 URL을 사용하여 크래시 방지
export const supabase = createClient(
    isUrlValid ? supabaseUrl : 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);
