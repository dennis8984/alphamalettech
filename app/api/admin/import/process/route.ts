import { NextRequest, NextResponse } from 'next/server'
import { createArticle } from '@/lib/articles-db'

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
  status: 'success' | 'error'
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const { articles } = await request.json()
    
    if (!articles || !Array.isArray(articles)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    console.log(`Processing ${articles.length} articles for import...`)
    
    const results: ImportResult[] = []
    let successCount = 0
    let errorCount = 0

    // Process each article
    for (const article of articles) {
      try {
        // Convert the imported article format to match the database format
        const articleData = {
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt,
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
            status: 'success'
          })
          successCount++
        }
      } catch (err) {
        console.error(`Error processing article "${article.title}":`, err)
        results.push({
          articleId: article.id,
          title: article.title,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error'
        })
        errorCount++
      }
      
      // Add a small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`Import complete: ${successCount} successful, ${errorCount} failed`)

    return NextResponse.json({
      success: true,
      results: {
        total: articles.length,
        imported: successCount,
        failed: errorCount,
        details: results
      }
    })

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