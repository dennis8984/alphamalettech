'use client'

// Client-side only Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vopntrgtkefstqbzsmot.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcG50cmd0a2Vmc3RxYnpzbW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1Njg1NzEsImV4cCI6MjA1MDE0NDU3MX0.gfhEDwJyMZmF6K63gPfhKvtJJ3l_K_hNHWQwJ0KRFcU'

// Dynamic import to prevent SSR issues
let supabase: any = null

const getSupabaseClient = async () => {
  if (!supabase && typeof window !== 'undefined') {
    const { createClient } = await import('@supabase/supabase-js')
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabase
}

// Supabase Auth functions
export const signInWithEmail = async (email: string) => {
  try {
    const client = await getSupabaseClient()
    if (!client) {
      console.error('Supabase client not available')
      return { data: null, error: { message: 'Authentication service not available' } }
    }
    
    console.log('Attempting to sign in with:', email)
    console.log('Using Supabase URL:', supabaseUrl)
    
    const { data, error } = await client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    })
    
    if (error) {
      console.error('Supabase auth error:', error)
      return { data: null, error: { message: `Auth error: ${error.message}` } }
    }
    
    console.log('Auth success:', data)
    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { data: null, error: { message: 'Unexpected error occurred' } }
  }
}

export const signOut = async () => {
  try {
    const client = await getSupabaseClient()
    if (!client) return { error: { message: 'Client not available' } }
    
    const { error } = await client.auth.signOut()
    return { error }
  } catch (err) {
    console.error('Sign out error:', err)
    return { error: { message: 'Sign out failed' } }
  }
}

export const getCurrentUser = async () => {
  try {
    const client = await getSupabaseClient()
    if (!client) return { user: null, error: { message: 'Client not available' } }
    
    const { data: { user }, error } = await client.auth.getUser()
    return { user, error }
  } catch (err) {
    console.error('Get user error:', err)
    return { user: null, error: { message: 'Failed to get user' } }
  }
} 