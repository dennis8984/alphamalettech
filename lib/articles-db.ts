import { prisma } from './prisma'

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
    
    // Get or create category
    let category = await prisma.category.findFirst({
      where: { name: { equals: articleData.category, mode: 'insensitive' } }
    })
    
    if (!category) {
      console.log(`📁 Creating new category: ${articleData.category}`)
      category = await prisma.category.create({
        data: {
          name: articleData.category,
          slug: articleData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        }
      })
    }
    
    // Get or create author
    let author = await prisma.user.findFirst({
      where: { name: articleData.author }
    })
    
    if (!author) {
      console.log(`👤 Creating new author: ${articleData.author}`)
      author = await prisma.user.create({
        data: {
          name: articleData.author,
          email: `${articleData.author.toLowerCase().replace(/\s+/g, '.')}@imported.com`,
          role: 'author'
        }
      })
    }
    
    // Create the article
    const article = await prisma.article.create({
      data: {
        title: articleData.title,
        slug: articleData.slug,
        content: articleData.content,
        excerpt: articleData.excerpt,
        image: articleData.featured_image,
        published: articleData.status === 'published',
        featured: false,
        trending: false,
        categoryId: category.id,
        authorId: author.id,
        publishedAt: articleData.status === 'published' ? new Date() : null
      },
      include: {
        category: true,
        author: true
      }
    })

    console.log('✅ Article created successfully:', article.id)
    
    // Convert back to the expected format
    const result: Article = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category.name,
      status: article.published ? 'published' : 'draft',
      featured_image: article.image || undefined,
      tags: articleData.tags,
      author: article.author.name || articleData.author,
      created_at: article.createdAt.toISOString(),
      updated_at: article.updatedAt.toISOString(),
      published_at: article.publishedAt?.toISOString()
    }
    
    return { data: result, error: null }
    
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
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: true
      }
    })
    
    if (!article) {
      return { data: null, error: 'Article not found' }
    }
    
    const result: Article = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category.name,
      status: article.published ? 'published' : 'draft',
      featured_image: article.image || undefined,
      tags: [], // TODO: Add tags relationship
      author: article.author.name || 'Unknown Author',
      created_at: article.createdAt.toISOString(),
      updated_at: article.updatedAt.toISOString(),
      published_at: article.publishedAt?.toISOString()
    }
    
    return { data: result, error: null }
    
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to get article' }
  }
}

export const getAllArticles = async (): Promise<{ data: Article[] | null, error: string | null }> => {
  try {
    const articles = await prisma.article.findMany({
      include: {
        category: true,
        author: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    const results: Article[] = articles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category.name,
      status: article.published ? 'published' : 'draft',
      featured_image: article.image || undefined,
      tags: [], // TODO: Add tags relationship
      author: article.author.name || 'Unknown Author',
      created_at: article.createdAt.toISOString(),
      updated_at: article.updatedAt.toISOString(),
      published_at: article.publishedAt?.toISOString()
    }))
    
    return { data: results, error: null }
    
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to get articles' }
  }
}

export const deleteArticle = async (id: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    console.log('🗑️ Deleting article:', id)
    
    await prisma.article.delete({
      where: { id }
    })
    
    console.log('✅ Article deleted successfully:', id)
    return { success: true, error: null }
    
  } catch (err) {
    console.error('❌ Failed to delete article:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete article' }
  }
} 