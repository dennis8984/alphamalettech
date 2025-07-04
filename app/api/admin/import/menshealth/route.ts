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
        
        // Prepare content with image placeholders for Claude to place properly
        let enrichedContent = scrapedData.content
        if (scrapedData.allImages && scrapedData.allImages.length > 0) {
          // Add image URLs at the end for Claude to place appropriately
          enrichedContent += '\n\n<!-- AVAILABLE IMAGES:\n'
          scrapedData.allImages.slice(0, 5).forEach((img, i) => {
            enrichedContent += `<img src="${img}" alt="${scrapedData.title} - Image ${i + 1}" class="w-full rounded-lg my-6">\n`
          })
          enrichedContent += '-->'
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
            useOpenAI: true,  // Use OpenAI GPT-4o-mini
            generateImages: true  // Generate images with DALL-E 3
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
        await new Promise(resolve => setTimeout(resolve, 8000)) // 8 seconds between articles
        
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
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
      const imgUrl = match[1]
      if (imgUrl && 
          !imgUrl.includes('logo') && 
          !imgUrl.includes('icon') &&
          !imgUrl.includes('opt-out') &&
          !imgUrl.includes('privacy') &&
          !imgUrl.includes('.svg') &&
          !imgUrl.includes('data:image') &&
          (imgUrl.startsWith('http') || imgUrl.startsWith('//'))
      ) {
        // Ensure absolute URL
        const absoluteUrl = imgUrl.startsWith('//') ? 'https:' + imgUrl : imgUrl
        allImages.push(absoluteUrl)
      }
    }
    
    // Extract main content - Men's Health specific selectors
    let content = ''
    let contentHtml = ''
    
    // Try multiple content selectors to get full HTML content
    const contentPatterns = [
      // Men's Health specific patterns
      /<div[^>]*class="[^"]*article-body-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
      /<div[^>]*class="[^"]*body-text[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*(?:advertisement|related|sidebar))/i,
      /<div[^>]*data-node-id="[^"]*article-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*content__body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*article__body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*itemprop="articleBody"[^>]*>([\s\S]*?)<\/div>/i,
      // Generic patterns
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<main[^>]*>([\s\S]*?)<\/main>/i
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
      // Try to find content blocks with specific data attributes
      const dataContentMatch = html.match(/<div[^>]*data-embed="body"[^>]*>([\s\S]*?)<\/div>\s*<div/i)
      if (dataContentMatch) {
        contentHtml = dataContentMatch[1]
      } else {
        // Look for content between h1 and common footer/sidebar elements
        const contentMatch = html.match(/<h1[^>]*>[\s\S]*?<\/h1>([\s\S]*?)(?:<footer|<aside|<div[^>]*class="[^"]*sidebar|<div[^>]*class="[^"]*related|<div[^>]*class="[^"]*comments)/i)
        if (contentMatch) {
          contentHtml = contentMatch[1]
        }
      }
    }
    
    // Extract paragraphs and other content elements while preserving structure
    if (contentHtml) {
      // First, remove script tags and their content
      contentHtml = contentHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      
      // Remove style tags
      contentHtml = contentHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      
      // Extract all text content including paragraphs, headers, lists
      const textElements = contentHtml.match(/<(p|h[2-6]|ul|ol|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi) || []
      
      const cleanedElements = textElements
        .map(element => {
          // Keep the HTML structure but clean the content
          return element
            .replace(/Men's Health/gi, "Men's Hub")
            .replace(/menshealth\.com/gi, "menshb.com")
        })
        .filter(element => {
          const text = element.replace(/<[^>]+>/g, '').trim()
          return text.length > 20 && 
                 !text.includes('Advertisement') && 
                 !text.includes('Subscribe to') &&
                 !text.includes('Sign up for') &&
                 !text.includes('Newsletter') &&
                 !text.includes('View full post on') &&
                 !text.includes('This content is imported')
        })
      
      content = cleanedElements.join('\n\n')
    }
    
    // If still no content, try JSON-LD structured data
    if (!content || content.length < 500) {
      const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i)
      if (jsonLdMatch) {
        try {
          const jsonData = JSON.parse(jsonLdMatch[1])
          if (jsonData.articleBody) {
            content = jsonData.articleBody.replace(/Men's Health/gi, "Men's Hub")
          }
        } catch (e) {
          console.log('Failed to parse JSON-LD')
        }
      }
    }
    
    // Final fallback: extract all paragraphs from body
    if (!content || content.length < 500) {
      console.log('⚠️ Using fallback paragraph extraction for:', url)
      const allParagraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || []
      const cleanParagraphs = allParagraphs
        .map(p => p.replace(/Men's Health/gi, "Men's Hub"))
        .filter(p => {
          const text = p.replace(/<[^>]+>/g, '').trim()
          return text.length > 50 && 
                 !text.includes('Advertisement') && 
                 !text.includes('Subscribe') &&
                 !text.includes('cookie') &&
                 !text.includes('privacy policy') &&
                 !text.includes('Terms of Use') &&
                 !text.includes('Privacy Policy')
        })
      
      content = cleanParagraphs.slice(0, 30).join('\n\n') // Limit to first 30 paragraphs
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
    
    // Log extraction results for debugging
    console.log(`📊 Extraction results for ${url}:`)
    console.log(`  - Title: ${title}`)
    console.log(`  - Content length: ${content.length} chars`)
    console.log(`  - Images found: ${allImages.length}`)
    console.log(`  - Author: ${author}`)
    
    if (!content || content.length < 100) {
      console.error(`❌ Failed to extract sufficient content from ${url}`)
      return null
    }
    
    return {
      url,
      title,
      content: content,
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