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
  allImages?: string[]
}

export const maxDuration = 300; // 5 minutes timeout for import

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
        
        // Include all images in the content before enhancement
        let enrichedContent = scrapedData.content
        if (scrapedData.allImages && scrapedData.allImages.length > 0) {
          // Add images throughout the content
          const paragraphs = enrichedContent.split('\n\n')
          const imageInterval = Math.floor(paragraphs.length / (scrapedData.allImages.length + 1))
          
          for (let i = 0; i < scrapedData.allImages.length && i < 5; i++) { // Max 5 images
            const insertIndex = (i + 1) * imageInterval
            if (insertIndex < paragraphs.length) {
              paragraphs.splice(insertIndex, 0, `<img src="${scrapedData.allImages[i]}" alt="${scrapedData.title} - Image ${i + 1}" class="w-full rounded-lg my-6">`)
            }
          }
          enrichedContent = paragraphs.join('\n\n')
        }
        
        const enhancementResult = await ContentEnhancer.enhanceContent(
          scrapedData.title.replace(/Men's Health/gi, "Men's Hub"),
          enrichedContent,
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
        
        // Longer delay between articles to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 5000))
        
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
    
    // Extract all images from the article
    const allImages: string[] = []
    const imgMatches = html.matchAll(/<img[^>]*(?:src|data-src|data-lazy-src)="([^"]+)"[^>]*>/gi)
    for (const match of imgMatches) {
      if (match[1] && !match[1].includes('logo') && !match[1].includes('icon')) {
        allImages.push(match[1])
      }
    }
    
    // Extract main content - Men's Health specific selectors
    let content = ''
    let contentHtml = ''
    
    // Try multiple content selectors to get full HTML content
    const contentPatterns = [
      /<div[^>]*class="[^"]*article-body[^"]*"[^>]*>([\s\S]*?)<\/div>(?=<div|<footer|<aside|$)/i,
      /<div[^>]*class="[^"]*body-content[^"]*"[^>]*>([\s\S]*?)<\/div>(?=<div|<footer|<aside|$)/i,
      /<div[^>]*data-journey-content[^>]*>([\s\S]*?)<\/div>(?=<div|<footer|<aside|$)/i,
      /<div[^>]*class="[^"]*content-body[^"]*"[^>]*>([\s\S]*?)<\/div>(?=<div|<footer|<aside|$)/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i
    ]
    
    for (const pattern of contentPatterns) {
      const match = html.match(pattern)
      if (match) {
        contentHtml = match[1]
        break
      }
    }
    
    // If no content found with specific selectors, try a more comprehensive approach
    if (!contentHtml) {
      // Look for content between h1 and common footer/sidebar elements
      const contentMatch = html.match(/<h1[^>]*>[\s\S]*?<\/h1>([\s\S]*?)(?:<footer|<aside|<div[^>]*class="[^"]*sidebar|<div[^>]*class="[^"]*related)/i)
      if (contentMatch) {
        contentHtml = contentMatch[1]
      }
    }
    
    // Extract paragraphs and other content elements while preserving structure
    if (contentHtml) {
      // Extract all text content including paragraphs, headers, lists
      const textElements = contentHtml.match(/<(p|h[2-6]|li)[^>]*>([\s\S]*?)<\/\1>/gi) || []
      
      const cleanedElements = textElements
        .map(element => {
          // Keep the HTML structure but clean the content
          return element
            .replace(/Men's Health/gi, "Men's Hub")
            .replace(/menshealth\.com/gi, "menshub.com")
        })
        .filter(element => {
          const text = element.replace(/<[^>]+>/g, '').trim()
          return text.length > 20 && 
                 !text.includes('Advertisement') && 
                 !text.includes('Subscribe to') &&
                 !text.includes('Sign up for') &&
                 !text.includes('Newsletter')
        })
      
      content = cleanedElements.join('\n\n')
    }
    
    // If still no content, extract all paragraphs from body
    if (!content || content.length < 500) {
      const allParagraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || []
      const cleanParagraphs = allParagraphs
        .map(p => p.replace(/Men's Health/gi, "Men's Hub"))
        .filter(p => {
          const text = p.replace(/<[^>]+>/g, '').trim()
          return text.length > 50 && 
                 !text.includes('Advertisement') && 
                 !text.includes('Subscribe') &&
                 !text.includes('cookie') &&
                 !text.includes('privacy policy')
        })
      
      content = cleanParagraphs.join('\n\n')
    }
    
    // Extract excerpt (first paragraph or meta description)
    const excerptMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i)
    const excerpt = excerptMatch ? excerptMatch[1] : content.substring(0, 200) + '...'
    
    // Extract image
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) ||
                      html.match(/<img[^>]*class="[^"]*lead-image[^"]*"[^>]*src="([^"]+)"/i) ||
                      html.match(/<img[^>]*data-src="([^"]+)"/i)
    const image = imageMatch ? imageMatch[1] : null
    
    // Extract author and replace Men's Health references
    const authorMatch = html.match(/<span[^>]*class="[^"]*byline[^"]*"[^>]*>By ([^<]+)<\/span>/i) ||
                       html.match(/<meta[^>]*name="author"[^>]*content="([^"]+)"/i) ||
                       html.match(/By\s+<a[^>]*>([^<]+)<\/a>/i)
    let author = authorMatch ? authorMatch[1].trim() : 'Men\'s Hub Editorial Team'
    author = author.replace(/Men's Health/gi, "Men's Hub")
    
    return {
      url,
      title,
      content: content || 'Unable to extract article content',
      excerpt,
      author,
      publishDate: new Date().toISOString(),
      image: image || undefined,
      allImages: allImages // Pass all images for enhancement
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