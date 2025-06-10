'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getAllArticles, deleteArticle, type Article } from '@/lib/articles-db'
import { createArticleAdCampaign } from '@/lib/google-ads-automation'
import { clearArticlesCache } from '@/lib/data'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export default function ArticlesPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [generatingAds, setGeneratingAds] = useState<string | null>(null)

  // Load articles
  useEffect(() => {
    const loadArticles = async () => {
      console.log('📄 Loading articles...')
      
      const { data, error } = await getAllArticles()
      
      if (error) {
        console.error('❌ Failed to load articles:', error)
        alert(`Failed to load articles: ${error}`)
        return
      }
      
      if (data) {
        setArticles(data)
        console.log('✅ Articles loaded:', data.length)
      }
      
      setLoading(false)
    }

    loadArticles()
  }, [])

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle individual article selection
  const handleSelectArticle = (articleId: string) => {
    const newSelected = new Set(selectedArticles)
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId)
    } else {
      newSelected.add(articleId)
    }
    setSelectedArticles(newSelected)
  }

  // Handle select all toggle
  const handleSelectAll = () => {
    if (selectedArticles.size === filteredArticles.length) {
      setSelectedArticles(new Set()) // Deselect all
    } else {
      setSelectedArticles(new Set(filteredArticles.map(a => a.id).filter((id): id is string => id !== undefined))) // Select all
    }
  }

  // Handle single article deletion
  const handleDeleteArticle = async (articleId: string) => {
    try {
      const { success, error } = await deleteArticle(articleId)

      if (success) {
        setArticles(articles.filter(a => a.id && a.id !== articleId))
        setSelectedArticles(prev => {
          const newSet = new Set(prev)
          newSet.delete(articleId)
          return newSet
        })
        // Clear the frontend cache so changes show immediately
        clearArticlesCache()
        toast.success('Article deleted successfully')
      } else {
        toast.error(`Failed to delete article: ${error}`)
      }
    } catch (error) {
      toast.error('Error deleting article')
      console.error('Error:', error)
    }
  }

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedArticles.size === 0) {
      toast.error('No articles selected')
      return
    }

    setIsDeleting(true)
    const selectedIds = Array.from(selectedArticles)
    let successCount = 0
    let failCount = 0

    try {
      // Delete articles in parallel using Supabase deleteArticle function
      const deletePromises = selectedIds.map(async (articleId) => {
        try {
          const { success, error } = await deleteArticle(articleId)
          if (success) {
            successCount++
            return articleId
          } else {
            console.error(`Failed to delete article ${articleId}:`, error)
            failCount++
            return null
          }
        } catch (error) {
          console.error(`Error deleting article ${articleId}:`, error)
          failCount++
          return null
        }
      })

      const results = await Promise.all(deletePromises)
      const deletedIds = results.filter(id => id !== null) as string[]

      // Update local state
      setArticles(articles.filter(a => a.id && !deletedIds.includes(a.id)))
      setSelectedArticles(new Set())

      // Clear the frontend cache so changes show immediately
      if (successCount > 0) {
        clearArticlesCache()
      }

      // Show results
      if (successCount > 0 && failCount === 0) {
        toast.success(`Successfully deleted ${successCount} article${successCount > 1 ? 's' : ''}`)
      } else if (successCount > 0 && failCount > 0) {
        toast.warning(`Deleted ${successCount} articles, ${failCount} failed`)
      } else {
        toast.error('Failed to delete selected articles')
      }
    } catch (error) {
      toast.error('Error during bulk deletion')
      console.error('Bulk delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (article: Article) => {
    if (article.status === 'draft') {
      return <Badge variant="secondary">Draft</Badge>
    }
    if (article.status === 'published') {
      return <Badge variant="default">Published</Badge>
    }
    return <Badge variant="secondary">Unknown</Badge>
  }

  const handleViewArticle = (article: Article) => {
    // Open article in new tab
    window.open(`/articles/${article.slug}`, '_blank')
  }

  const handleEditArticle = (articleId: string) => {
    router.push(`/admin/articles/edit/${articleId}`)
  }

  // Handle Google Ads campaign generation
  const handleGenerateGoogleAds = async (article: Article) => {
    if (!article.id) return
    
    setGeneratingAds(article.id)
    
    try {
      console.log(`🎯 Generating Google Ads campaign for: ${article.title}`)
      
      const campaignData = await createArticleAdCampaign({
        articleId: article.id,
        title: article.title,
        excerpt: article.excerpt || '',
        category: article.category,
        slug: article.slug,
        tags: article.tags || []
      })
      
      // Format campaign data for copying
      const campaignText = `
🎯 GOOGLE ADS CAMPAIGN GENERATED

Campaign: ${campaignData.name}
Budget: $${campaignData.budget / 100}/day
Target: ${campaignData.targetUrl}

📝 HEADLINES (${campaignData.headlines.length}):
${campaignData.headlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}

📄 DESCRIPTIONS (${campaignData.descriptions.length}):
${campaignData.descriptions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

🔍 KEYWORDS (${campaignData.keywords.length}):
${campaignData.keywords.join(', ')}

Next Steps:
1. Copy this data
2. Go to https://ads.google.com  
3. Create new Search campaign
4. Paste the content above
      `
      
      // Handle API result and clipboard
      if (campaignData.apiResult?.success) {
        // Campaign was actually created in Google Ads
        toast.success(`🎉 Google Ads campaign created successfully!\n\nCampaign ID: ${campaignData.apiResult.campaignId}\n\nCheck your Google Ads account - campaign is PAUSED for your review.`)
      } else if (campaignData.apiResult?.error) {
        // API failed, fallback to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(campaignText)
          toast.error(`⚠️ API Error: ${campaignData.apiResult.error}\n\nCampaign data copied to clipboard as fallback.\nGo to https://ads.google.com to create manually.`)
        } else {
          console.log('📊 Campaign Data:', campaignText)
          toast.error(`⚠️ API Error: ${campaignData.apiResult.error}\n\nCheck console for campaign data.`)
        }
      } else {
        // No API result, use clipboard as before
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(campaignText)
          toast.success('✅ Campaign data generated and copied to clipboard!\n\nGo to https://ads.google.com to create your campaign.')
        } else {
          console.log('📊 Campaign Data:', campaignText)
          toast.success('✅ Campaign generated! Check browser console for data to copy.')
        }
      }
      
    } catch (error) {
      console.error('❌ Campaign generation failed:', error)
      toast.error('Failed to generate campaign. Check console for details.')
    } finally {
      setGeneratingAds(null)
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
          <h1 className="text-3xl font-bold">Manage Articles</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your articles with our rich text editor
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Link href="/admin/articles/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Google Ads Info */}
      <Card className="mb-6 border-red-100 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-red-600 text-xl">🎯</div>
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Automated Google Ads Campaign Creator</h3>
              <p className="text-sm text-red-700 mb-2">
                Click the 🎯 button next to published articles to <strong>automatically create</strong> Google Ads campaigns in your account.
              </p>
              <div className="text-xs text-red-600 space-y-1">
                <p><strong>✅ If API configured:</strong> Campaign created directly in your Google Ads account (PAUSED for review)</p>
                <p><strong>⚠️ If API unavailable:</strong> Campaign data copied to clipboard for manual creation</p>
                <p>Requires Google Ads API credentials in Vercel environment variables</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Articles ({filteredArticles.length})</CardTitle>
          <CardDescription>
            Manage all your published and draft articles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedArticles.size > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">
                {selectedArticles.size} selected
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete Selected'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Selected Articles</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedArticles.size} selected article{selectedArticles.size > 1 ? 's' : ''}? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBulkDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Articles
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedArticles.size === filteredArticles.length && filteredArticles.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all articles"
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'No articles found matching your search' : 'No articles found. Create your first article!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <Checkbox
                          checked={article.id ? selectedArticles.has(article.id) : false}
                          onCheckedChange={() => article.id && handleSelectArticle(article.id)}
                          aria-label={`Select ${article.title}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{article.title}</div>
                          <div className="text-sm text-muted-foreground">/{article.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(article)}</TableCell>
                      <TableCell>{article.author}</TableCell>
                      <TableCell>
                        {article.created_at ? new Date(article.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {article.status === 'published' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewArticle(article)}
                                title="View article"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleGenerateGoogleAds(article)}
                                disabled={generatingAds === article.id}
                                title="Generate Google Ads campaign"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                {generatingAds === article.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                ) : (
                                  '🎯'
                                )}
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => article.id && handleEditArticle(article.id)}
                            title="Edit article"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Article</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{article.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => article.id && handleDeleteArticle(article.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Article
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 