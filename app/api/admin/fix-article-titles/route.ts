import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

export const maxDuration = 300; // 5 minutes timeout

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting article title cleanup...')
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Check for admin authentication
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the user is authenticated
    const token = authorization.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }
    
    // Fetch all articles
    const { data: articles, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, slug')
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      throw new Error(`Failed to fetch articles: ${fetchError.message}`)
    }
    
    if (!articles || articles.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No articles found to fix' 
      })
    }
    
    console.log(`📋 Found ${articles.length} articles to check`)
    
    let fixedCount = 0
    const errors: any[] = []
    
    // Process each article
    for (const article of articles) {
      try {
        // Check if title starts with "Title:" or variations
        if (article.title && /^(title:|new title:)\s*/i.test(article.title)) {
          const oldTitle = article.title
          const newTitle = article.title.replace(/^(title:|new title:)\s*/i, '').trim()
          
          // Also update the slug if it contains "title-"
          let newSlug = article.slug
          if (article.slug && article.slug.includes('title-')) {
            // Generate new slug from cleaned title
            const baseSlug = newTitle
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim()
              .substring(0, 50)
            
            // Keep the timestamp suffix if it exists
            const timestampMatch = article.slug.match(/-(\d{6})$/)
            newSlug = timestampMatch 
              ? `${baseSlug}-${timestampMatch[1]}`
              : `${baseSlug}-${Date.now().toString().slice(-6)}`
          }
          
          // Update the article
          const { error: updateError } = await supabase
            .from('articles')
            .update({ 
              title: newTitle,
              slug: newSlug
            })
            .eq('id', article.id)
          
          if (updateError) {
            throw new Error(`Failed to update article ${article.id}: ${updateError.message}`)
          }
          
          console.log(`✅ Fixed article ${article.id}: "${oldTitle}" → "${newTitle}"`)
          if (newSlug !== article.slug) {
            console.log(`   Also updated slug: "${article.slug}" → "${newSlug}"`)
          }
          fixedCount++
        }
      } catch (error) {
        console.error(`❌ Error processing article ${article.id}:`, error)
        errors.push({
          articleId: article.id,
          title: article.title,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    console.log(`\n✨ Title cleanup complete!`)
    console.log(`📊 Fixed ${fixedCount} articles`)
    if (errors.length > 0) {
      console.log(`⚠️  ${errors.length} errors occurred`)
    }
    
    return NextResponse.json({
      success: true,
      totalArticles: articles.length,
      fixedCount,
      errors
    })
    
  } catch (error) {
    console.error('Title cleanup error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fix article titles', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}