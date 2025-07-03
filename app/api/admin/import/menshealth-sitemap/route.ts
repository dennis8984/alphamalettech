import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60; // 1 minute timeout

interface SitemapCategory {
  name: string
  urls: string[]
}

export async function GET() {
  try {
    console.log('🗺️ Fetching Men\'s Health articles...')
    
    const categories: Record<string, SitemapCategory> = {
      fitness: { name: 'Fitness', urls: [] },
      nutrition: { name: 'Nutrition', urls: [] },
      health: { name: 'Health', urls: [] },
      style: { name: 'Style', urls: [] },
      'weight-loss': { name: 'Weight Loss', urls: [] },
      entertainment: { name: 'Entertainment', urls: [] }
    }
    
    // Instead of sitemap, directly fetch category pages
    for (const [categoryKey, categoryData] of Object.entries(categories)) {
      console.log(`🔍 Fetching articles for ${categoryData.name}...`)
      
      try {
        const categoryUrl = `https://www.menshealth.com/${categoryKey}/`
        const response = await fetch(categoryUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none'
          }
        })
        
        if (!response.ok) {
          console.error(`Failed to fetch ${categoryKey}: ${response.status}`)
          continue
        }
        
        const html = await response.text()
        
        // Extract article URLs using multiple patterns
        const patterns = [
          // Standard article URL pattern
          new RegExp(`href="(/${categoryKey}/a\\d+/[^"]+)"`, 'gi'),
          // Alternative URL pattern
          new RegExp(`href="(https://www\\.menshealth\\.com/${categoryKey}/a\\d+/[^"]+)"`, 'gi'),
          // Data attribute pattern
          new RegExp(`data-href="(/${categoryKey}/a\\d+/[^"]+)"`, 'gi')
        ]
        
        const foundUrls = new Set<string>()
        
        for (const pattern of patterns) {
          const matches = html.matchAll(pattern)
          for (const match of matches) {
            let url = match[1]
            // Ensure full URL
            if (!url.startsWith('http')) {
              url = `https://www.menshealth.com${url}`
            }
            // Clean URL
            url = url.split('?')[0] // Remove query params
            if (url.includes('/a') && !url.endsWith('/')) {
              foundUrls.add(url)
            }
          }
        }
        
        // Convert to array and sort by article ID (newest first)
        categoryData.urls = Array.from(foundUrls).sort((a, b) => {
          const aId = parseInt(a.match(/\/a(\d+)\//)?.[1] || '0')
          const bId = parseInt(b.match(/\/a(\d+)\//)?.[1] || '0')
          return bId - aId
        }).slice(0, 20) // Limit to 20 most recent
        
        console.log(`📊 Found ${categoryData.urls.length} articles for ${categoryData.name}`)
        
        // Add a small delay between category fetches
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`Failed to fetch category ${categoryKey}:`, error)
        // Continue with next category
      }
    }
    
    // If we couldn't fetch fresh URLs, return the hardcoded ones from the import page
    const totalArticles = Object.values(categories).reduce((sum, cat) => sum + cat.urls.length, 0)
    
    if (totalArticles === 0) {
      console.log('⚠️ No articles found via scraping, returning fallback message')
      return NextResponse.json({
        success: false,
        message: 'Unable to fetch latest articles. Please use the pre-selected articles instead.',
        categories,
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json({
      success: true,
      message: `Found ${totalArticles} latest articles across ${Object.keys(categories).length} categories`,
      categories,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Article fetch error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch latest articles', 
        details: error instanceof Error ? error.message : 'Unknown error',
        message: 'Please use the pre-selected articles instead.'
      },
      { status: 200 } // Return 200 to avoid breaking the UI
    )
  }
}