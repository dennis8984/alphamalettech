import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Simple credentials save - Request:', JSON.stringify(body, null, 2))
    
    const { platform, credentials } = body
    
    if (!platform || !credentials) {
      return NextResponse.json(
        { error: 'Platform and credentials are required' },
        { status: 400 }
      )
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // First, try to insert
    const { data: insertData, error: insertError } = await supabase
      .from('social_platforms')
      .insert({
        platform,
        credentials,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (!insertError) {
      console.log('Successfully inserted new platform:', platform)
      return NextResponse.json({ 
        success: true,
        message: 'Credentials saved successfully',
        data: insertData
      })
    }
    
    // If insert failed due to unique constraint, try update
    if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
      console.log('Platform exists, updating:', platform)
      
      const { data: updateData, error: updateError } = await supabase
        .from('social_platforms')
        .update({
          credentials,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('platform', platform)
        .select()
        .single()
      
      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json(
          { error: `Update failed: ${updateError.message}` },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Credentials updated successfully',
        data: updateData
      })
    }
    
    // Other insert error
    console.error('Insert error:', insertError)
    return NextResponse.json(
      { error: `Save failed: ${insertError.message}` },
      { status: 500 }
    )
    
  } catch (error: any) {
    console.error('Unexpected error in simple credentials save:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}