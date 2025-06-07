import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSessionFromCookies } from '@/lib/supabase-server-auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const adminUser = await getAdminSessionFromCookies(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const articleId = params.id

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Delete the article and all related records
    await prisma.$transaction(async (tx) => {
      // Delete article tags
      await tx.articleTag.deleteMany({
        where: { articleId }
      })

      // Delete the article
      await tx.article.delete({
        where: { id: articleId }
      })
    })

    console.log(`✅ Article deleted: ${existingArticle.title}`)

    return NextResponse.json({ 
      success: true,
      message: 'Article deleted successfully'
    })

  } catch (error) {
    console.error('❌ Article deletion failed:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
} 