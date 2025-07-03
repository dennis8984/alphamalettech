import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { clearArticlesCache } from '@/lib/data'

export async function POST() {
  try {
    console.log('🔧 Starting domain link fix...')
    
    // Fetch all published articles
    const { data: articles, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, content')
      .eq('status', 'published')
    
    if (fetchError || !articles) {
      console.error('❌ Failed to fetch articles:', fetchError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch articles',
        details: fetchError
      }, { status: 500 })
    }
    
    console.log(`📝 Found ${articles.length} articles to check`)
    
    const results = []
    let fixedCount = 0
    
    // Process each article
    for (const article of articles) {
      let updatedContent = article.content
      let wasModified = false
      
      // Fix menshub.com to menshb.com
      if (updatedContent.includes('menshub.com')) {
        updatedContent = updatedContent.replace(/menshub\.com/gi, 'menshb.com')
        wasModified = true
      }
      
      // Also ensure Men's Health is replaced with Men's Hub
      if (updatedContent.includes("Men's Health")) {
        updatedContent = updatedContent.replace(/Men's Health/gi, "Men's Hub")
        wasModified = true
      }
      
      if (wasModified) {
        // Update the article
        const { error: updateError } = await supabase
          .from('articles')
          .update({ content: updatedContent })
          .eq('id', article.id)
        
        if (updateError) {
          console.error(`❌ Failed to update article ${article.id}:`, updateError)
          results.push({
            id: article.id,
            title: article.title,
            status: 'error',
            error: updateError.message
          })
        } else {
          console.log(`✅ Fixed domain links in: ${article.title}`)
          fixedCount++
          results.push({
            id: article.id,
            title: article.title,
            status: 'fixed'
          })
        }
      } else {
        results.push({
          id: article.id,
          title: article.title,
          status: 'no_changes'
        })
      }
    }
    
    // Clear cache to reflect changes
    if (fixedCount > 0) {
      clearArticlesCache()
    }
    
    console.log(`✅ Domain fix complete: ${fixedCount} articles updated`)
    
    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} articles with incorrect domain links`,
      totalChecked: articles.length,
      fixedCount,
      results
    })
    
  } catch (error) {
    console.error('💥 Domain fix error:', error)
    return NextResponse.json({
      success: false,
      error: 'Domain fix failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}