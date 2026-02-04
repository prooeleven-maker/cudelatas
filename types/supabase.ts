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
          last_ip: string | null
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
          last_ip?: string | null
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
          last_ip?: string | null
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
      admin_sessions: {
        Row: {
          id: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          token: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          token?: string
          expires_at?: string
          created_at?: string
        }
        Relationships: []
      }
      releases: {
        Row: {
          id: string
          channel: string
          version: string
          notes: string | null
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          channel: string
          version: string
          notes?: string | null
          file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          channel?: string
          version?: string
          notes?: string | null
          file_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      banned_hwids: {
        Row: {
          id: string
          hwid: string
          reason: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          hwid: string
          reason?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          hwid?: string
          reason?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      banned_ips: {
        Row: {
          id: string
          ip: string
          reason: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ip: string
          reason?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ip?: string
          reason?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      ban_audit: {
        Row: {
          id: string
          type: string
          value: string
          reason: string | null
          admin: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          value: string
          reason?: string | null
          admin?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          value?: string
          reason?: string | null
          admin?: string | null
          created_at?: string
        }
        Relationships: []
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
