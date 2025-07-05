import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase config:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      })
      return NextResponse.json(
        { error: 'Server configuration error - check environment variables' },
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
    const body = await request.json()
    console.log('PUT /api/admin/social-marketing/credentials - Request body:', body)
    
    const { platform, credentials, is_active } = body
    
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
    const { data: existing, error: checkError } = await supabase
      .from('social_platforms')
      .select('id')
      .eq('platform', platform)
      .single()
    
    console.log(`Platform ${platform} exists:`, !!existing, 'Check error:', checkError?.message)
    
    let data, error
    
    if (existing && !checkError) {
      // Update existing platform
      console.log(`Updating existing platform ${platform}`)
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
      console.log(`Inserting new platform ${platform}`)
      const insertData = {
        platform,
        credentials,
        is_active: is_active !== undefined ? is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      console.log('Insert data:', insertData)
      
      const result = await supabase
        .from('social_platforms')
        .insert(insertData)
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