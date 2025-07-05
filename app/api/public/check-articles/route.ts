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
    
    // Get recent published articles
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, slug, status, published_at, created_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(5)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Check which ones have been posted to social media
    const articleIds = articles?.map(a => a.id) || []
    const { data: socialPosts } = await supabase
      .from('social_posts')
      .select('article_id, platform, status, posted_at')
      .in('article_id', articleIds)
      .eq('platform', 'reddit')
    
    // Map social posts to articles
    const articlesWithPosts = articles?.map(article => ({
      ...article,
      reddit_post: socialPosts?.find(p => p.article_id === article.id),
      needs_posting: !socialPosts?.some(p => p.article_id === article.id)
    }))
    
    return NextResponse.json({
      count: articles?.length || 0,
      articles: articlesWithPosts || [],
      checked_at: new Date().toISOString()
    })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}