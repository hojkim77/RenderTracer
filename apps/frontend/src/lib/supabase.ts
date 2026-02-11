import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// 커스텀 토큰 관리를 위해 persistSession 비활성화
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false, // 수동으로 토큰 갱신 관리
    persistSession: false, // Supabase 자동 저장 비활성화
    detectSessionInUrl: true,
  },
});

