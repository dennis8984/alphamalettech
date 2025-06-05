import { NextRequest, NextResponse } from 'next/server'
import { clearArticlesCache } from '@/lib/data'
import { ContentEnhancer } from '@/lib/content-enhancer'
import { prisma } from '@/lib/prisma'

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
    const { articles, batchSize = 3, batchIndex = 0 } = await request.json()
    
    if (!articles || !Array.isArray(articles)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Calculate batch parameters
    const totalArticles = articles.length
    const actualBatchSize = Math.min(batchSize, totalArticles)
    const totalBatches = Math.ceil(totalArticles / actualBatchSize)
    const startIndex = batchIndex * actualBatchSize
    const endIndex = Math.min(startIndex + actualBatchSize, totalArticles)
    const currentBatch = articles.slice(startIndex, endIndex)

    console.log(`🔄 Processing batch ${batchIndex + 1}/${totalBatches} (${currentBatch.length} articles)`)
    console.log(`📊 Articles ${startIndex + 1}-${endIndex} of ${totalArticles}`)
    
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
        
        // Enhanced content processing with timeout protection
        console.log(`📝 Processing: ${article.title}`)
        
        // Create a timeout promise for individual article processing
        const articleTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Article processing timeout')), 5000) // 5s per article
        })

        const enhancementPromise = ContentEnhancer.enhanceContent(
          article.title,
          article.content,
          {
            useClaude: true,
            rewriteForOriginality: true,
            improveReadability: true,
            addHeadings: true,
            optimizeForSEO: true,
            replaceImages: true,
            addAuthorityLinks: true,
            addInternalLinks: true,
            articleSlug: article.slug,
            category: article.category
          }
        )

        // Race between enhancement and timeout
        const enhancedContent = await Promise.race([enhancementPromise, articleTimeout])
        
        const processingTime = Date.now() - articleStartTime
        console.log(`   ↳ Enhanced in ${processingTime}ms: ${enhancedContent.wordCount} words, ${enhancedContent.readabilityScore}% readability`)
        
        if (enhancedContent.warnings.length > 0) {
          console.log(`   ↳ Warnings: ${enhancedContent.warnings.join(', ')}`)
        }

        // Generate new slug from enhanced title to match the rewritten content
        const enhancedSlug = generateSlug(enhancedContent.title)
        console.log(`   ↳ Generated slug: "${enhancedSlug}" from enhanced title`)

        // Get default author and category
        const defaultAuthor = await prisma.user.findFirst({
          where: { role: 'admin' },
          orderBy: { createdAt: 'asc' }
        })
        
        const defaultCategory = await prisma.category.findFirst({
          where: { name: 'Health' }
        })

        if (!defaultAuthor || !defaultCategory) {
          console.error('Missing default author or category for import')
          results.push({
            articleId: article.id,
            title: article.title,
            status: 'error',
            error: 'Missing default author or category'
          })
          errorCount++
          continue
        }

        // Check for slug uniqueness and adjust if needed
        let finalSlug = enhancedSlug
        const existingArticle = await prisma.article.findUnique({
          where: { slug: finalSlug }
        })
        
        if (existingArticle) {
          // Generate unique slug by appending number
          let counter = 1
          let newSlug = `${finalSlug}-${counter}`
          
          while (await prisma.article.findUnique({ where: { slug: newSlug } })) {
            counter++
            newSlug = `${finalSlug}-${counter}`
          }
          
          finalSlug = newSlug
        }

        // Create the article using Prisma directly
        try {
          const createdArticle = await prisma.article.create({
            data: {
              title: enhancedContent.title,
              slug: finalSlug,
              content: enhancedContent.content,
              excerpt: enhancedContent.excerpt,
              published: true,
              featured: false,
              trending: false,
              authorId: defaultAuthor.id,
              categoryId: defaultCategory.id,
            }
          })

          console.log(`✅ Successfully imported: "${enhancedContent.title}"`)
          results.push({
            articleId: createdArticle.id,
            title: enhancedContent.title,
            status: 'success',
            wordCount: enhancedContent.wordCount,
            readabilityScore: enhancedContent.readabilityScore,
            warnings: enhancedContent.warnings
          })
          successCount++
        } catch (dbError) {
          console.error(`Database error for "${article.title}":`, dbError)
          results.push({
            articleId: article.id,
            title: article.title,
            status: 'error',
            error: dbError instanceof Error ? dbError.message : 'Database error'
          })
          errorCount++
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
        total: totalArticles,
        processed: endIndex,
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
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 60)
} 