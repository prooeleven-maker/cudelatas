import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

let browserClient: SupabaseClient<Database> | null = null

/**
 * Public / client-safe Supabase client (ANON KEY)
 */
export function getClientSupabase(): SupabaseClient<Database> | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.error('Supabase public env vars are missing.')
    }
    return null
  }

  // Server: always create a new instance
  if (typeof window === 'undefined') {
    return createClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  // Browser: reuse singleton
  if (!browserClient) {
    browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return browserClient
}

/**
 * Admin Supabase client (SERVICE ROLE) – SERVER ONLY
 */
export function getSupabaseAdmin(): SupabaseClient<Database> | null {
  // HARD BLOCK on browser
  if (typeof window !== 'undefined') {
    return null
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase admin env vars are missing.')
    return null
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey)
}