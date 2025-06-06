import { NextResponse } from 'next/server'
import { getAllArticles } from '@/lib/articles-db'

export async function GET() {
  try {
    console.log('🔍 Fetching all articles from database...')
    
    const { data: articles, error } = await getAllArticles()
    
    if (error) {
      return NextResponse.json({
        error: 'Database error',
        details: error,
        suggestions: [
          'Check if articles table exists in Supabase',
          'Verify database connection',
          'Check Row Level Security settings'
        ]
      }, { status: 500 })
    }
    
    if (!articles || articles.length === 0) {
      return NextResponse.json({
        message: 'No articles found in database',
        articlesCount: 0,
        suggestions: [
          'Articles table might be empty',
          'Check if bulk import actually saved articles',
          'Verify articles table structure in Supabase'
        ]
      })
    }
    
    // Get all unique category values (exact case)
    const allCategories = [...new Set(articles.map(a => a.category))]
    
    // Check for case variations of expected categories
    const expectedCategories = ['fitness', 'nutrition', 'health', 'style', 'weight-loss', 'entertainment']
    const categoryMatches = expectedCategories.map(expected => {
      const exactMatch = articles.filter(a => a.category === expected).length
      const caseInsensitiveMatch = articles.filter(a => a.category.toLowerCase() === expected).length
      
      return {
        expected,
        exactMatch,
        caseInsensitiveMatch,
        variations: allCategories.filter(cat => cat.toLowerCase() === expected)
      }
    })
    
    // Analyze the articles
    const analysis = {
      total: articles.length,
      byStatus: articles.reduce((acc, article) => {
        acc[article.status] = (acc[article.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byCategory: articles.reduce((acc, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      allUniqueCategories: allCategories,
      categoryMatches,
      nutritionArticles: articles.filter(a => a.category === 'nutrition').length,
      nutritionArticlesCaseInsensitive: articles.filter(a => a.category.toLowerCase() === 'nutrition').length,
      publishedNutritionArticles: articles.filter(a => a.category === 'nutrition' && a.status === 'published').length,
      recentTitles: articles.slice(0, 15).map(a => ({
        title: a.title.substring(0, 60),
        category: a.category,
        status: a.status,
        created: a.created_at
      }))
    }
    
    return NextResponse.json({
      message: 'Articles database analysis',
      analysis,
      rawData: articles.slice(0, 5) // First 5 articles for inspection
    })
    
  } catch (err) {
    console.error('❌ Debug error:', err)
    return NextResponse.json({
      error: 'Failed to debug articles',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
} 