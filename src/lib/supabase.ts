import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      entries: {
        Row: {
          id: string
          created_at: string
          content: string
          location: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          location?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          location?: string | null
          user_id?: string
        }
      }
      photos: {
        Row: {
          id: string
          entry_id: string
          file_path: string
          created_at: string
        }
        Insert: {
          id?: string
          entry_id: string
          file_path: string
          created_at?: string
        }
        Update: {
          id?: string
          entry_id?: string
          file_path?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}