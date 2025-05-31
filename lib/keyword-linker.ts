import { getActiveKeywords, trackKeywordClick, type Keyword } from './supabase-keywords'

export interface LinkingOptions {
  articleId: string
  maxLinksPerKeyword?: boolean
  respectCaseSensitive?: boolean
  excludeExistingLinks?: boolean
  addNoFollowRel?: boolean
  trackClicks?: boolean
}

export interface LinkingResult {
  success: boolean
  content: string
  linksAdded: number
  keywordsMatched: string[]
  error?: string
}

/**
 * SEO-friendly keyword linking class with click tracking
 * Automatically converts keywords to affiliate links in HTML content
 */
export class KeywordLinker {
  private keywords: Keyword[] = []
  private linkCounts: Map<string, number> = new Map()
  
  constructor(private options: LinkingOptions) {}

  /**
   * Initialize the linker by loading active keywords
   */
  async initialize(): Promise<boolean> {
    try {
      const result = await getActiveKeywords()
      
      if (result.success && result.keywords) {
        // Sort by weight (descending) and keyword length (longer first for better matching)
        this.keywords = result.keywords
          .filter(k => k.status === 'active')
          .sort((a, b) => {
            if (a.weight !== b.weight) {
              return b.weight - a.weight // Higher weight first
            }
            return b.keyword.length - a.keyword.length // Longer keywords first
          })
        
        console.log(`✅ Loaded ${this.keywords.length} active keywords for linking`)
        return true
      }
      
      console.error('❌ Failed to load keywords:', result.error)
      return false
    } catch (error) {
      console.error('❌ Error initializing keyword linker:', error)
      return false
    }
  }

  /**
   * Process HTML content and add affiliate links
   */
  async processContent(htmlContent: string): Promise<LinkingResult> {
    try {
      if (this.keywords.length === 0) {
        const initialized = await this.initialize()
        if (!initialized) {
          return {
            success: false,
            content: htmlContent,
            linksAdded: 0,
            keywordsMatched: [],
            error: 'Failed to initialize keywords'
          }
        }
      }

      let processedContent = htmlContent
      let linksAdded = 0
      const keywordsMatched: string[] = []
      this.linkCounts.clear()

      // Process each keyword
      for (const keyword of this.keywords) {
        const linkResult = this.linkKeywordInContent(
          processedContent, 
          keyword
        )
        
        if (linkResult.linksAdded > 0) {
          processedContent = linkResult.content
          linksAdded += linkResult.linksAdded
          keywordsMatched.push(keyword.keyword)
          
          console.log(`🔗 Linked "${keyword.keyword}" ${linkResult.linksAdded} times`)
        }
      }

      return {
        success: true,
        content: processedContent,
        linksAdded,
        keywordsMatched,
      }
    } catch (error) {
      console.error('❌ Error processing content:', error)
      return {
        success: false,
        content: htmlContent,
        linksAdded: 0,
        keywordsMatched: [],
        error: 'Failed to process content'
      }
    }
  }

  /**
   * Link a specific keyword in content with SEO best practices
   */
  private linkKeywordInContent(content: string, keyword: Keyword): {
    content: string
    linksAdded: number
  } {
    const maxHits = keyword.max_hits_per_page
    let linksAdded = 0
    
    if (maxHits <= 0) {
      return { content, linksAdded: 0 }
    }

    // Create case-insensitive regex that avoids existing links and preserves word boundaries
    const keywordRegex = new RegExp(
      `\\b(${this.escapeRegex(keyword.keyword)})\\b`,
      'gi'
    )

    // Split content by HTML tags to avoid linking inside existing links or attributes
    const parts = content.split(/(<[^>]*>)/g)
    let insideLink = false
    let linkDepth = 0

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      
      // Check if we're entering or leaving a link tag
      if (part.match(/<a\b[^>]*>/i)) {
        insideLink = true
        linkDepth++
        continue
      } else if (part.match(/<\/a>/i)) {
        linkDepth--
        if (linkDepth <= 0) {
          insideLink = false
          linkDepth = 0
        }
        continue
      } else if (part.match(/^<[^>]*>$/)) {
        // Skip other HTML tags
        continue
      }

      // Only process text content that's not inside a link
      if (!insideLink && linksAdded < maxHits) {
        let matches = 0
        parts[i] = part.replace(keywordRegex, (match) => {
          if (matches >= maxHits - linksAdded) {
            return match // Don't link if we've hit the limit
          }
          
          matches++
          linksAdded++

          // Create SEO-friendly affiliate link with tracking
          const trackingUrl = this.createTrackingUrl(keyword, match)
          const linkAttributes = this.buildLinkAttributes(keyword)
          
          return `<a href="${trackingUrl}"${linkAttributes}>${match}</a>`
        })
      }

      // Stop if we've reached the maximum hits for this keyword
      if (linksAdded >= maxHits) {
        break
      }
    }

