#!/usr/bin/env tsx

import { getAllArticles, deleteArticle } from '../lib/articles-db'
import { clearArticlesCache } from '../lib/data'

async function deleteDuplicateArticles() {
  console.log('🔍 Fetching all articles to find duplicates...')
  
  const { data: articles, error } = await getAllArticles()
  
  if (error || !articles) {
    console.error('❌ Failed to fetch articles:', error)
    return
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
  
  console.log(`🔍 Found ${duplicateTitles.length} titles with duplicates:`)
  
  let totalDeleted = 0
  
  for (const title of duplicateTitles) {
    const duplicates = articlesByTitle[title]
    console.log(`\n📄 "${duplicates[0].title}" has ${duplicates.length} copies:`)
    
    // Sort by creation date (keep the oldest one)
    duplicates.sort((a, b) => 
      new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
    )
    
    // Keep the first (oldest) one, delete the rest
    const toKeep = duplicates[0]
    const toDelete = duplicates.slice(1)
    
    console.log(`✅ Keeping: ${toKeep.id} (${toKeep.created_at})`)
    
    for (const duplicate of toDelete) {
      console.log(`🗑️  Deleting: ${duplicate.id} (${duplicate.created_at})`)
      
      try {
        const { success, error } = await deleteArticle(duplicate.id!)
        if (success) {
          console.log(`   ✅ Deleted successfully`)
          totalDeleted++
        } else {
          console.log(`   ❌ Failed to delete: ${error}`)
        }
      } catch (err) {
        console.log(`   ❌ Error deleting: ${err}`)
      }
    }
  }
  
  // Clear cache so changes show immediately
  if (totalDeleted > 0) {
    clearArticlesCache()
    console.log('\n🗑️ Articles cache cleared')
  }
  
  console.log(`\n📋 Summary: Deleted ${totalDeleted} duplicate articles`)
  console.log(`📊 Remaining unique titles: ${Object.keys(articlesByTitle).length}`)
}

// Run the script
deleteDuplicateArticles().catch(console.error) 