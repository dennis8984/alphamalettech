import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Use public Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Missing configuration' },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Simple direct query
    const { data, error } = await supabase
      .from('social_platforms')
      .select('*')
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      platforms: data || [],
      count: data?.length || 0,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    )
  }
}