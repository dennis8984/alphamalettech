import { supabase } from './supabase-client'

// Types
export interface Comment {
  id: string
  article_id: string
  user_id: string
  user_email: string
  user_name: string
  content: string
  created_at: string
  updated_at: string
}

export interface NewsletterSubscriber {
  id: string
  name: string
  email: string
  subscribed_at: string
  is_active: boolean
}

// Comments Database Functions
export const createComment = async (
  articleId: string, 
  content: string, 
  userEmail: string, 
  userName: string
): Promise<{ success: boolean; comment?: Comment; error?: string }> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          article_id: articleId,
          user_id: user.id,
          user_email: userEmail,
          user_name: userName,
          content: content.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Comment creation error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, comment: data }
  } catch (error) {
    console.error('Unexpected comment error:', error)
    return { success: false, error: 'Failed to post comment' }
  }
}

export const getComments = async (
  articleId: string
): Promise<{ success: boolean; comments?: Comment[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', articleId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Comments fetch error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, comments: data || [] }
  } catch (error) {
    console.error('Unexpected comments fetch error:', error)
    return { success: false, error: 'Failed to load comments' }
  }
}

// Newsletter Database Functions
export const saveNewsletterSubscriber = async (
  name: string, 
  email: string
): Promise<{ success: boolean; subscriber?: NewsletterSubscriber; error?: string }> => {
  try {
    // Check if subscriber already exists
    const { data: existingSubscriber } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email)
      .single()

    if (existingSubscriber) {
      return { success: false, error: 'Email already subscribed' }
    }

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subscribed_at: new Date().toISOString(),
          is_active: true
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Newsletter subscription error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, subscriber: data }
  } catch (error) {
    console.error('Unexpected newsletter error:', error)
    return { success: false, error: 'Failed to subscribe to newsletter' }
  }
}

export const getNewsletterSubscribers = async (): Promise<{
  success: boolean
  subscribers?: NewsletterSubscriber[]
  error?: string
}> => {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('is_active', true)
      .order('subscribed_at', { ascending: false })

    if (error) {
      console.error('Newsletter subscribers fetch error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, subscribers: data || [] }
  } catch (error) {
    console.error('Unexpected newsletter fetch error:', error)
    return { success: false, error: 'Failed to load subscribers' }
  }
}

// User Profile Functions
export const updateUserProfile = async (
  name: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { error } = await supabase.auth.updateUser({
      data: { name: name.trim() }
    })

    if (error) {
      console.error('Profile update error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected profile update error:', error)
    return { success: false, error: 'Failed to update profile' }
  }
} 