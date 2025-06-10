// Google Ads Campaign Automation for Article Marketing

interface ArticleAdCampaign {
  articleId: string
  title: string
  excerpt: string
  category: string
  slug: string
  tags: string[]
}

interface CampaignData {
  name: string
  targetUrl: string
  headlines: string[]
  descriptions: string[]
  keywords: string[]
  budget: number
}

export async function createArticleAdCampaign(article: ArticleAdCampaign): Promise<CampaignData & { apiResult?: any }> {
  console.log(`🎯 Creating Google Ads campaign for: ${article.title}`)
  
  const campaignData: CampaignData = {
    name: `MensHub - ${article.category} - ${article.title.substring(0, 40)}`,
    targetUrl: `https://menshb.com/articles/${article.slug}`,
    headlines: generateHeadlines(article),
    descriptions: generateDescriptions(article),
    keywords: generateKeywords(article),
    budget: 2000 // $20 daily budget in cents
  }
  
  console.log('📊 Campaign data generated:', {
    name: campaignData.name,
    headlines: campaignData.headlines.length,
    descriptions: campaignData.descriptions.length,
    keywords: campaignData.keywords.length
  })

  // Try to create actual campaign via API
  try {
    console.log('🚀 Attempting to create actual Google Ads campaign...')
    
    const response = await fetch('/api/google-ads/create-campaign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaignData),
    })

    const apiResult = await response.json()
    
    if (apiResult.success) {
      console.log('✅ Google Ads campaign created successfully!', apiResult.data)
      return {
        ...campaignData,
        apiResult: {
          success: true,
          message: 'Campaign created in your Google Ads account',
          campaignId: apiResult.data.campaignId
        }
      }
    } else {
      console.error('❌ Google Ads API failed:', apiResult.error)
      return {
        ...campaignData,
        apiResult: {
          success: false,
          message: 'Campaign data generated but API creation failed',
          error: apiResult.error
        }
      }
    }
  } catch (error) {
    console.error('❌ API call failed:', error)
    return {
      ...campaignData,
      apiResult: {
        success: false,
        message: 'Campaign data generated but API unavailable',
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }
}

function generateHeadlines(article: ArticleAdCampaign): string[] {
  const headlines = [article.title.substring(0, 30)]
  
  const categoryHeadlines = {
    fitness: ['Get Fit Fast', 'Workout Like a Pro', 'Build Muscle & Strength'],
    nutrition: ['Nutrition Secrets', 'Eat Better Today', 'Healthy Eating Tips'],
    health: ['Improve Health', 'Men\'s Health Tips', 'Stay Healthy & Strong'],
    style: ['Upgrade Style', 'Look Great Daily', 'Men\'s Fashion Tips'],
    'weight-loss': ['Lose Weight Fast', 'Get Lean Now', 'Burn Fat Effectively']
  }
  
  const specific = categoryHeadlines[article.category as keyof typeof categoryHeadlines] || categoryHeadlines.health
  headlines.push(...specific)
  headlines.push('Expert Tips Inside', 'Transform Your Life', 'Get Results Fast')
  
  return headlines.slice(0, 10)
}

function generateDescriptions(article: ArticleAdCampaign): string[] {
  return [
    article.excerpt.substring(0, 90),
    `Expert ${article.category} tips from Men's Hub. Trusted advice for real results.`,
    `Transform your ${article.category} with proven strategies. Read the full guide now!`,
    'Men\'s Hub - Your ultimate guide to health, fitness, and lifestyle success.'
  ]
}

function generateKeywords(article: ArticleAdCampaign): string[] {
  const keywords = new Set<string>()
  
  // Add article tags
  article.tags.forEach(tag => {
    keywords.add(tag.toLowerCase())
    keywords.add(`${tag.toLowerCase()} tips`)
  })
  
  // Add category keywords
  keywords.add(article.category)
  keywords.add(`${article.category} tips`)
  keywords.add(`${article.category} advice`)
  keywords.add(`men's ${article.category}`)
  
  // Add general keywords
  keywords.add('men\'s health')
  keywords.add('fitness tips')
  keywords.add('health advice')
  keywords.add('men\'s lifestyle')
  
  return Array.from(keywords).slice(0, 20)
}

export function triggerCampaignForPublishedArticle(article: ArticleAdCampaign) {
  console.log(`🚀 Auto-triggering Google Ads campaign for: ${article.title}`)
  return createArticleAdCampaign(article)
} 