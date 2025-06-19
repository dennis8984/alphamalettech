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
    
    // Log all articles for debugging
    console.log('📋 All articles:')
    articles.forEach((article, index) => {
      console.log(`${index + 1}. "${article.title}" (ID: ${article.id}, Created: ${article.created_at})`)
    })
    
    // Group articles by title to find duplicates - be more aggressive
    const articlesByTitle: { [title: string]: typeof articles } = {}
    
    for (const article of articles) {
      // Clean title more thoroughly
      const title = article.title
        .trim()
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove all special characters
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim()
      
      console.log(`📝 Processing article: "${article.title}" -> normalized: "${title}"`)
      
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
    console.log('📋 Duplicate analysis:')
    Object.keys(articlesByTitle).forEach(title => {
      const count = articlesByTitle[title].length
      if (count > 1) {
        console.log(`  - "${title}": ${count} copies`)
        articlesByTitle[title].forEach((article, index) => {
          console.log(`    ${index + 1}. ID: ${article.id}, Created: ${article.created_at}`)
        })
      }
    })
    
    // Also manually check for the specific problematic articles
    const whole30Articles = articles.filter(article => 
      article.title.toLowerCase().includes('whole30') ||
      article.title.toLowerCase().includes('everything you need to know')
    )
    
    console.log(`🎯 Found ${whole30Articles.length} Whole30-related articles:`)
    whole30Articles.forEach((article, index) => {
      console.log(`${index + 1}. "${article.title}" (ID: ${article.id}, Slug: ${article.slug})`)
    })
    
    let totalDeleted = 0
    const deletionResults: Array<{
      title: string
      totalCopies: number
      deletedCopies: number
      keptId: string
      errors: string[]
    }> = []
    
    // If we have specific Whole30 duplicates, handle them manually
    if (whole30Articles.length > 1) {
      console.log('🎯 Manually handling Whole30 duplicates...')
      
      // Sort by creation date (keep the oldest one)
      whole30Articles.sort((a, b) => 
        new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
      )
      
      const toKeep = whole30Articles[0]
      const toDelete = whole30Articles.slice(1)
      
      console.log(`✅ Keeping: ${toKeep.id} "${toKeep.title}" (${toKeep.created_at})`)
      
      let deletedCount = 0
      const errors: string[] = []
      
      for (const duplicate of toDelete) {
        console.log(`🗑️  Deleting: ${duplicate.id} "${duplicate.title}" (${duplicate.created_at})`)
        
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
        title: toKeep.title,
        totalCopies: whole30Articles.length,
        deletedCopies: deletedCount,
        keptId: toKeep.id!,
        errors
      })
    }
    
    // Then handle other duplicates normally
    for (const title of duplicateTitles) {
      const duplicates = articlesByTitle[title]
      
      // Skip if we already handled Whole30 articles
      if (duplicates[0].title.toLowerCase().includes('whole30')) {
        continue
      }
      
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
        remainingUniqueArticles: articles.length - totalDeleted,
        whole30ArticlesFound: whole30Articles.length
      },
      details: deletionResults,
      debugInfo: {
        duplicateTitles: duplicateTitles,
        whole30Articles: whole30Articles.map(a => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          created: a.created_at
        }))
      }
    })
    
  } catch (error) {
    console.error('❌ Cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup duplicates', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 