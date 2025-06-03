import { supabase } from './supabase-client'

// Article type definition
export interface Article {
  id?: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  status: 'draft' | 'published'
  featured_image?: string
  tags: string[]
  author: string
  created_at?: string
  updated_at?: string
  published_at?: string
}

export const createArticle = async (articleData: Omit<Article, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Article | null, error: string | null }> => {
  try {
    console.log('📝 Creating new article:', articleData.title)
    
    const { data, error } = await supabase
      .from('articles')
      .insert([{
        ...articleData,
        published_at: articleData.status === 'published' ? new Date().toISOString() : null
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase error:', error)
      return { data: null, error: error.message }
    }
    
    console.log('✅ Article created successfully:', data.id)
    return { data, error: null }
    
  } catch (err) {
    console.error('❌ Failed to create article:', err)
    return { data: null, error: err instanceof Error ? err.message : 'Failed to create article' }
  }
}

export const updateArticle = async (id: string, articleData: Partial<Article>): Promise<{ data: Article | null, error: string | null }> => {
  try {
    console.log('✏️ Updating article:', id)
    
    const updateData: any = {
      ...articleData,
      updated_at: new Date().toISOString()
    }
    
    if (articleData.status === 'published' && !articleData.published_at) {
      updateData.published_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase error:', error)
      return { data: null, error: error.message }
    }
    
    console.log('✅ Article updated successfully:', id)
    return { data, error: null }
    
  } catch (err) {
    console.error('❌ Failed to update article:', err)
    return { data: null, error: err instanceof Error ? err.message : 'Failed to update article' }
  }
}

export const getArticle = async (id: string): Promise<{ data: Article | null, error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Supabase error:', error)
      return { data: null, error: error.message }
    }
    
    return { data, error: null }
    
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to get article' }
  }
}

export const getAllArticles = async (): Promise<{ data: Article[] | null, error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error:', error)
      return { data: null, error: error.message }
    }
    
    return { data: data || [], error: null }
    
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to get articles' }
  }
}

export const deleteArticle = async (id: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    console.log('🗑️ Deleting article:', id)
    
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Supabase error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Article deleted successfully:', id)
    return { success: true, error: null }
    
  } catch (err) {
    console.error('❌ Failed to delete article:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete article' }
  }
} 