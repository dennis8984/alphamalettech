import { createClient } from '@supabase/supabase-js'
import { saveNewsletterSubscriber } from './supabase-database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials! Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.')
  throw new Error('Missing Supabase configuration')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

type SubscriptionResult = 
  | { success: true; message: string }
  | { success: false; error: string }

export const subscribeToNewsletter = async (name: string, email: string): Promise<SubscriptionResult> => {
  try {
    // First, save the subscriber to the database
    const saveResult = await saveNewsletterSubscriber(name, email)
    
    if (!saveResult.success) {
      return { success: false, error: saveResult.error || 'Failed to save subscription' }
    }

    // Then send magic link for authentication
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
      message: 'Successfully subscribed to newsletter! Check your email for a magic link to complete your signup and join the community!' 
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