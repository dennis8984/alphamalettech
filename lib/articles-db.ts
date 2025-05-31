'use client'

import { getCurrentUser } from './supabase-auth'

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

// Mock database for now - replace with actual Supabase calls
let mockArticles: Article[] = [
  {
    id: '1',
    title: 'The Ultimate Guide to Building Muscle Mass',
    slug: 'ultimate-guide-building-muscle-mass',
    category: 'fitness',
    status: 'published',
    content: `# The Ultimate Guide to Building Muscle Mass

Building muscle mass is one of the most rewarding fitness goals you can pursue. Not only does it improve your physical appearance, but it also enhances your overall health, boosts your metabolism, and increases your functional strength.

## Understanding Muscle Growth

Muscle growth, or hypertrophy, occurs when you consistently challenge your muscles through resistance training while providing adequate nutrition and recovery time.

### Key Principles:

1. **Progressive Overload** - Gradually increase weight, reps, or intensity
2. **Adequate Protein** - Consume 1.6-2.2g of protein per kg of body weight
3. **Sufficient Rest** - Allow 48-72 hours between training the same muscle groups
4. **Consistency** - Stick to your routine for at least 8-12 weeks

## Essential Exercises for Muscle Building

Focus on compound movements that work multiple muscle groups:

- **Squats** - Target quads, glutes, and core
- **Deadlifts** - Work your entire posterior chain
- **Bench Press** - Build chest, shoulders, and triceps
- **Pull-ups** - Strengthen back and biceps

Remember to start with proper form before adding weight. Quality always beats quantity when it comes to muscle building.`,
    excerpt: 'Learn the essential principles and strategies for building muscle mass effectively, including proper training techniques, nutrition guidelines, and recovery protocols.',
    featured_image: '',
    tags: ['muscle building', 'fitness', 'strength training', 'bodybuilding'],
    author: 'John Smith',
    created_at: '2024-01-15T00:00:00Z',
    published_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    title: 'Top 10 Protein-Rich Foods for Men',
    slug: 'top-10-protein-rich-foods-men',
    category: 'nutrition',
    status: 'published',
    content: 'Content for protein-rich foods article...',
    excerpt: 'Discover the best protein sources to fuel your workouts and support muscle growth.',
    featured_image: '',
    tags: ['protein', 'nutrition', 'diet'],
    author: 'Mike Johnson',
    created_at: '2024-01-12T00:00:00Z',
    published_at: '2024-01-12T00:00:00Z'
  },
  {
    id: '3',
    title: 'Mental Health Tips for Modern Men',
    slug: 'mental-health-tips-modern-men',
    category: 'health',
    status: 'draft',
    content: 'Content for mental health article...',
    excerpt: 'Essential mental health strategies for men in today\'s demanding world.',
    featured_image: '',
    tags: ['mental health', 'wellness'],
    author: 'David Wilson',
    created_at: '2024-01-08T00:00:00Z'
  }
]

export const createArticle = async (articleData: Omit<Article, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Article | null, error: string | null }> => {
  try {
    console.log('📝 Creating new article:', articleData.title)
    
    // Generate ID and timestamps
    const newArticle: Article = {
      ...articleData,
      id: `${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: articleData.status === 'published' ? new Date().toISOString() : undefined
    }
    
    // Add to mock database
    mockArticles.push(newArticle)
    
    console.log('✅ Article created successfully:', newArticle.id)
    return { data: newArticle, error: null }
    
    // TODO: Replace with actual Supabase call
    // const { data, error } = await supabase
    //   .from('articles')
    //   .insert([articleData])
    //   .select()
    //   .single()
    
  } catch (err) {
    console.error('❌ Failed to create article:', err)
    return { data: null, error: err instanceof Error ? err.message : 'Failed to create article' }
  }
}

export const updateArticle = async (id: string, articleData: Partial<Article>): Promise<{ data: Article | null, error: string | null }> => {
  try {
    console.log('✏️ Updating article:', id)
    
    const articleIndex = mockArticles.findIndex(article => article.id === id)
    if (articleIndex === -1) {
      return { data: null, error: 'Article not found' }
    }
    
    // Update article
    const updatedArticle = {
      ...mockArticles[articleIndex],
      ...articleData,
      updated_at: new Date().toISOString(),
      published_at: articleData.status === 'published' ? new Date().toISOString() : mockArticles[articleIndex].published_at
    }
    
    mockArticles[articleIndex] = updatedArticle
    
    console.log('✅ Article updated successfully:', id)
    return { data: updatedArticle, error: null }
    
    // TODO: Replace with actual Supabase call
    // const { data, error } = await supabase
    //   .from('articles')
    //   .update(articleData)
    //   .eq('id', id)
    //   .select()
    //   .single()
    
  } catch (err) {
    console.error('❌ Failed to update article:', err)
    return { data: null, error: err instanceof Error ? err.message : 'Failed to update article' }
  }
}

export const getArticle = async (id: string): Promise<{ data: Article | null, error: string | null }> => {
  try {
    const article = mockArticles.find(article => article.id === id)
    
    if (!article) {
      return { data: null, error: 'Article not found' }
    }
    
    return { data: article, error: null }
    
    // TODO: Replace with actual Supabase call
    // const { data, error } = await supabase
    //   .from('articles')
    //   .select('*')
    //   .eq('id', id)
    //   .single()
    
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to get article' }
  }
}

export const getAllArticles = async (): Promise<{ data: Article[] | null, error: string | null }> => {
  try {
    // Sort by created_at descending
    const sortedArticles = [...mockArticles].sort((a, b) => 
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    )
    
    return { data: sortedArticles, error: null }
    
    // TODO: Replace with actual Supabase call
    // const { data, error } = await supabase
    //   .from('articles')
    //   .select('*')
    //   .order('created_at', { ascending: false })
    
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to get articles' }
  }
}

export const deleteArticle = async (id: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    console.log('🗑️ Deleting article:', id)
    
    const articleIndex = mockArticles.findIndex(article => article.id === id)
    if (articleIndex === -1) {
      return { success: false, error: 'Article not found' }
    }
    
    mockArticles.splice(articleIndex, 1)
    
    console.log('✅ Article deleted successfully:', id)
    return { success: true, error: null }
    
    // TODO: Replace with actual Supabase call
    // const { error } = await supabase
    //   .from('articles')
    //   .delete()
    //   .eq('id', id)
    
  } catch (err) {
    console.error('❌ Failed to delete article:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete article' }
  }
} 