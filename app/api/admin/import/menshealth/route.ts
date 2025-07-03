import { NextRequest, NextResponse } from 'next/server'
import { createArticle } from '@/lib/articles-db'
import { ContentEnhancer } from '@/lib/content-enhancer'
import { clearArticlesCache } from '@/lib/data'

interface FirecrawlArticle {
  url: string
  title: string
  content: string
  excerpt?: string
  author?: string
  publishDate?: string
  image?: string
}

export async function POST(request: NextRequest) {
  try {
    const { urls, category = 'fitness' } = await request.json()
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'No URLs provided' }, { status: 400 })
    }

    console.log(`🔥 Starting Firecrawl import for ${urls.length} ${category} articles`)
    
    const results = []
    let successCount = 0
    let errorCount = 0
    
    // Process each URL
    for (const url of urls) {
      try {
        console.log(`\n📰 Processing: ${url}`)
        
        // Step 1: Scrape article using Firecrawl
        const scrapedData = await scrapeArticleWithFirecrawl(url)
        
        if (!scrapedData || !scrapedData.content) {
          throw new Error('Failed to scrape article content')
        }
        
        console.log(`✅ Scraped: ${scrapedData.title}`)
        
        // Step 2: Enhance content with Claude AI
        console.log(`🤖 Enhancing content with Claude AI...`)
        
        const enhancementResult = await ContentEnhancer.enhanceContent(
          scrapedData.title,
          scrapedData.content,
          {
            rewriteForOriginality: true,  // Complete rewrite for Copyscape
            improveReadability: true,
            addHeadings: true,
            optimizeForSEO: true,
            replaceImages: false,  // Keep original images
            addAuthorityLinks: true,
            addInternalLinks: true,
            articleSlug: generateSlug(scrapedData.title),
            category: category,
            useClaude: true  // Use Claude AI
          }
        )
        
        console.log(`✨ Enhanced: ${enhancementResult.wordCount} words`)
        
        // Step 3: Create article in database
        const articleData = {
          title: enhancementResult.title,
          slug: generateSlug(enhancementResult.title),
          content: enhancementResult.content,
          excerpt: enhancementResult.excerpt,
          category: category,
          status: 'published' as const,
          featured_image: scrapedData.image || `https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg`,
          tags: extractTags(enhancementResult.title + ' ' + category),
          author: scrapedData.author || 'Men\'s Health Editorial Team',
          meta_description: enhancementResult.metaDescription
        }
        
        const { data, error } = await createArticle(articleData)
        
        if (error || !data) {
          throw new Error(error || 'Failed to create article')
        }
        
        console.log(`💾 Saved: ${data.id}`)
        
        results.push({
          url,
          title: enhancementResult.title,
          status: 'success',
          articleId: data.id,
          wordCount: enhancementResult.wordCount
        })
        
        successCount++
        
        // Small delay between articles
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (error) {
        console.error(`❌ Failed to process ${url}:`, error)
        results.push({
          url,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        errorCount++
      }
    }
    
    // Clear cache to show new articles immediately
    if (successCount > 0) {
      clearArticlesCache()
    }
    
    console.log(`\n✅ Import complete: ${successCount} success, ${errorCount} errors`)
    
    return NextResponse.json({
      success: true,
      totalProcessed: urls.length,
      successCount,
      errorCount,
      results
    })
    
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Import failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Scrape article using direct fetch approach
async function scrapeArticleWithFirecrawl(url: string): Promise<FirecrawlArticle | null> {
  try {
    // Fetch the article HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`)
    }
    
    const html = await response.text()
    
    // Extract title
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                      html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i)
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Article'
    
    // Extract main content - Men's Health specific selectors
    let content = ''
    
    // Try multiple content selectors
    const contentPatterns = [
      /<div[^>]*class="[^"]*article-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*body-text[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*data-journey-content[^>]*>([\s\S]*?)<\/div>/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i
    ]
    
    for (const pattern of contentPatterns) {
      const match = html.match(pattern)
      if (match) {
        content = match[1]
        break
      }
    }
    
    // Clean up content - extract text from paragraphs
    if (content) {
      const paragraphs = content.match(/<p[^>]*>([^<]+)<\/p>/gi) || []
      content = paragraphs
        .map(p => p.replace(/<[^>]+>/g, '').trim())
        .filter(p => p.length > 20)
        .join('\n\n')
    }
    
    // If still no content, try a more aggressive approach
    if (!content || content.length < 100) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (bodyMatch) {
        const body = bodyMatch[1]
        const paragraphs = body.match(/<p[^>]*>([^<]+)<\/p>/gi) || []
        content = paragraphs
          .map(p => p.replace(/<[^>]+>/g, '').trim())
          .filter(p => p.length > 50 && !p.includes('Advertisement') && !p.includes('Subscribe'))
          .slice(0, 20) // Take first 20 paragraphs
          .join('\n\n')
      }
    }
    
    // Extract excerpt (first paragraph or meta description)
    const excerptMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i)
    const excerpt = excerptMatch ? excerptMatch[1] : content.substring(0, 200) + '...'
    
    // Extract image
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) ||
                      html.match(/<img[^>]*class="[^"]*lead-image[^"]*"[^>]*src="([^"]+)"/i) ||
                      html.match(/<img[^>]*data-src="([^"]+)"/i)
    const image = imageMatch ? imageMatch[1] : null
    
    // Extract author
    const authorMatch = html.match(/<span[^>]*class="[^"]*byline[^"]*"[^>]*>By ([^<]+)<\/span>/i) ||
                       html.match(/<meta[^>]*name="author"[^>]*content="([^"]+)"/i) ||
                       html.match(/By\s+<a[^>]*>([^<]+)<\/a>/i)
    const author = authorMatch ? authorMatch[1].trim() : 'Men\'s Health Editors'
    
    return {
      url,
      title,
      content: content || 'Unable to extract article content',
      excerpt,
      author,
      publishDate: new Date().toISOString(),
      image
    }
    
  } catch (error) {
    console.error('Scraping error:', error)
    return null
  }
}

// Generate URL-friendly slug
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50)
  
  const timestamp = Date.now().toString().slice(-6)
  return `${baseSlug}-${timestamp}`
}

// Extract relevant tags
function extractTags(text: string): string[] {
  const fitnessKeywords = [
    'workout', 'exercise', 'training', 'muscle', 'strength',
    'cardio', 'gym', 'fitness', 'abs', 'core', 'weightlifting',
    'crossfit', 'hiit', 'bodybuilding'
  ]
  
  const textLower = text.toLowerCase()
  const tags: string[] = []
  
  // Add category as first tag
  tags.push('fitness')
  
  // Add matching keywords
  for (const keyword of fitnessKeywords) {
    if (textLower.includes(keyword) && !tags.includes(keyword)) {
      tags.push(keyword)
    }
  }
  
  return tags.slice(0, 5)
}