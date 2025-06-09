'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Play, Pause, BarChart3, Target, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { getAllArticles } from '@/lib/articles-db'
import { createArticleAdCampaign } from '@/lib/google-ads-automation'

interface Article {
  id: string
  title: string
  excerpt: string
  category: string
  slug: string
  tags: string[]
  status: string
}

export default function GoogleAdsPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingCampaign, setGeneratingCampaign] = useState<string | null>(null)

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      const { data, error } = await getAllArticles()
      
      if (error) {
        console.error('❌ Failed to load articles:', error)
        return
      }
      
      // Filter published articles only
      const publishedArticles = (data || []).filter(article => article.status === 'published')
      setArticles(publishedArticles)
      
    } catch (err) {
      console.error('💥 Error loading articles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCampaign = async (article: Article) => {
    setGeneratingCampaign(article.id)
    
    try {
      console.log(`🎯 Creating Google Ads campaign for: ${article.title}`)
      
      const campaignData = await createArticleAdCampaign({
        articleId: article.id,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category,
        slug: article.slug,
        tags: article.tags || []
      })
      
      console.log('✅ Campaign data generated:', campaignData)
      
      // Show success message with campaign details
      alert(`🎉 Campaign Generated Successfully!

Campaign Name: ${campaignData.name}
Headlines: ${campaignData.headlines.length} variations
Descriptions: ${campaignData.descriptions.length} variations  
Keywords: ${campaignData.keywords.length} targeted keywords
Budget: $${campaignData.budget / 100}/day

Target URL: ${campaignData.targetUrl}

Next: Copy this data to Google Ads Manager to create the actual campaign.`)
      
    } catch (error) {
      console.error('❌ Campaign generation failed:', error)
      alert('Failed to generate campaign. Check console for details.')
    } finally {
      setGeneratingCampaign(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading articles...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Google Ads Campaigns</h1>
          <p className="text-muted-foreground">
            Create automated marketing campaigns for your published articles
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published Articles</p>
                <p className="text-2xl font-bold">{articles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-gray-500">Manual tracking needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Est. Daily Budget</p>
                <p className="text-2xl font-bold">${(articles.length * 20).toFixed(0)}</p>
                <p className="text-xs text-gray-500">$20 per campaign</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>How to Use Google Ads Automation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
              <p>Click "Generate Campaign" for any published article below</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
              <p>Copy the generated campaign data (headlines, descriptions, keywords)</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
              <p>Go to <a href="https://ads.google.com" target="_blank" className="text-red-600 hover:underline">Google Ads Manager</a> and create a new campaign</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
              <p>Paste the generated content and set your budget preferences</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <Card>
        <CardHeader>
          <CardTitle>Published Articles ({articles.length})</CardTitle>
          <CardDescription>
            Generate Google Ads campaigns for your published content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium">No published articles found</p>
              <p className="text-sm">Publish some articles first to create ad campaigns</p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article: Article) => (
                <div key={article.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{article.title}</h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {article.category}
                        </span>
                        <span>/articles/{article.slug}</span>
                        {article.tags && article.tags.length > 0 && (
                          <span>{article.tags.length} tags</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      <Button
                        onClick={() => handleCreateCampaign(article)}
                        disabled={generatingCampaign === article.id}
                        size="sm"
                        className="min-w-[140px]"
                      >
                        {generatingCampaign === article.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Generate Campaign
                          </>
                        )}
                      </Button>
                      <a
                        href={`https://menshb.com/articles/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-red-600 text-center"
                      >
                        View Article →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 