    return {
      content: parts.join(''),
      linksAdded
    }
  }

  /**
   * Create tracking URL for click analytics
   */
  private createTrackingUrl(keyword: Keyword, matchedText: string): string {
    if (!this.options.trackClicks) {
      return keyword.affiliate_url
    }

    // Add tracking parameters while preserving existing URL structure
    const url = new URL(keyword.affiliate_url)
    url.searchParams.set('mh_keyword', keyword.id)
    url.searchParams.set('mh_article', this.options.articleId)
    url.searchParams.set('mh_match', encodeURIComponent(matchedText))
    
    return url.toString()
  }

  /**
   * Build SEO-friendly link attributes
   */
  private buildLinkAttributes(keyword: Keyword): string {
    const attributes: string[] = []
    
    // Add rel attributes for SEO and affiliate disclosure
    const relValues: string[] = []
    
    if (this.options.addNoFollowRel !== false) {
      relValues.push('nofollow') // Don't pass SEO juice to affiliate links
    }
    
    relValues.push('sponsored') // Indicate this is a sponsored/affiliate link
    relValues.push('noopener') // Security best practice
    
    if (relValues.length > 0) {
      attributes.push(`rel="${relValues.join(' ')}"`)
    }
    
    // Add target="_blank" for affiliate links (opens in new tab)
    attributes.push('target="_blank"')
    
    // Add data attributes for tracking and identification
    attributes.push(`data-keyword-id="${keyword.id}"`)
    attributes.push(`data-category="${keyword.category}"`)
    attributes.push(`data-mh-affiliate="true"`)
    
    // Add title for accessibility and SEO
    attributes.push(`title="Affiliate link: ${keyword.keyword}"`)
    
    return attributes.length > 0 ? ' ' + attributes.join(' ') : ''
  }

  /**
   * Escape special regex characters in keyword
   */
  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * Track a keyword click (called from client-side)
   */
  static async trackClick(
    keywordId: string, 
    articleId: string,
    metadata?: {
      ip_address?: string
      user_agent?: string
      referrer?: string
    }
  ): Promise<boolean> {
    try {
      const result = await trackKeywordClick(keywordId, articleId, metadata)
      return result.success
    } catch (error) {
      console.error('❌ Error tracking keyword click:', error)
      return false
    }
  }
}

/**
 * Convenient function to process article content with keyword linking
 */
export async function processArticleContent(
  articleId: string,
  htmlContent: string,
  options?: Partial<LinkingOptions>
): Promise<LinkingResult> {
  const linker = new KeywordLinker({
    articleId,
    maxLinksPerKeyword: true,
    respectCaseSensitive: false,
    excludeExistingLinks: true,
    addNoFollowRel: true,
    trackClicks: true,
    ...options
  })

  return await linker.processContent(htmlContent)
}

/**
 * Client-side click tracking handler
 * Add this to your article pages to track affiliate link clicks
 */
export function initializeClickTracking(articleId: string) {
  if (typeof window === 'undefined') return // Server-side only

  // Track clicks on affiliate links
  document.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement
    const link = target.closest('a[data-mh-affiliate="true"]')
    
    if (link) {
      const keywordId = link.getAttribute('data-keyword-id')
      
      if (keywordId) {
        // Track the click asynchronously (don't block navigation)
        KeywordLinker.trackClick(keywordId, articleId, {
          user_agent: navigator.userAgent,
          referrer: document.referrer
        }).catch(error => {
          console.warn('Failed to track affiliate click:', error)
        })
        
        console.log(`📊 Tracked affiliate click for keyword: ${keywordId}`)
      }
    }
  })
} 