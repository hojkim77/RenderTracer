import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(supabaseUrl: string, supabaseKey: string) {
  return createClient(supabaseUrl, supabaseKey);
}

