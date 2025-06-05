import { NextResponse } from 'next/server'
import { createArticle } from '@/lib/articles-db'

export async function GET() {
  try {
    console.log('🧪 Testing manual article save...')
    
    const testArticle = {
      title: 'Everything You Need to Know Before Trying Whole30',
      slug: 'everything-you-need-to-know-before-trying-whole30',
      content: '# Everything You Need to Know Before Trying Whole30\n\nThe Whole30 program is a 30-day nutrition reset...',
      excerpt: 'A comprehensive guide to the Whole30 program and what you should know before starting.',
      category: 'nutrition',
      status: 'published' as const,
      featured_image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      tags: ['nutrition', 'whole30', 'diet', 'health'],
      author: 'Nutrition Expert'
    }

    console.log('📝 Attempting to save test article...')
    
    const { data, error } = await createArticle(testArticle)
    
    if (error) {
      console.error('❌ Failed to save article:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to save article',
        details: error,
        message: 'Could not save article to Supabase'
      }, { status: 500 })
    }

    console.log('✅ Article saved successfully:', data?.id)
    
    return NextResponse.json({
      success: true,
      message: 'Test article saved successfully',
      article: {
        id: data?.id,
        title: data?.title,
        slug: data?.slug,
        category: data?.category,
        status: data?.status
      }
    })

  } catch (error) {
    console.error('💥 Exception during test:', error)
    return NextResponse.json({
      success: false,
      error: 'Exception during test',
      details: error instanceof Error ? error.message : 'Unknown error',
      message: 'Something went wrong with article creation'
    }, { status: 500 })
  }
} 