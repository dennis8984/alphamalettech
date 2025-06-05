import { NextResponse } from 'next/server'
import { createArticle } from '@/lib/articles-db'

export async function GET() {
  try {
    console.log('🧪 Testing article creation...')
    
    const testArticle = {
      title: 'Test Article - ' + new Date().toISOString(),
      slug: 'test-article-' + Date.now(),
      content: '# Test Article\n\nThis is a test article to verify the createArticle function works correctly.\n\n## Benefits\n\n- Test benefit 1\n- Test benefit 2\n\n## Conclusion\n\nThis article was created successfully!',
      excerpt: 'This is a test article excerpt to verify article creation works.',
      category: 'Health',
      status: 'published' as const,
      featured_image: 'https://example.com/test-image.jpg',
      tags: ['test', 'article', 'health'],
      author: 'Test Author'
    }

    console.log('📝 Creating test article:', testArticle.title)
    
    const { data, error } = await createArticle(testArticle)
    
    if (error) {
      console.error('❌ Failed to create test article:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create article',
        details: error,
        testArticle
      }, { status: 500 })
    }

    console.log('✅ Test article created successfully:', data?.id)
    
    return NextResponse.json({
      success: true,
      message: 'Test article created successfully',
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
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 