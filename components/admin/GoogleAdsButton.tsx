'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createArticleAdCampaign } from '@/lib/google-ads-automation'

interface GoogleAdsButtonProps {
  article: {
    id: string
    title: string
    excerpt: string
    category: string
    slug: string
    tags?: string[]
  }
}

export function GoogleAdsButton({ article }: GoogleAdsButtonProps) {
  const [generating, setGenerating] = useState(false)

  const handleGenerateCampaign = async () => {
    setGenerating(true)
    
    try {
      const campaignData = await createArticleAdCampaign({
        articleId: article.id,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category,
        slug: article.slug,
        tags: article.tags || []
      })
      
      // Show campaign data in a formatted way
      const campaignText = `
📊 GOOGLE ADS CAMPAIGN GENERATED

🎯 Campaign: ${campaignData.name}
💰 Budget: $${campaignData.budget / 100}/day
🔗 Target: ${campaignData.targetUrl}

📝 HEADLINES (${campaignData.headlines.length}):
${campaignData.headlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}

📄 DESCRIPTIONS (${campaignData.descriptions.length}):
${campaignData.descriptions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

🔍 KEYWORDS (${campaignData.keywords.length}):
${campaignData.keywords.join(', ')}

Next Steps:
1. Copy this data
2. Go to https://ads.google.com
3. Create new campaign
4. Paste the content above
      `
      
      // Copy to clipboard
      navigator.clipboard.writeText(campaignText)
      
      alert('✅ Campaign data generated and copied to clipboard!\n\nGo to https://ads.google.com to create your campaign.')
      
    } catch (error) {
      console.error('Campaign generation failed:', error)
      alert('❌ Failed to generate campaign. Check console for details.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleGenerateCampaign}
      disabled={generating}
      variant="outline"
      size="sm"
      className="text-red-600 border-red-200 hover:bg-red-50"
    >
      {generating ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
          Generating...
        </>
      ) : (
        <>
          🎯 Generate Google Ads
        </>
      )}
    </Button>
  )
} 