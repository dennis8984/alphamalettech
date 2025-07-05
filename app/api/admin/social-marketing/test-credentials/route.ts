import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { socialAPIManager } from '@/lib/social-apis'

export async function POST(request: NextRequest) {
  try {
    const { platform } = await request.json()
    
    if (!platform) {
      return NextResponse.json(
        { success: false, error: 'Platform is required' },
        { status: 400 }
      )
    }
    
    // Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get platform credentials
    const { data: platformData, error: fetchError } = await supabase
      .from('social_platforms')
      .select('*')
      .eq('platform', platform)
      .single()
    
    if (fetchError || !platformData) {
      return NextResponse.json(
        { success: false, error: 'Platform not found' },
        { status: 404 }
      )
    }
    
    if (!platformData.credentials || Object.keys(platformData.credentials).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No credentials configured' },
        { status: 400 }
      )
    }
    
    // Test the credentials
    try {
      const initialized = await socialAPIManager.initializePlatform(platform)
      
      if (!initialized) {
        return NextResponse.json({
          success: false,
          error: 'Failed to validate credentials'
        })
      }
      
      // Try to get rate limit info as additional validation
      const rateLimits = await socialAPIManager.getAllRateLimits()
      const platformLimit = rateLimits[platform]
      
      return NextResponse.json({
        success: true,
        message: `${platform} credentials are valid`,
        rateLimit: platformLimit && !platformLimit.error ? {
          remaining: platformLimit.remaining,
          reset: platformLimit.reset
        } : null
      })
      
    } catch (error: any) {
      console.error(`Error testing ${platform} credentials:`, error)
      
      // Parse error message for more specific feedback
      let errorMessage = 'Invalid credentials'
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorMessage = 'Invalid API credentials'
      } else if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        errorMessage = 'Access forbidden - check permissions'
      } else if (error.message?.includes('404')) {
        errorMessage = 'Invalid account ID or endpoint'
      } else if (error.message?.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage
      })
    }
    
  } catch (error: any) {
    console.error('Error in test-credentials route:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}