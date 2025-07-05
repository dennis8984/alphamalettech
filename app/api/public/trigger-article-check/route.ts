import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Get recent published articles that haven't been posted
    const { data: articles } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(5)
    
    if (!articles || articles.length === 0) {
      return NextResponse.json({
        message: 'No published articles found',
        count: 0
      })
    }
    
    // Check which ones already have Reddit posts
    const { data: existingPosts } = await supabase
      .from('social_posts')
      .select('article_id')
      .eq('platform', 'reddit')
      .in('article_id', articles.map(a => a.id))
    
    const postedArticleIds = existingPosts?.map(p => p.article_id) || []
    const articlesToPost = articles.filter(a => !postedArticleIds.includes(a.id))
    
    if (articlesToPost.length === 0) {
      return NextResponse.json({
        message: 'All recent articles have already been posted',
        checked: articles.length,
        alreadyPosted: postedArticleIds.length
      })
    }
    
    // Create social posts for articles that need posting
    const newPosts = []
    for (const article of articlesToPost) {
      // Create Reddit-friendly content
      const title = article.title.substring(0, 300) // Reddit title limit
      const excerpt = article.excerpt || article.content.substring(0, 200) + '...'
      const link = `https://www.menshb.com/articles/${article.slug}`
      
      const content = `${excerpt}\n\nRead more: ${link}`
      
      // Get Reddit credentials
      const { data: redditPlatform } = await supabase
        .from('social_platforms')
        .select('credentials')
        .eq('platform', 'reddit')
        .single()
      
      const subreddit = redditPlatform?.credentials?.default_subreddit || 'MensHB'
      
      // Create post record
      const { data: post, error } = await supabase
        .from('social_posts')
        .insert({
          article_id: article.id,
          platform: 'reddit',
          content: content,
          media_urls: article.featured_image ? [article.featured_image] : [],
          hashtags: article.tags || [],
          status: 'pending',
          scheduled_for: new Date().toISOString()
        })
        .select()
        .single()
      
      if (!error && post) {
        newPosts.push(post)
        
        // Actually post to Reddit
        try {
          const postResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.menshb.com'}/api/public/post-to-reddit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              post_id: post.id,
              title: title,
              content: content,
              subreddit: subreddit
            })
          })
          
          const result = await postResponse.json()
          console.log(`Posted article "${article.title}" to Reddit:`, result)
          
        } catch (postError) {
          console.error('Error posting to Reddit:', postError)
        }
      }
    }
    
    return NextResponse.json({
      message: `Created ${newPosts.length} new social posts`,
      articlesChecked: articles.length,
      alreadyPosted: postedArticleIds.length,
      newPosts: newPosts.length,
      posts: newPosts
    })
    
  } catch (error: any) {
    console.error('Error in trigger check:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}