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
    
    let finalSlug = articleData.slug
    let attempts = 0
    const maxAttempts = 5
    
    // Try to insert with original slug, if it fails due to duplicate, generate a new one
    while (attempts < maxAttempts) {
      try {
        const { data, error } = await supabase
          .from('articles')
          .insert([{
            title: articleData.title,
            slug: finalSlug,
            content: articleData.content,
            excerpt: articleData.excerpt,
            category: articleData.category,
            status: articleData.status,
            featured_image: articleData.featured_image,
            tags: articleData.tags,
            author: articleData.author,
            published_at: articleData.status === 'published' ? new Date().toISOString() : null
          }])
          .select()
          .single()

        if (error) {
          // Check if it's a duplicate slug error
          if ((error.code === '23505' && error.message.includes('articles_slug_key')) || 
              error.message.includes('duplicate key value violates unique constraint') ||
              error.message.includes('slug') && error.message.includes('unique')) {
            attempts++
            // Generate a new slug with random suffix
            const randomSuffix = Math.random().toString(36).substring(2, 8)
            finalSlug = `${articleData.slug}-${randomSuffix}`
            console.log(`🔄 Slug conflict detected, trying new slug: ${finalSlug} (attempt ${attempts})`)
            continue
          } else {
            console.error('❌ Supabase error:', error)
            return { data: null, error: error.message }
          }
        }
        
        console.log('✅ Article created successfully:', data.id)
        return { data, error: null }
        
      } catch (insertError) {
        console.error('❌ Insert attempt failed:', insertError)
        if (attempts >= maxAttempts - 1) {
          throw insertError
        }
        attempts++
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        finalSlug = `${articleData.slug}-${randomSuffix}`
        console.log(`🔄 Retrying with new slug: ${finalSlug} (attempt ${attempts})`)
      }
    }
    
    return { data: null, error: 'Failed to create article after multiple attempts' }
    
  } catch (err) {
    console.error('❌ Failed to create article:', err)
    return { data: null, error: err instanceof Error ? err.message : 'Failed to create article' }
  }
}

export const updateArticle = async (id: string, articleData: Partial<Article>): Promise<{ data: Article | null, error: string | null }> => {
  try {
    console.log('✏️ Updating article:', id)
    
    // For now, just return success to avoid complex category/author handling
    // TODO: Implement proper Prisma update with relationship handling
    return { data: null, error: 'Update not implemented yet' }
    
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