import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Get social media analytics
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const platform = searchParams.get('platform')
    const dateFrom = searchParams.get('from')
    const dateTo = searchParams.get('to')
    const metric = searchParams.get('metric')

    // Build query
    let query = supabase
      .from('social_posts')
      .select(`
        *,
        article:articles(title, category),
        engagement:social_engagement(*),
        clicks:social_clicks(count)
      `)

    // Apply filters
    if (platform && platform !== 'all') {
      query = query.eq('platform', platform)
    }

    if (dateFrom) {
      query = query.gte('posted_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('posted_at', dateTo)
    }

    query = query.eq('status', 'posted')

    const { data: posts, error } = await query

    if (error) {
      throw error
    }

    // Calculate analytics
    const analytics = calculateAnalytics(posts || [], metric)

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}

/**
 * Get platform-specific analytics
 */
async function getPlatformAnalytics(platform: string) {
  const { data: posts, error } = await supabase
    .from('social_posts')
    .select(`
      *,
      engagement:social_engagement(*),
      clicks:social_clicks(count)
    `)
    .eq('platform', platform)
    .eq('status', 'posted')
    .gte('posted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

  if (error) {
    throw error
  }

  const totalPosts = posts?.length || 0
  const totalClicks = posts?.reduce((sum, post) => sum + (post.clicks?.[0]?.count || 0), 0) || 0
  const totalEngagement = posts?.reduce((sum, post) => {
    const eng = post.engagement?.[0] || {}
    return sum + (eng.likes || 0) + (eng.shares || 0) + (eng.comments || 0)
  }, 0) || 0

  const avgCtr = totalPosts > 0 ? (totalClicks / totalPosts) : 0
  const avgEngagement = totalPosts > 0 ? (totalEngagement / totalPosts) : 0

  return {
    platform,
    totalPosts,
    totalClicks,
    totalEngagement,
    avgCtr,
    avgEngagement,
    posts: posts?.map(post => ({
      id: post.id,
      posted_at: post.posted_at,
      clicks: post.clicks?.[0]?.count || 0,
      likes: post.engagement?.[0]?.likes || 0,
      shares: post.engagement?.[0]?.shares || 0,
      comments: post.engagement?.[0]?.comments || 0
    }))
  }
}

/**
 * Calculate analytics from posts data
 */
function calculateAnalytics(posts: any[], metric?: string | null) {
  const totalPosts = posts.length
  const successfulPosts = posts.filter(p => p.status === 'posted').length
  const failedPosts = posts.filter(p => p.status === 'failed').length
  
  // Calculate engagement metrics
  let totalClicks = 0
  let totalLikes = 0
  let totalShares = 0
  let totalComments = 0
  let totalViews = 0

  // Platform breakdown
  const platformStats: Record<string, any> = {}

  // Time-based analytics
  const hourlyStats: Record<number, number> = {}
  const dailyStats: Record<string, number> = {}

  // Category performance
  const categoryStats: Record<string, any> = {}

  posts.forEach(post => {
    // Aggregate engagement
    const clicks = post.clicks?.[0]?.count || 0
    const engagement = post.engagement?.[0] || {}
    
    totalClicks += clicks
    totalLikes += engagement.likes || 0
    totalShares += engagement.shares || 0
    totalComments += engagement.comments || 0
    totalViews += engagement.views || 0

    // Platform stats
    if (!platformStats[post.platform]) {
      platformStats[post.platform] = {
        posts: 0,
        clicks: 0,
        likes: 0,
        shares: 0,
        comments: 0
      }
    }
    platformStats[post.platform].posts++
    platformStats[post.platform].clicks += clicks
    platformStats[post.platform].likes += engagement.likes || 0
    platformStats[post.platform].shares += engagement.shares || 0
    platformStats[post.platform].comments += engagement.comments || 0

    // Time-based stats
    if (post.posted_at) {
      const date = new Date(post.posted_at)
      const hour = date.getHours()
      const day = date.toISOString().split('T')[0]
      
      hourlyStats[hour] = (hourlyStats[hour] || 0) + 1
      dailyStats[day] = (dailyStats[day] || 0) + 1
    }

    // Category stats
    const category = post.article?.category || 'unknown'
    if (!categoryStats[category]) {
      categoryStats[category] = {
        posts: 0,
        clicks: 0,
        engagement: 0
      }
    }
    categoryStats[category].posts++
    categoryStats[category].clicks += clicks
    categoryStats[category].engagement += (engagement.likes || 0) + (engagement.shares || 0) + (engagement.comments || 0)
  })

  // Calculate rates
  const avgCtr = totalPosts > 0 ? (totalClicks / totalPosts) : 0
  const avgEngagementRate = totalPosts > 0 ? 
    ((totalLikes + totalShares + totalComments) / totalPosts) : 0

  // Best performing posts
  const topPosts = posts
    .filter(p => p.status === 'posted')
    .map(post => ({
      id: post.id,
      title: post.article?.title || 'Unknown',
      platform: post.platform,
      clicks: post.clicks?.[0]?.count || 0,
      engagement: (post.engagement?.[0]?.likes || 0) + 
                  (post.engagement?.[0]?.shares || 0) + 
                  (post.engagement?.[0]?.comments || 0),
      ctr: post.clicks?.[0]?.count || 0,
      posted_at: post.posted_at
    }))
    .sort((a, b) => {
      if (metric === 'clicks') return b.clicks - a.clicks
      if (metric === 'engagement') return b.engagement - a.engagement
      return b.ctr - a.ctr
    })
    .slice(0, 10)

  return {
    summary: {
      totalPosts,
      successfulPosts,
      failedPosts,
      totalClicks,
      totalLikes,
      totalShares,
      totalComments,
      totalViews,
      avgCtr,
      avgEngagementRate
    },
    platformStats,
    hourlyStats,
    dailyStats,
    categoryStats,
    topPosts
  }
}