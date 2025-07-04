import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Handle social media click tracking
 * GET /api/track/social?c=shortcode
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const shortCode = searchParams.get('c')
    
    if (!shortCode) {
      return NextResponse.json({ error: 'Missing tracking code' }, { status: 400 })
    }

    // Get headers for tracking info
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || ''
    const referrer = headersList.get('referer') || ''
    const ip = headersList.get('x-forwarded-for') || 
                headersList.get('x-real-ip') || 
                'unknown'

    // Parse user agent for device info
    const deviceInfo = parseUserAgent(userAgent)

    // Find the social post by short code
    const { data: socialPost, error: postError } = await supabase
      .from('social_posts')
      .select('id, article_id')
      .eq('short_url', shortCode)
      .single()

    if (postError || !socialPost) {
      console.error('Social post not found:', shortCode)
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Record the click
    const { error: clickError } = await supabase
      .from('social_clicks')
      .insert({
        social_post_id: socialPost.id,
        short_code: shortCode,
        ip_address: ip.split(',')[0].trim(), // Get first IP if multiple
        user_agent: userAgent,
        referrer: referrer,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        // Country and city would be determined by IP geolocation service
        country: null,
        city: null
      })

    if (clickError) {
      console.error('Error recording click:', clickError)
    }

    // Get the article URL
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('slug')
      .eq('id', socialPost.article_id)
      .single()

    if (articleError || !article) {
      console.error('Article not found:', socialPost.article_id)
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Redirect to the article
    const articleUrl = new URL(`/articles/${article.slug}`, request.url)
    
    // Add UTM parameters for analytics
    articleUrl.searchParams.set('utm_source', 'social')
    articleUrl.searchParams.set('utm_medium', shortCode)
    articleUrl.searchParams.set('utm_campaign', 'social_marketing')

    return NextResponse.redirect(articleUrl)
  } catch (error) {
    console.error('Click tracking error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}

/**
 * Generate short URL for social posts
 * POST /api/track/social
 */
export async function POST(request: NextRequest) {
  try {
    const { social_post_id, article_slug } = await request.json()
    
    if (!social_post_id || !article_slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate unique short code
    const shortCode = generateShortCode()
    
    // Update social post with short URL
    const { error } = await supabase
      .from('social_posts')
      .update({ short_url: shortCode })
      .eq('id', social_post_id)

    if (error) {
      throw error
    }

    // Return the tracking URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.menshb.com'
    const trackingUrl = `${baseUrl}/api/track/social?c=${shortCode}`

    return NextResponse.json({
      success: true,
      short_url: trackingUrl,
      short_code: shortCode
    })
  } catch (error) {
    console.error('Short URL generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate tracking URL' },
      { status: 500 }
    )
  }
}

/**
 * Get click analytics
 * GET /api/track/social/analytics?post_id=xxx
 */
export async function getAnalytics(postId: string) {
  try {
    // Get total clicks
    const { count: totalClicks } = await supabase
      .from('social_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('social_post_id', postId)

    // Get clicks by device type
    const { data: deviceStats } = await supabase
      .from('social_clicks')
      .select('device_type')
      .eq('social_post_id', postId)

    // Get clicks by time
    const { data: timeStats } = await supabase
      .from('social_clicks')
      .select('clicked_at')
      .eq('social_post_id', postId)
      .order('clicked_at', { ascending: true })

    // Process device stats
    const deviceCounts = deviceStats?.reduce((acc: any, click) => {
      acc[click.device_type || 'unknown'] = (acc[click.device_type || 'unknown'] || 0) + 1
      return acc
    }, {})

    // Process hourly stats
    const hourlyCounts = timeStats?.reduce((acc: any, click) => {
      const hour = new Date(click.clicked_at).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})

    return {
      total_clicks: totalClicks || 0,
      device_breakdown: deviceCounts || {},
      hourly_breakdown: hourlyCounts || {},
      last_click: timeStats?.[timeStats.length - 1]?.clicked_at || null
    }
  } catch (error) {
    console.error('Analytics error:', error)
    return null
  }
}

/**
 * Generate unique short code
 */
function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return code
}

/**
 * Parse user agent for device information
 */
function parseUserAgent(userAgent: string): {
  deviceType: string
  browser: string
  os: string
} {
  const ua = userAgent.toLowerCase()
  
  // Detect device type
  let deviceType = 'desktop'
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
    deviceType = 'mobile'
  } else if (/ipad|tablet|kindle/i.test(ua)) {
    deviceType = 'tablet'
  }
  
  // Detect browser
  let browser = 'unknown'
  if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('safari')) browser = 'Safari'
  else if (ua.includes('edge')) browser = 'Edge'
  else if (ua.includes('opera')) browser = 'Opera'
  
  // Detect OS
  let os = 'unknown'
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'
  
  return { deviceType, browser, os }
}