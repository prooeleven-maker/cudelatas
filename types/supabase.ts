export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      license_keys: {
        Row: {
          id: string
          key_hash: string
          is_active: boolean
          created_at: string
          expires_at: string | null
          last_used_at: string | null
          created_by: string | null
          username: string | null
          password_hash: string | null
          hwid: string | null
          is_registered: boolean
        }
        Insert: {
          id?: string
          key_hash: string
          is_active?: boolean
          created_at?: string
          expires_at?: string | null
          last_used_at?: string | null
          created_by?: string | null
          username?: string | null
          password_hash?: string | null
          hwid?: string | null
          is_registered?: boolean
        }
        Update: {
          id?: string
          key_hash?: string
          is_active?: boolean
          created_at?: string
          expires_at?: string | null
          last_used_at?: string | null
          created_by?: string | null
          username?: string | null
          password_hash?: string | null
          hwid?: string | null
          is_registered?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "license_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
