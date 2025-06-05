import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Validation schema for article creation
const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  categoryId: z.string().optional(),
  authorId: z.string().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = createArticleSchema.parse(body)

    // Check if article with this slug already exists
    const existingArticle = await prisma.article.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingArticle) {
      // Generate unique slug by appending number
      let counter = 1
      let newSlug = `${validatedData.slug}-${counter}`
      
      while (await prisma.article.findUnique({ where: { slug: newSlug } })) {
        counter++
        newSlug = `${validatedData.slug}-${counter}`
      }
      
      validatedData.slug = newSlug
    }

    // Get default author if not provided
    let authorId = validatedData.authorId
    if (!authorId) {
      const defaultAuthor = await prisma.user.findFirst({
        where: { role: 'admin' },
        orderBy: { createdAt: 'asc' }
      })
      if (defaultAuthor) {
        authorId = defaultAuthor.id
      }
    }

    // Get default category if not provided
    let categoryId = validatedData.categoryId
    if (!categoryId) {
      const defaultCategory = await prisma.category.findFirst({
        where: { name: 'Health' }
      })
      if (defaultCategory) {
        categoryId = defaultCategory.id
      }
    }

    // Create the article
    const article = await prisma.article.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        content: validatedData.content,
        excerpt: validatedData.excerpt || validatedData.content.substring(0, 160) + '...',
        published: validatedData.published,
        featured: validatedData.featured,
        trending: validatedData.trending,
        authorId: authorId!,
        categoryId: categoryId!,
      },
      include: {
        author: true,
        category: true,
      }
    })

    // Add tags if provided
    if (validatedData.tags && validatedData.tags.length > 0) {
      for (const tagName of validatedData.tags) {
        // Find or create tag
        let tag = await prisma.tag.findUnique({
          where: { name: tagName }
        })
        
        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            }
          })
        }

        // Link article to tag
        await prisma.articleTag.create({
          data: {
            articleId: article.id,
            tagId: tag.id
          }
        })
      }
    }

    console.log(`✅ Article created: ${article.title} (${article.slug})`)

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        published: article.published,
        author: article.author?.name,
        category: article.category?.name,
      }
    })

  } catch (error) {
    console.error('❌ Article creation failed:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create article', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {}
    
    if (status) {
      where.published = status === 'published'
    }
    
    if (category) {
      where.category = { name: category }
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get articles with pagination
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: true,
          category: true,
          tags: { include: { tag: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where })
    ])

    return NextResponse.json({
      articles: articles.map((article: any) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        published: article.published,
        featured: article.featured,
        trending: article.trending,
        author: article.author?.name,
        category: article.category?.name,
        tags: article.tags.map((at: any) => at.tag.name),
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('❌ Failed to fetch articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 