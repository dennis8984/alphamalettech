import { NextResponse } from 'next/server'
import { clearArticlesCache, initializeArticles } from '@/lib/data'

export async function POST() {
  try {
    console.log('🔄 Forcing cache refresh...')
    
    // Clear the cache
    clearArticlesCache()
    
    // Force reload articles
    const articles = await initializeArticles()
    
    console.log(`✅ Cache refreshed: ${articles.length} articles loaded`)
    
    return NextResponse.json({
      success: true,
      message: 'Cache refreshed successfully',
      articlesLoaded: articles.length,
      categories: articles.reduce((acc, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    })
    
  } catch (error) {
    console.error('❌ Cache refresh failed:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to refresh cache'
    }, { status: 500 })
  }
} 