import { NextResponse } from 'next/server'
import { getAllArticles, deleteArticle } from '@/lib/articles-db'
import { clearArticlesCache } from '@/lib/data'

export async function POST() {
  try {
    console.log('🔍 Fetching all articles to find duplicates...')
    
    const { data: articles, error } = await getAllArticles()
    
    if (error || !articles) {
      console.error('❌ Failed to fetch articles:', error)
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
    }
    
    console.log(`📊 Found ${articles.length} total articles`)
    
    // Group articles by title to find duplicates
    const articlesByTitle: { [title: string]: typeof articles } = {}
    
    for (const article of articles) {
      const title = article.title.trim().toLowerCase()
      if (!articlesByTitle[title]) {
        articlesByTitle[title] = []
      }
      articlesByTitle[title].push(article)
    }
    
    // Find titles with duplicates
    const duplicateTitles = Object.keys(articlesByTitle).filter(
      title => articlesByTitle[title].length > 1
    )
    
    console.log(`🔍 Found ${duplicateTitles.length} titles with duplicates`)
    
    let totalDeleted = 0
    const deletionResults: Array<{
      title: string
      totalCopies: number
      deletedCopies: number
      keptId: string
      errors: string[]
    }> = []
    
    for (const title of duplicateTitles) {
      const duplicates = articlesByTitle[title]
      console.log(`\n📄 "${duplicates[0].title}" has ${duplicates.length} copies`)
      
      // Sort by creation date (keep the oldest one)
      duplicates.sort((a, b) => 
        new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
      )
      
      // Keep the first (oldest) one, delete the rest
      const toKeep = duplicates[0]
      const toDelete = duplicates.slice(1)
      
      console.log(`✅ Keeping: ${toKeep.id} (${toKeep.created_at})`)
      
      let deletedCount = 0
      const errors: string[] = []
      
      for (const duplicate of toDelete) {
        console.log(`🗑️  Deleting: ${duplicate.id} (${duplicate.created_at})`)
        
        try {
          const { success, error: deleteError } = await deleteArticle(duplicate.id!)
          if (success) {
            console.log(`   ✅ Deleted successfully`)
            deletedCount++
            totalDeleted++
          } else {
            const errorMsg = `Failed to delete ${duplicate.id}: ${deleteError}`
            console.log(`   ❌ ${errorMsg}`)
            errors.push(errorMsg)
          }
        } catch (err) {
          const errorMsg = `Error deleting ${duplicate.id}: ${err}`
          console.log(`   ❌ ${errorMsg}`)
          errors.push(errorMsg)
        }
      }
      
      deletionResults.push({
        title: duplicates[0].title,
        totalCopies: duplicates.length,
        deletedCopies: deletedCount,
        keptId: toKeep.id!,
        errors
      })
    }
    
    // Clear cache so changes show immediately
    if (totalDeleted > 0) {
      clearArticlesCache()
      console.log('\n🗑️ Articles cache cleared')
    }
    
    console.log(`\n📋 Summary: Deleted ${totalDeleted} duplicate articles`)
    
    return NextResponse.json({
      success: true,
      message: `Cleanup completed: deleted ${totalDeleted} duplicate articles`,
      summary: {
        totalArticlesChecked: articles.length,
        duplicateTitlesFound: duplicateTitles.length,
        totalArticlesDeleted: totalDeleted,
        remainingUniqueArticles: articles.length - totalDeleted
      },
      details: deletionResults
    })
    
  } catch (error) {
    console.error('❌ Cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup duplicates', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 