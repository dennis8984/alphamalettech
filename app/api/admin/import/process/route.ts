import { NextRequest, NextResponse } from 'next/server'
import { createArticle } from '@/lib/articles-db'
import { clearArticlesCache } from '@/lib/data'
import { ContentEnhancer } from '@/lib/content-enhancer'

interface ImportArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  category: string
  author: string
  date: string
  featured: boolean
  trending: boolean
}

interface ImportResult {
  articleId: string
  title: string
  status: 'success' | 'error' | 'timeout'
  error?: string
  wordCount?: number
  readabilityScore?: number
  warnings?: string[]
}

interface BatchResponse {
  success: boolean
  batch: number
  totalBatches: number
  results: {
    total: number
    processed: number
    imported: number
    failed: number
    timedOut: number
    details: ImportResult[]
  }
  isComplete: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { articles, batchSize = 3, batchIndex = 0, totalArticles } = await request.json()
    
    if (!articles || !Array.isArray(articles)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Frontend now sends only the articles for this batch
    const currentBatch = articles
    const actualTotalArticles = totalArticles || articles.length
    const totalBatches = Math.ceil(actualTotalArticles / batchSize)

    console.log(`🔄 Processing batch ${batchIndex + 1}/${totalBatches} (${currentBatch.length} articles)`)
    console.log(`📊 Processing ${currentBatch.length} articles in this batch`)
    
    const results: ImportResult[] = []
    let successCount = 0
    let errorCount = 0
    let timeoutCount = 0

    // Set a timeout for the entire batch (8 seconds to stay under Vercel's 10s limit)
    const BATCH_TIMEOUT = 8000
    const batchStartTime = Date.now()

    // Process each article in the current batch
    for (const article of currentBatch) {
      // Check if we're approaching timeout
      const elapsedTime = Date.now() - batchStartTime
      if (elapsedTime > BATCH_TIMEOUT - 1000) { // Leave 1s buffer
        console.log(`⏰ Batch approaching timeout, stopping processing`)
        results.push({
          articleId: article.id,
          title: article.title,
          status: 'timeout',
          error: 'Batch timeout - please retry with smaller batch size'
        })
        timeoutCount++
        continue
      }

      try {
        console.log(`🔄 Processing article: "${article.title}"`)
        
        const articleStartTime = Date.now()
        
        // Simplified processing without content enhancement (for faster imports)
        console.log(`📝 Processing: ${article.title}`)
        
        // Use original content without enhancement to avoid timeouts
        const enhancedSlug = generateSlug(article.title)
        const wordCount = article.content.split(' ').length
        console.log(`   ↳ Processing without enhancement: ${wordCount} words`)

        // Convert the imported article format to match the database format
        const articleData = {
          title: article.title,
          slug: enhancedSlug,
          content: article.content,
          excerpt: article.excerpt || article.content.substring(0, 160) + '...',
          category: article.category,
          status: 'published' as const,
          featured_image: article.image,
          tags: extractTags(article.title + ' ' + article.content),
          author: article.author || 'Imported Author'
        }

        // Create the article in the database
        const { data, error } = await createArticle(articleData)
        
        if (error || !data) {
          console.error(`Failed to import article "${article.title}":`, error)
          results.push({
            articleId: article.id,
            title: article.title,
            status: 'error',
            error: error || 'Failed to create article'
          })
          errorCount++
        } else {
          console.log(`✅ Successfully imported: "${article.title}"`)
          results.push({
            articleId: data.id!,
            title: article.title,
            status: 'success',
            wordCount: wordCount,
            readabilityScore: 85, // Default score since we're not enhancing
            warnings: []
          })
          successCount++
        }
      } catch (err) {
        const isTimeout = err instanceof Error && err.message.includes('timeout')
        console.error(`${isTimeout ? '⏰' : '🚨'} ${isTimeout ? 'Timeout' : 'Error'} processing article "${article.title}":`, err)
        
        results.push({
          articleId: article.id,
          title: article.title,
          status: isTimeout ? 'timeout' : 'error',
          error: err instanceof Error ? err.message : 'Unknown error'
        })
        
        if (isTimeout) {
          timeoutCount++
        } else {
          errorCount++
        }
      }
      
      // Small delay between articles to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const isComplete = (batchIndex + 1) >= totalBatches
    
    console.log(`Batch ${batchIndex + 1}/${totalBatches} complete: ${successCount} successful, ${errorCount} failed, ${timeoutCount} timed out`)

    // Clear the articles cache when we successfully import articles
    if (successCount > 0) {
      clearArticlesCache()
      console.log('🔄 Cache cleared - new articles will show on public site immediately')
    }

    const response: BatchResponse = {
      success: true,
      batch: batchIndex + 1,
      totalBatches: totalBatches,
      results: {
        total: actualTotalArticles,
        processed: (batchIndex + 1) * batchSize,
        imported: successCount,
        failed: errorCount,
        timedOut: timeoutCount,
        details: results
      },
      isComplete
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Import processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process import', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper function to extract tags from content
function extractTags(text: string): string[] {
  const commonTags = [
    'fitness', 'nutrition', 'health', 'muscle building', 'weight loss',
    'workout', 'exercise', 'diet', 'protein', 'strength training',
    'cardio', 'mental health', 'wellness', 'lifestyle', 'supplements'
  ]
  
  const textLower = text.toLowerCase()
  const tags: string[] = []
  
  for (const tag of commonTags) {
    if (textLower.includes(tag)) {
      tags.push(tag)
    }
  }
  
  // Limit to 5 tags
  return tags.slice(0, 5)
}

// Helper function to generate URL-friendly slugs
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50) // Leave room for timestamp
  
  // Add timestamp for uniqueness during bulk imports
  const timestamp = Date.now().toString().slice(-6) // Last 6 digits of timestamp
  
  return `${baseSlug}-${timestamp}`
} 