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
    
    const { data, error } = await supabase
      .from('social_platforms')
      .select('*')
      .order('platform')
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ platforms: data })
    
  } catch (error: any) {
    console.error('Error fetching credentials:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { platform, credentials, is_active } = await request.json()
    
    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      )
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // First check if the platform exists
    const { data: existing } = await supabase
      .from('social_platforms')
      .select('id')
      .eq('platform', platform)
      .single()
    
    let data, error
    
    if (existing) {
      // Update existing platform
      const result = await supabase
        .from('social_platforms')
        .update({
          credentials,
          is_active: is_active !== undefined ? is_active : true,
          updated_at: new Date().toISOString()
        })
        .eq('platform', platform)
        .select()
        .single()
      
      data = result.data
      error = result.error
    } else {
      // Insert new platform
      const result = await supabase
        .from('social_platforms')
        .insert({
          platform,
          credentials,
          is_active: is_active !== undefined ? is_active : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      data = result.data
      error = result.error
    }
    
    if (error) {
      console.error(`Error saving credentials for ${platform}:`, error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      platform: data
    })
    
  } catch (error: any) {
    console.error('Error updating credentials:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}