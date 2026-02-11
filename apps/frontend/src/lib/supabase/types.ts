// Supabase Database 타입 정의
// 실제 사용 시 Supabase CLI로 생성: npx supabase gen types typescript --project-id <project-id> > src/lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      analysis_jobs: {
        Row: {
          id: string;
          user_id: string;
          repository_url: string;
          branch: string | null;
          commit_hash: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          progress: number | null;
          error: string | null;
          created_at: string;
          completed_at: string | null;
          graph_data_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          repository_url: string;
          branch?: string | null;
          commit_hash?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          progress?: number | null;
          error?: string | null;
          created_at?: string;
          completed_at?: string | null;
          graph_data_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          repository_url?: string;
          branch?: string | null;
          commit_hash?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          progress?: number | null;
          error?: string | null;
          created_at?: string;
          completed_at?: string | null;
          graph_data_id?: string | null;
        };
      };
      graph_data: {
        Row: {
          id: string;
          job_id: string;
          data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          data: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          data?: Json;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

