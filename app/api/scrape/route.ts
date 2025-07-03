import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url, prompt } = await request.json()
    
    if (!url || !prompt) {
      return NextResponse.json({ error: 'URL and prompt are required' }, { status: 400 })
    }
    
    // For now, we'll use a simplified extraction approach
    // In production, you would use Firecrawl API or similar service
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`)
    }
    
    const html = await response.text()
    
    // Extract content using regex patterns (simplified approach)
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled'
    
    // Extract article content (looking for common article containers)
    const contentMatch = html.match(/<div[^>]*class="[^"]*article-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                        html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                        html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
    
    let content = ''
    if (contentMatch) {
      // Clean up the content
      content = contentMatch[1]
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    }
    
    // Extract image
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) ||
                      html.match(/<img[^>]*class="[^"]*featured[^"]*"[^>]*src="([^"]+)"/i)
    const image = imageMatch ? imageMatch[1] : null
    
    // Extract author
    const authorMatch = html.match(/<span[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/span>/i) ||
                       html.match(/<meta[^>]*name="author"[^>]*content="([^"]+)"/i)
    const author = authorMatch ? authorMatch[1].trim() : null
    
    // For Men's Health articles, we'll need more specific extraction
    // This is a simplified version - in production, use proper HTML parsing
    
    return NextResponse.json({
      title,
      content: content.substring(0, 5000), // Limit content length
      excerpt: content.substring(0, 200) + '...',
      author,
      image,
      publishDate: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      { error: 'Scraping failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}