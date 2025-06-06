import { NextResponse } from 'next/server'
import { getAllArticles, updateArticle } from '@/lib/articles-db'
import { clearArticlesCache } from '@/lib/data'

// Enhanced category detection function
function detectCategory(text: string): string {
  const lowerText = text.toLowerCase()
  
  // Fitness - check first to catch workout-related nutrition
  if (lowerText.includes('workout') || lowerText.includes('exercise') || lowerText.includes('training') || 
      lowerText.includes('muscle building') || lowerText.includes('strength') || lowerText.includes('cardio') || 
      lowerText.includes('gym') || lowerText.includes('fitness')) {
    return 'fitness'
  }
  
  // Nutrition - comprehensive check for nutrition/diet content
  if (lowerText.includes('protein') || lowerText.includes('diet') || lowerText.includes('nutrition') || 
      lowerText.includes('food') || lowerText.includes('carbs') || lowerText.includes('carbohydrates') ||
      lowerText.includes('supplements') || lowerText.includes('vitamins') || lowerText.includes('calories') ||
      lowerText.includes('macros') || lowerText.includes('keto') || lowerText.includes('fiber') ||
      lowerText.includes('meal') || lowerText.includes('eating') || lowerText.includes('nutrients') ||
      lowerText.includes('amino acid') || lowerText.includes('fasting') || lowerText.includes('mediterranean') ||
      lowerText.includes('vegan') || lowerText.includes('paleo') || lowerText.includes('organic') ||
      lowerText.includes('superfood') || lowerText.includes('antioxidant') || lowerText.includes('probiotics') ||
      lowerText.includes('omega') || lowerText.includes('mineral') || lowerText.includes('calcium') ||
      lowerText.includes('iron') || lowerText.includes('zinc') || lowerText.includes('magnesium') ||
      lowerText.includes('snack') || lowerText.includes('recipe') || lowerText.includes('ingredient') ||
      lowerText.includes('cook') || lowerText.includes('sugar') || lowerText.includes('sodium') ||
      lowerText.includes('fat') && (lowerText.includes('saturated') || lowerText.includes('trans') || lowerText.includes('healthy fats'))) {
    return 'nutrition'
  }
  
  // Weight loss - specific weight loss terms
  if (lowerText.includes('weight loss') || lowerText.includes('lose weight') || lowerText.includes('fat loss') ||
      lowerText.includes('burn fat') || lowerText.includes('slim') || lowerText.includes('obesity') ||
      lowerText.includes('calorie deficit') || lowerText.includes('metabolism')) {
    return 'weight-loss'
  }
  
  // Style
  if (lowerText.includes('style') || lowerText.includes('fashion') || lowerText.includes('clothing') || 
      lowerText.includes('shoes') || lowerText.includes('grooming') || lowerText.includes('hair') ||
      lowerText.includes('beard') || lowerText.includes('skincare')) {
    return 'style'
  }
  
  // Entertainment
  if (lowerText.includes('movie') || lowerText.includes('show') || lowerText.includes('entertainment') || 
      lowerText.includes('streaming') || lowerText.includes('tv') || lowerText.includes('film') ||
      lowerText.includes('series') || lowerText.includes('gaming') || lowerText.includes('music')) {
    return 'entertainment'
  }
  
  return 'health' // Default category
}

export async function POST() {
  try {
    console.log('🔍 Fetching all articles to reclassify...')
    
    const { data: articles, error } = await getAllArticles()
    
    if (error || !articles) {
      console.error('❌ Failed to fetch articles:', error)
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
    }
    
    console.log(`📊 Found ${articles.length} total articles`)
    
    let updatedCount = 0
    let skippedCount = 0
    const updates: Array<{id: string, title: string, oldCategory: string, newCategory: string}> = []
    
    // Process each article
    for (const article of articles) {
      const currentCategory = article.category
      const textToAnalyze = `${article.title || ''} ${article.excerpt || ''} ${(article.content || '').substring(0, 1000)}`
      const suggestedCategory = detectCategory(textToAnalyze)
      
      // Only update if the category would change and article has an ID
      if (currentCategory !== suggestedCategory && article.id) {
        console.log(`🔄 "${(article.title || 'Untitled').substring(0, 60)}..." | ${currentCategory} → ${suggestedCategory}`)
        
        try {
          const { error } = await updateArticle(article.id, {
            category: suggestedCategory
          })
          
          if (error) {
            console.error(`❌ Failed to update article ${article.id}:`, error)
          } else {
            updatedCount++
            updates.push({
              id: article.id,
              title: article.title || 'Untitled',
              oldCategory: currentCategory,
              newCategory: suggestedCategory
            })
          }
        } catch (err) {
          console.error(`❌ Error updating article ${article.id}:`, err)
        }
      } else {
        skippedCount++
      }
    }
    
    // Clear cache so changes show immediately
    clearArticlesCache()
    
    // Show category breakdown of updates
    const categoryBreakdown = updates.reduce((acc, update) => {
      acc[update.newCategory] = (acc[update.newCategory] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const summary = {
      total: articles.length,
      updated: updatedCount,
      skipped: skippedCount,
      categoryBreakdown,
      updates: updates.slice(0, 10) // First 10 examples
    }
    
    console.log('🎉 Category reclassification complete!')
    
    return NextResponse.json({
      success: true,
      message: 'Category reclassification complete!',
      summary
    })
    
  } catch (err) {
    console.error('❌ Fix categories error:', err)
    return NextResponse.json({
      error: 'Failed to fix categories',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
} 