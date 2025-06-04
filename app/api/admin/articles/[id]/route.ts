import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
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