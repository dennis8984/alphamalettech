import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { default_subreddit } = await request.json()
    
    if (!default_subreddit) {
      return NextResponse.json(
        { error: 'Default subreddit is required' },
        { status: 400 }
      )
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Get current credentials
    const { data: current } = await supabase
      .from('social_platforms')
      .select('credentials')
      .eq('platform', 'reddit')
      .single()
    
    if (!current) {
      return NextResponse.json(
        { error: 'Reddit platform not found' },
        { status: 404 }
      )
    }
    
    // Update credentials with default_subreddit
    const updatedCredentials = {
      ...current.credentials,
      default_subreddit
    }
    
    const { data, error } = await supabase
      .from('social_platforms')
      .update({
        credentials: updatedCredentials,
        updated_at: new Date().toISOString()
      })
      .eq('platform', 'reddit')
      .select()
      .single()
    
    if (error) {
      console.error('Update error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `Default subreddit set to: ${default_subreddit}`,
      data
    })
    
  } catch (error: any) {
    console.error('Error updating Reddit config:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}