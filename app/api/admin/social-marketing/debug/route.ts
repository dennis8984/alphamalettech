import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get all platforms
    const { data: platforms, error } = await supabase
      .from('social_platforms')
      .select('*')
      .order('platform')
    
    if (error) {
      return NextResponse.json({
        error: error.message,
        details: error
      }, { status: 500 })
    }
    
    // Format the response for debugging
    const debug = {
      timestamp: new Date().toISOString(),
      platformCount: platforms?.length || 0,
      platforms: platforms?.map(p => ({
        platform: p.platform,
        is_active: p.is_active,
        hasCredentials: !!p.credentials && Object.keys(p.credentials).length > 0,
        credentialKeys: p.credentials ? Object.keys(p.credentials) : [],
        created_at: p.created_at,
        updated_at: p.updated_at
      })),
      rawData: platforms
    }
    
    return NextResponse.json(debug, {
      headers: {
        'Cache-Control': 'no-store'
      }
    })
    
  } catch (error: any) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        stack: error.stack
      },
      { status: 500 }
    )
  }
}