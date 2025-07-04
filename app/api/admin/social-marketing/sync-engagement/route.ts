import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { socialAPIManager } from '@/lib/social-apis'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Check authentication
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { post_id } = await request.json()
    
    if (!post_id) {
      return NextResponse.json({ error: 'Missing post_id' }, { status: 400 })
    }

    // Get the post
    const { data: post, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', post_id)
      .single()

    if (error || !post || !post.post_id) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Get engagement metrics from platform
    const engagement = await socialAPIManager.getEngagement(post.platform, post.post_id)

    if (!engagement) {
      return NextResponse.json({ error: 'Failed to get engagement' }, { status: 500 })
    }

    // Update or create engagement record
    const { error: engagementError } = await supabase
      .from('social_engagement')
      .upsert({
        social_post_id: post_id,
        likes: engagement.likes,
        shares: engagement.shares,
        comments: engagement.comments,
        views: engagement.views,
        reach: engagement.reach,
        engagement_rate: engagement.engagement_rate || calculateEngagementRate(engagement),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'social_post_id'
      })

    if (engagementError) {
      throw engagementError
    }

    return NextResponse.json({ 
      success: true,
      engagement 
    })
  } catch (error) {
    console.error('Sync engagement error:', error)
    return NextResponse.json(
      { error: 'Failed to sync engagement' },
      { status: 500 }
    )
  }
}

function calculateEngagementRate(engagement: any): number {
  const totalEngagement = engagement.likes + engagement.shares + engagement.comments
  const totalReach = engagement.reach || engagement.views || 1
  return Number(((totalEngagement / totalReach) * 100).toFixed(2))
}