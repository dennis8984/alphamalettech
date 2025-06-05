import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { clearArticlesCache } from '@/lib/data'

export async function POST(request: NextRequest) {
  try {
    const { articleIds, newCategory } = await request.json()
    
    if (!articleIds || !Array.isArray(articleIds) || !newCategory) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    console.log(`🔄 Updating ${articleIds.length} articles to category: ${newCategory}`)
    
    // Update articles in batches
    const { data, error } = await supabase
      .from('articles')
      .update({ category: newCategory })
      .in('id', articleIds)
      .select('id, title, category')
    
    if (error) {
      console.error('❌ Failed to update categories:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Clear cache so changes show immediately
    clearArticlesCache()
    console.log('🔄 Cache cleared - category changes will show immediately')
    
    console.log(`✅ Successfully updated ${data?.length || 0} articles to ${newCategory}`)
    
    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
      articles: data
    })
    
  } catch (error) {
    console.error('Category update error:', error)
    return NextResponse.json(
      { error: 'Failed to update categories' },
      { status: 500 }
    )
  }
} 