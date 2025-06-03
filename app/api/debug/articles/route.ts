import { NextResponse } from 'next/server'
import { getAllArticles } from '@/lib/articles-db'

export async function GET() {
  try {
    const { data, error } = await getAllArticles()
    
    if (error) {
      return NextResponse.json({ 
        error: error,
        message: 'Failed to fetch articles from database'
      }, { status: 500 })
    }
    
    const summary = {
      total: data?.length || 0,
      byStatus: data?.reduce((acc, article) => {
        acc[article.status] = (acc[article.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {},
      byCategory: data?.reduce((acc, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {},
      articles: data?.map(article => ({
        id: article.id,
        title: article.title,
        category: article.category,
        status: article.status,
        created_at: article.created_at
      })) || []
    }
    
    return NextResponse.json(summary)
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Unexpected error while fetching articles'
    }, { status: 500 })
  }
} 