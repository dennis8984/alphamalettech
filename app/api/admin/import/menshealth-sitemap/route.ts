import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60; // 1 minute timeout

interface SitemapCategory {
  name: string
  urls: string[]
}

export async function GET() {
  try {
    console.log('🗺️ Fetching Men\'s Health sitemap...')
    
    const categories: Record<string, SitemapCategory> = {
      fitness: { name: 'Fitness', urls: [] },
      nutrition: { name: 'Nutrition', urls: [] },
      health: { name: 'Health', urls: [] },
      style: { name: 'Style', urls: [] },
      'weight-loss': { name: 'Weight Loss', urls: [] },
      entertainment: { name: 'Entertainment', urls: [] }
    }
    
    // Fetch the main sitemap
    const sitemapUrl = 'https://www.menshealth.com/sitemap.xml'
    const response = await fetch(sitemapUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MensHubBot/1.0)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status}`)
    }
    
    const sitemapXml = await response.text()
    
    // Extract URLs for each category
    for (const [categoryKey, categoryData] of Object.entries(categories)) {
      // Pattern to match URLs from the category
      const pattern = new RegExp(`<loc>(https://www\\.menshealth\\.com/${categoryKey}/[^<]+)</loc>`, 'gi')
      const matches = sitemapXml.matchAll(pattern)
      
      for (const match of matches) {
        const url = match[1]
        // Filter out index pages and only keep article pages
        if (url.includes('/a') && !url.endsWith('/')) {
          categoryData.urls.push(url)
        }
      }
      
      // Sort by most recent (assuming higher article IDs are newer)
      categoryData.urls.sort((a, b) => {
        const aId = parseInt(a.match(/\/a(\d+)\//)?.[1] || '0')
        const bId = parseInt(b.match(/\/a(\d+)\//)?.[1] || '0')
        return bId - aId
      })
      
      // Limit to 20 most recent articles
      categoryData.urls = categoryData.urls.slice(0, 20)
      
      console.log(`📊 Found ${categoryData.urls.length} articles for ${categoryData.name}`)
    }
    
    // If sitemap doesn't have enough articles, try category pages
    for (const [categoryKey, categoryData] of Object.entries(categories)) {
      if (categoryData.urls.length < 20) {
        console.log(`🔍 Fetching additional articles for ${categoryData.name}...`)
        
        try {
          const categoryUrl = `https://www.menshealth.com/${categoryKey}/`
          const categoryResponse = await fetch(categoryUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })
          
          if (categoryResponse.ok) {
            const html = await categoryResponse.text()
            
            // Extract article URLs from the HTML
            const urlPattern = new RegExp(`href="(/${categoryKey}/a\\d+/[^"]+)"`, 'gi')
            const urlMatches = html.matchAll(urlPattern)
            
            for (const match of urlMatches) {
              const url = `https://www.menshealth.com${match[1]}`
              if (!categoryData.urls.includes(url) && categoryData.urls.length < 20) {
                categoryData.urls.push(url)
              }
            }
          }
        } catch (error) {
          console.error(`Failed to fetch category page for ${categoryKey}:`, error)
        }
      }
    }
    
    // Calculate totals
    const totalArticles = Object.values(categories).reduce((sum, cat) => sum + cat.urls.length, 0)
    
    return NextResponse.json({
      success: true,
      message: `Found ${totalArticles} articles across ${Object.keys(categories).length} categories`,
      categories,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Sitemap fetch error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch sitemap', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}