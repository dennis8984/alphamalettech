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
    } else if (content) {
      // Even if keyword linking is disabled, still add drop cap
      setProcessedContent(addDropCap(content))
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
        let enhancedContent = result.content
        
        // Add drop cap to the first paragraph
        enhancedContent = addDropCap(enhancedContent)
        
        setProcessedContent(enhancedContent)
        setLinkingStats(result)
        
        console.log(`✅ Keyword linking complete:`, {
          linksAdded: result.linksAdded,
          keywordsMatched: result.keywordsMatched
        })
      } else {
        console.error('❌ Keyword linking failed:', result.error)
        // Still add drop cap even if keyword linking fails
        setProcessedContent(addDropCap(content))
      }
    } catch (error) {
      console.error('❌ Error processing article content:', error)
      // Still add drop cap even if processing fails
      setProcessedContent(addDropCap(content))
    } finally {
      setIsProcessing(false)
    }
  }

  // Function to add drop cap to first paragraph
  const addDropCap = (htmlContent: string): string => {
    // Find the first paragraph with actual text content
    const paragraphRegex = /<p[^>]*>(.*?)<\/p>/i
    const match = htmlContent.match(paragraphRegex)
    
    if (match && match[1]) {
      const paragraphContent = match[1].trim()
      
      // Skip if paragraph is too short or starts with HTML tags
      if (paragraphContent.length < 20 || paragraphContent.startsWith('<')) {
        return htmlContent
      }
      
      // Extract first letter and rest of content
      const firstLetter = paragraphContent.charAt(0)
      const restOfContent = paragraphContent.substring(1)
      
      // Create drop cap version
      const dropCapParagraph = match[0].replace(
        match[1],
        `<span class="drop-cap">${firstLetter}</span>${restOfContent}`
      )
      
      return htmlContent.replace(match[0], dropCapParagraph)
    }
    
    return htmlContent
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
          prose-strong:text-gray-900
          prose-ul:text-gray-700
          prose-ol:text-gray-700
          prose-blockquote:border-red-200
          prose-blockquote:text-gray-600"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />

      {/* Custom styles for affiliate links */}
      <style jsx>{`
        .article-content :global(a[data-mh-affiliate="true"]) {
          color: #dc2626 !important; /* text-red-600 */
          font-weight: 700 !important; /* font-bold */
          text-decoration: underline !important;
          transition: color 0.2s ease-in-out;
        }
        
        .article-content :global(a[data-mh-affiliate="true"]:hover) {
          color: #b91c1c !important; /* text-red-700 */
        }

        /* Drop cap styling */
        .article-content :global(.drop-cap) {
          float: left;
          font-family: Georgia, serif;
          font-size: 4.5rem;
          line-height: 3.5rem;
          padding-right: 8px;
          padding-top: 4px;
          color: #dc2626; /* Men's Hub red */
          font-weight: 700;
          margin-bottom: -6px;
        }

        /* Enhanced paragraph styling */
        .article-content :global(.lead) {
          font-size: 1.25rem !important;
          color: #374151 !important;
          margin-bottom: 2rem !important;
          line-height: 1.75 !important;
        }

        /* Better spacing for enhanced content */
        .article-content :global(h2) {
          font-size: 1.875rem !important;
          font-weight: 700 !important;
          color: #111827 !important;
          margin-top: 3rem !important;
          margin-bottom: 1.5rem !important;
          line-height: 1.2 !important;
        }

        .article-content :global(h3) {
          font-size: 1.5rem !important;
          font-weight: 600 !important;
          color: #1f2937 !important;
          margin-top: 2.5rem !important;
          margin-bottom: 1rem !important;
          line-height: 1.3 !important;
        }

        .article-content :global(p) {
          margin-bottom: 1.5rem !important;
          color: #374151 !important;
          line-height: 1.75 !important;
        }

        /* Clear float after drop cap */
        .article-content :global(p:first-of-type::after) {
          content: "";
          display: table;
          clear: both;
        }
      `}</style>
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