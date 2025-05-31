'use client'

// Client-side only Supabase configuration with validation
const getSupabaseConfig = () => {
  // Get environment variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('🔍 Environment variables loaded:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', envUrl)
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', envKey ? 'SET (hidden)' : 'NOT SET')
  
  // Use fallback values if env vars not set
  let url = envUrl || 'https://vopntrgtkefstqbzsmot.supabase.co'
  const key = envKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcG50cmd0a2Vmc3RxYnpzbW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1Njg1NzEsImV4cCI6MjA1MDE0NDU3MX0.gfhEDwJyMZmF6K63gPfhKvtJJ3l_K_hNHWQwJ0KRFcU'
  
  // Fix common URL issues
  if (url) {
    // Remove extra "db." prefix if present
    if (url.includes('db.vopntrgtkefstqbzsmot.supabase.co')) {
      console.log('🔧 Fixing URL: removing extra "db." prefix')
      url = url.replace('db.vopntrgtkefstqbzsmot.supabase.co', 'vopntrgtkefstqbzsmot.supabase.co')
    }
    
    // Auto-fix URL if missing protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      console.log('🔧 Auto-fixing URL by adding https://')
      url = `https://${url}`
    }
  }
  
  console.log('📝 Final URL to use:', url)
  
  // Validate URL format
  try {
    new URL(url)
    console.log('✅ Supabase URL is valid:', url)
  } catch (e) {
    console.error('❌ Invalid Supabase URL:', url)
    throw new Error(`Invalid Supabase URL: ${url}`)
  }
  
  return { url, key }
}

// Dynamic import to prevent SSR issues
let supabase: any = null

const getSupabaseClient = async () => {
  if (!supabase && typeof window !== 'undefined') {
    try {
      const { url, key } = getSupabaseConfig()
      console.log('🔧 Creating Supabase client with URL:', url)
      
      const { createClient } = await import('@supabase/supabase-js')
      supabase = createClient(url, key)
      
      console.log('✅ Supabase client created successfully')
    } catch (error) {
      console.error('❌ Failed to create Supabase client:', error)
      throw error
    }
  }
  return supabase
}

// Supabase Auth functions
export const signInWithEmail = async (email: string) => {
  try {
    console.log('🚀 Starting email sign-in for:', email)
    
    const client = await getSupabaseClient()
    if (!client) {
      const errorMsg = 'Supabase client not available'
      console.error('❌', errorMsg)
      return { data: null, error: { message: 'Authentication service not available' } }
    }
    
    console.log('📧 Sending magic link...')
    const { data, error } = await client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    })
    
    if (error) {
      console.error('❌ Supabase auth error:', error)
      return { data: null, error: { message: `Auth error: ${error.message}` } }
    }
    
    console.log('✅ Magic link sent successfully:', data)
    return { data, error: null }
  } catch (err) {
    console.error('💥 Unexpected error in signInWithEmail:', err)
    return { data: null, error: { message: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}` } }
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