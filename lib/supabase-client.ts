import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vopntrgtkefstqbzsmot.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcG50cmd0a2Vmc3RxYnpzbW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1Njg1NzEsImV4cCI6MjA1MDE0NDU3MX0.gfhEDwJyMZmF6K63gPfhKvtJJ3l_K_hNHWQwJ0KRFcU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const subscribeToNewsletter = async (name: string, email: string) => {
  try {
    // Send magic link for authentication
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?welcome=true`,
        data: {
          name: name,
          newsletter_signup: true
        }
      }
    })

    if (authError) {
      console.error('Magic link error:', authError)
      return { success: false, error: authError.message }
    }

    return { 
      success: true, 
      message: 'Check your email for a magic link to complete your signup and join the community!' 
    }

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return { 
      success: false, 
      error: 'Something went wrong. Please try again.' 
    }
  }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
} 