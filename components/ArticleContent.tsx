'use client'

import { useEffect, useState } from 'react'
import { processArticleContent, initializeClickTracking, type LinkingResult } from '@/lib/keyword-linker'

interface ArticleContentProps {
  articleId: string
  content: string
  className?: string
  enableKeywordLinking?: boolean
  showLinkingStats?: boolean
}

export default function ArticleContent({
  articleId,
  content,
  className = '',
  enableKeywordLinking = true,
  showLinkingStats = false
}: ArticleContentProps) {
  const [processedContent, setProcessedContent] = useState(content)
  const [linkingStats, setLinkingStats] = useState<LinkingResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (enableKeywordLinking && content) {
      processContent()
    }
    
    // Initialize click tracking for affiliate links
    initializeClickTracking(articleId)
  }, [articleId, content, enableKeywordLinking])

  const processContent = async () => {
    setIsProcessing(true)
    
    try {
      console.log(`🔄 Processing article content for keyword linking: ${articleId}`)
      
      const result = await processArticleContent(articleId, content)
      
      if (result.success) {
        setProcessedContent(result.content)
        setLinkingStats(result)
        
        console.log(`✅ Keyword linking complete:`, {
          linksAdded: result.linksAdded,
          keywordsMatched: result.keywordsMatched
        })
      } else {
        console.error('❌ Keyword linking failed:', result.error)
        setProcessedContent(content) // Fallback to original content
      }
    } catch (error) {
      console.error('❌ Error processing article content:', error)
      setProcessedContent(content) // Fallback to original content
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={`article-content ${className}`}>
      {/* Show linking stats in development/admin mode */}
      {showLinkingStats && linkingStats && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
          <div className="font-medium text-blue-900 mb-1">
            🔗 Keyword Linking Stats
          </div>
          <div className="text-blue-700 space-y-1">
            <div>Links Added: <span className="font-medium">{linkingStats.linksAdded}</span></div>
            <div>Keywords Matched: <span className="font-medium">{linkingStats.keywordsMatched.length}</span></div>
            {linkingStats.keywordsMatched.length > 0 && (
              <div className="text-xs">
                Matched: {linkingStats.keywordsMatched.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
            <span className="text-yellow-800">Processing affiliate links...</span>
          </div>
        </div>
      )}

      {/* Article content with processed affiliate links */}
      <div 
        className="prose prose-lg max-w-none
          prose-headings:text-gray-900 
          prose-p:text-gray-700 
          prose-a:text-red-600 
          prose-a:no-underline 
          hover:prose-a:text-red-500
          prose-strong:text-gray-900
          prose-ul:text-gray-700
          prose-ol:text-gray-700
          prose-blockquote:border-red-200
          prose-blockquote:text-gray-600"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
      
      {/* Affiliate disclosure */}
      {linkingStats && linkingStats.linksAdded > 0 && (
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <div className="text-sm text-gray-600">
            <strong>Affiliate Disclosure:</strong> This article contains affiliate links. 
            We may earn a commission when you purchase through links on our site at no extra cost to you. 
            This helps support our content creation.
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Optimized client-side click tracking for better performance
 */
export function useClickTracking(articleId: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    let debounceTimer: NodeJS.Timeout

    const handleClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const link = target.closest('a[data-mh-affiliate="true"]')
      
      if (link) {
        const keywordId = link.getAttribute('data-keyword-id')
        
        if (keywordId) {
          // Debounce rapid clicks
          clearTimeout(debounceTimer)
          debounceTimer = setTimeout(async () => {
            try {
              const response = await fetch('/api/track-click', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  keywordId,
                  articleId
                }),
              })

              if (response.ok) {
                console.log(`📊 Tracked affiliate click: ${keywordId}`)
              } else {
                console.warn('Failed to track affiliate click')
              }
            } catch (error) {
              console.warn('Error tracking affiliate click:', error)
            }
          }, 100) // 100ms debounce
        }
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
      clearTimeout(debounceTimer)
    }
  }, [articleId])
} 