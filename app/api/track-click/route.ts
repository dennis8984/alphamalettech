import { NextRequest, NextResponse } from 'next/server'
import { trackKeywordClick } from '@/lib/supabase-keywords'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keywordId, articleId } = body

    if (!keywordId || !articleId) {
      return NextResponse.json(
        { error: 'Missing required fields: keywordId, articleId' },
        { status: 400 }
      )
    }

    // Extract metadata from request
    const ip_address = request.ip || 
      request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      'unknown'
    
    const user_agent = request.headers.get('user-agent') || 'unknown'
    const referrer = request.headers.get('referer') || ''

    // Track the click
    const result = await trackKeywordClick(keywordId, articleId, {
      ip_address,
      user_agent,
      referrer,
      revenue: 0 // Will be updated when actual conversion happens
    })

    if (result.success) {
      console.log(`📊 Tracked click: keyword=${keywordId}, article=${articleId}, ip=${ip_address}`)
      
      return NextResponse.json({ 
        success: true,
        message: 'Click tracked successfully'
      })
    } else {
      console.error('❌ Failed to track click:', result.error)
      
      return NextResponse.json(
        { error: result.error || 'Failed to track click' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Error in track-click API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
} 