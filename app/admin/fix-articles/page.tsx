'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function FixArticlesPage() {
  const [isFixing, setIsFixing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fixArticles = async () => {
    setIsFixing(true)
    setError(null)
    setResults(null)
    setProgress(0)

    try {
      // First, get all articles
      const articlesResponse = await fetch('/api/admin/articles')
      if (!articlesResponse.ok) {
        throw new Error('Failed to fetch articles')
      }
      
      const articles = await articlesResponse.json()
      const totalArticles = articles.length
      
      const fixResults = {
        total: totalArticles,
        processed: 0,
        success: 0,
        failed: 0,
        details: [] as any[]
      }

      // Process each article
      for (let i = 0; i < articles.length; i++) {
        const article = articles[i]
        setProgress(((i + 1) / totalArticles) * 100)
        
        const detail = {
          id: article.id,
          title: article.title,
          status: 'processing',
          changes: [] as string[]
        }

        try {
          // Check if content needs fixing
          const needsMarkdownFix = article.content.includes('####') || 
                                 article.content.includes('**') || 
                                 article.content.includes('* ')
          
          const needsImageFix = !article.featured_image || 
                              article.featured_image.includes('placeholder') ||
                              article.featured_image.includes('random')

          if (needsMarkdownFix || needsImageFix) {
            // Simple markdown to HTML conversion
            let updatedContent = article.content
            
            if (needsMarkdownFix) {
              // Convert markdown headers
              updatedContent = updatedContent
                .replace(/^#### (.+)$/gm, '<h4 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h4>')
                .replace(/^### (.+)$/gm, '<h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4 leading-tight">$1</h3>')
                .replace(/^## (.+)$/gm, '<h2 class="text-3xl font-bold text-gray-900 mt-10 mb-5 leading-tight">$1</h2>')
                .replace(/^# (.+)$/gm, '<h1 class="text-4xl font-bold text-gray-900 mt-12 mb-6 leading-tight">$1</h1>')
              
              // Convert bold text
              updatedContent = updatedContent.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
              
              // Convert italic text  
              updatedContent = updatedContent.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
              
              // Convert bullet points
              updatedContent = updatedContent.replace(/^\* (.+)$/gm, '<li class="flex items-start"><span class="text-red-600 font-bold mr-3">•</span><span class="leading-relaxed">$1</span></li>')
              
              // Wrap consecutive list items in ul tags
              updatedContent = updatedContent.replace(/((<li class="flex items-start">.*<\/li>\s*)+)/g, '<ul class="space-y-3 text-gray-700 mb-6 ml-6">$1</ul>')
              
              // Convert paragraphs
              const paragraphs = updatedContent.split('\n\n')
              updatedContent = paragraphs.map(para => {
                if (para.trim() && !para.includes('<h') && !para.includes('<ul') && !para.includes('<li')) {
                  return `<p class="mb-6 text-gray-700 leading-relaxed">${para.trim()}</p>`
                }
                return para
              }).join('\n\n')
              
              detail.changes.push('Converted markdown to HTML')
            }

            // Update featured image
            let featuredImage = article.featured_image
            if (needsImageFix) {
              // Use category-appropriate images
              const categoryImages: Record<string, string[]> = {
                health: [
                  'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                  'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                ],
                fitness: [
                  'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                  'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                ],
                nutrition: [
                  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                  'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                ]
              }
              
              const images = categoryImages[article.category] || categoryImages.health
              featuredImage = images[i % images.length]
              detail.changes.push('Updated featured image')
            }

            // Update the article
            const updateResponse = await fetch(`/api/admin/articles/${article.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...article,
                content: updatedContent,
                featured_image: featuredImage
              })
            })

            if (updateResponse.ok) {
              detail.status = 'success'
              fixResults.success++
            } else {
              detail.status = 'failed'
              detail.error = 'Failed to update article'
              fixResults.failed++
            }
          } else {
            detail.status = 'skipped'
            detail.changes.push('No changes needed')
          }
        } catch (err) {
          detail.status = 'error'
          detail.error = err instanceof Error ? err.message : 'Unknown error'
          fixResults.failed++
        }

        fixResults.processed++
        fixResults.details.push(detail)
      }

      setResults(fixResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Fix Article Formatting</CardTitle>
          <CardDescription>
            This tool will fix markdown formatting issues and update placeholder images in all articles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isFixing && !results && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This process will:
                  <ul className="list-disc ml-6 mt-2">
                    <li>Convert raw markdown to properly formatted HTML</li>
                    <li>Replace placeholder images with category-appropriate images</li>
                    <li>Add proper styling classes to all content elements</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={fixArticles}
                className="w-full"
                size="lg"
              >
                Start Fixing Articles
              </Button>
            </div>
          )}

          {isFixing && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing articles...</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {results && (
            <div className="space-y-6">
              <Alert variant={results.failed === 0 ? "default" : "destructive"}>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-semibold">Processing Complete!</p>
                    <p>Total articles: {results.total}</p>
                    <p>Successfully updated: {results.success}</p>
                    {results.failed > 0 && <p>Failed: {results.failed}</p>}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-semibold">Details:</h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {results.details.map((detail: any, index: number) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${
                        detail.status === 'success' ? 'bg-green-50 border-green-200' :
                        detail.status === 'failed' ? 'bg-red-50 border-red-200' :
                        detail.status === 'skipped' ? 'bg-gray-50 border-gray-200' :
                        'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <p className="font-medium text-sm">{detail.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Status: {detail.status}
                        {detail.changes.length > 0 && ` - ${detail.changes.join(', ')}`}
                        {detail.error && ` - Error: ${detail.error}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => {
                  setResults(null)
                  setProgress(0)
                }}
                variant="outline"
                className="w-full"
              >
                Done
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}