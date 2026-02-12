import { createServerSupabaseClient } from './supabase-server';
import type { User } from '@supabase/supabase-js';

/**
 * 서버 사이드에서 Authorization 헤더로부터 사용자 정보 가져오기
 */
export async function getServerUser(authHeader: string | null): Promise<{ user: User; supabase: ReturnType<typeof createServerSupabaseClient> } | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const supabase = createServerSupabaseClient();

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return { user, supabase };
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
}

