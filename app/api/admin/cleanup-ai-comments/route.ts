import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { clearArticlesCache } from '@/lib/data'

export async function POST() {
  try {
    console.log('🧹 Starting cleanup of AI comments from articles...')
    
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
    let cleanedCount = 0
    
    // AI comment patterns to remove
    const aiCommentPatterns = [
      /Here is the article with strategic H2 headings added[:\s]*/gi,
      /Here is the improved content[:\s]*/gi,
      /Here is the rewritten article[:\s]*/gi,
      /I've added headings[^.]*\./gi,
      /I've improved the readability[^.]*\./gi,
      /I've rewritten[^.]*\./gi,
      /The following is[^:]*:/gi,
      /Below is the[^:]*:/gi,
      /Here's the[^:]*:/gi,
      /^Here is[^:]*:/gim,
      /^I have[^:]*:/gim,
      /^I've[^:]*:/gim,
      /^The article has been[^.]*\./gim,
      /^This article has been[^.]*\./gim,
      /^I can[^.]*\./gim,
      /^Let me[^.]*\./gim
    ]
    
    // Process each article
    for (const article of articles) {
      let cleanedContent = article.content
      let wasModified = false
      
      // Check and remove AI comments
      for (const pattern of aiCommentPatterns) {
        const originalContent = cleanedContent
        cleanedContent = cleanedContent.replace(pattern, '')
        
        if (originalContent !== cleanedContent) {
          wasModified = true
        }
      }
      
      // Also clean up any double spaces or extra line breaks left behind
      if (wasModified) {
        cleanedContent = cleanedContent
          .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove triple+ line breaks
          .replace(/^\s+/gm, '') // Remove leading spaces from lines
          .trim()
        
        // Update the article
        const { error: updateError } = await supabase
          .from('articles')
          .update({ content: cleanedContent })
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
          console.log(`✅ Cleaned article: ${article.title}`)
          cleanedCount++
          results.push({
            id: article.id,
            title: article.title,
            status: 'cleaned'
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
    if (cleanedCount > 0) {
      clearArticlesCache()
    }
    
    console.log(`✅ Cleanup complete: ${cleanedCount} articles cleaned`)
    
    return NextResponse.json({
      success: true,
      message: `Cleaned ${cleanedCount} articles`,
      totalChecked: articles.length,
      cleanedCount,
      results
    })
    
  } catch (error) {
    console.error('💥 Cleanup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Cleanup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}