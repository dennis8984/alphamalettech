import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Get recent social posts
    const { data: posts, error } = await supabase
      .from('social_posts')
      .select(`
        id,
        article_id,
        platform,
        status,
        posted_at,
        post_url,
        error_message,
        created_at,
        article:articles(title, slug)
      `)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      count: posts?.length || 0,
      posts: posts || [],
      platforms: {
        reddit: posts?.filter(p => p.platform === 'reddit').length || 0,
        facebook: posts?.filter(p => p.platform === 'facebook').length || 0,
        twitter: posts?.filter(p => p.platform === 'twitter').length || 0,
        instagram: posts?.filter(p => p.platform === 'instagram').length || 0
      },
      checked_at: new Date().toISOString()
    })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}