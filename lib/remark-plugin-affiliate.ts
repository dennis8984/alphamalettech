import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root, Text } from 'mdast'

interface KeywordLink {
  id: string
  keyword: string
  affiliateUrl: string
  maxHitsPerPage: number
  active: boolean
  category: string
  weight: number
}

interface AffiliatePluginOptions {
  keywords?: KeywordLink[]
  articleId?: string
  maxLinksPerKeyword?: boolean
  respectCaseSensitive?: boolean
  excludeExistingLinks?: boolean
  addNoFollowRel?: boolean
  trackClicks?: boolean
}

/**
 * Remark plugin that automatically converts keywords to affiliate links in MDX content
 * Processes the AST during next-mdx-remote serialization for optimal performance
 */
export const remarkPluginAffiliate: Plugin<[AffiliatePluginOptions], Root> = (options: AffiliatePluginOptions = {}) => {
  const keywords = options.keywords || []
  const articleId = options.articleId || ''
  const maxLinksPerKeyword = options.maxLinksPerKeyword ?? true
  const respectCaseSensitive = options.respectCaseSensitive ?? false
  const excludeExistingLinks = options.excludeExistingLinks ?? true
  const addNoFollowRel = options.addNoFollowRel ?? true
  const trackClicks = options.trackClicks ?? true

  return (tree: Root) => {
    if (!keywords.length) {
      console.warn('🚨 No keywords provided to remark-plugin-affiliate')
      return tree
    }

    console.log(`🔗 Processing ${keywords.length} keywords for article: ${articleId}`)

    // Track link counts per keyword
    const linkCounts = new Map<string, number>()
    let totalLinksAdded = 0

    // Sort keywords by weight (higher weight = processed first)
    const sortedKeywords = [...keywords]
      .filter(k => k.active)
      .sort((a, b) => b.weight - a.weight)

    // Visit all text nodes in the AST
    visit(tree, 'text', (node: Text, index: number | undefined, parent: any) => {
      if (!parent || !node.value || index === undefined) return

      // Skip if we're inside an existing link
      if (excludeExistingLinks && isInsideLink(parent)) {
        return
      }

      let modifiedText = node.value
      let hasChanges = false

      // Process each keyword
      for (const keyword of sortedKeywords) {
        const currentCount = linkCounts.get(keyword.id) || 0
        
        // Check if we've reached the max hits for this keyword
        if (maxLinksPerKeyword && currentCount >= keyword.maxHitsPerPage) {
          continue
        }

        // Create regex for keyword matching
        const flags = respectCaseSensitive ? 'g' : 'gi'
        const keywordRegex = new RegExp(`\\b(${escapeRegex(keyword.keyword)})\\b`, flags)

        // Find matches in the current text
        const matches = Array.from(modifiedText.matchAll(keywordRegex)) as RegExpMatchArray[]
        
        if (matches.length === 0) continue

        // Process matches in reverse order to maintain string positions
        for (let i = matches.length - 1; i >= 0; i--) {
          const match = matches[i] as RegExpMatchArray
          const remainingHits = keyword.maxHitsPerPage - currentCount
          
          if (maxLinksPerKeyword && remainingHits <= 0) break

          // Replace the match with a link marker
          const linkId = `__AFFILIATE_LINK_${keyword.id}_${totalLinksAdded}__`
          const matchStart = match.index!
          const matchEnd = matchStart + match[0].length

          modifiedText = 
            modifiedText.slice(0, matchStart) + 
            linkId + 
            modifiedText.slice(matchEnd)

          // Track the link
          linkCounts.set(keyword.id, currentCount + 1)
          totalLinksAdded++
          hasChanges = true

          console.log(`🔗 Marked "${keyword.keyword}" for linking (${currentCount + 1}/${keyword.maxHitsPerPage})`)
          
          // Store link data for later processing
          if (!(tree as any).data) (tree as any).data = {}
          if (!(tree as any).data.affiliateLinks) (tree as any).data.affiliateLinks = new Map<string, any>()
          
          const affiliateLinksMap = (tree as any).data.affiliateLinks as Map<string, any>
          affiliateLinksMap.set(linkId, {
            keyword,
            matchedText: match[0],
            articleId,
            linkAttributes: buildLinkAttributes(keyword, addNoFollowRel, trackClicks)
          })

          if (maxLinksPerKeyword && linkCounts.get(keyword.id)! >= keyword.maxHitsPerPage) {
            break
          }
        }
      }

      // Update the text node if we made changes
      if (hasChanges) {
        node.value = modifiedText
      }
    })

    // Second pass: convert link markers to actual HTML elements
    visit(tree, 'text', (node: Text, index: number | undefined, parent: any) => {
      if (!node.value || !(tree as any).data?.affiliateLinks || index === undefined) return

      const linkMarkers = Array.from(node.value.matchAll(/__AFFILIATE_LINK_([^_]+)_(\d+)__/g)) as RegExpMatchArray[]
      
      if (linkMarkers.length === 0) return

      // Split text and create new nodes
      const newNodes: any[] = []
      let lastEnd = 0

      for (const marker of linkMarkers) {
        const linkId = marker[0] as string
        const affiliateLinksMap = (tree as any).data.affiliateLinks as Map<string, any>
        const linkData = affiliateLinksMap.get(linkId)
        
        if (!linkData) continue

        const markerStart = marker.index!
        const markerEnd = markerStart + marker[0].length

        // Add text before the marker
        if (markerStart > lastEnd) {
          const textBefore = node.value.slice(lastEnd, markerStart)
          if (textBefore) {
            newNodes.push({
              type: 'text',
              value: textBefore
            })
          }
        }

        // Add the affiliate link
        const trackingUrl = createTrackingUrl(linkData.keyword, linkData.matchedText, linkData.articleId, trackClicks)
        
        newNodes.push({
          type: 'link',
          url: trackingUrl,
          title: linkData.linkAttributes.title,
          data: {
            hProperties: {
              ...linkData.linkAttributes,
              href: trackingUrl
            }
          },
          children: [{
            type: 'text',
            value: linkData.matchedText
          }]
        })

        lastEnd = markerEnd
      }

      // Add remaining text
      if (lastEnd < node.value.length) {
        const textAfter = node.value.slice(lastEnd)
        if (textAfter) {
          newNodes.push({
            type: 'text',
            value: textAfter
          })
        }
      }

      // Replace the current node with the new nodes
      if (newNodes.length > 0 && parent && index !== undefined) {
        parent.children.splice(index, 1, ...newNodes)
      }
    })

    console.log(`✅ Affiliate linking complete: ${totalLinksAdded} links added`)
    return tree
  }
}

/**
 * Helper function to check if a node is inside an existing link
 */
function isInsideLink(node: any): boolean {
  if (!node) return false
  
  if (node.type === 'element' && node.tagName === 'a') {
    return true
  }
  
  return isInsideLink(node.parent)
}

/**
 * Escape special regex characters in keyword
 */
function escapeRegex(keyword: string): string {
  return keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Build link attributes for affiliate links
 */
function buildLinkAttributes(
  keyword: KeywordLink,
  addNoFollowRel: boolean,
  trackClicks: boolean
): Record<string, any> {
  const attributes: Record<string, any> = {}
  
  // Add rel attributes for SEO and affiliate disclosure
  const relValues: string[] = []
  
  if (addNoFollowRel) {
    relValues.push('nofollow') // Don't pass SEO juice to affiliate links
  }
  
  relValues.push('sponsored') // Indicate this is a sponsored/affiliate link
  relValues.push('noopener') // Security best practice
  
  if (relValues.length > 0) {
    attributes.rel = relValues.join(' ')
  }
  
  // Add target="_blank" for affiliate links (opens in new tab)
  attributes.target = '_blank'
  
  // Add data attributes for tracking and identification
  if (trackClicks) {
    attributes['data-keyword-id'] = keyword.id
    attributes['data-category'] = keyword.category
    attributes['data-mh-affiliate'] = 'true'
  }
  
  // Add title for accessibility and SEO
  attributes.title = `Affiliate link: ${keyword.keyword}`
  
  return attributes
}

/**
 * Create tracking URL for affiliate links
 */
function createTrackingUrl(
  keyword: KeywordLink,
  matchedText: string,
  articleId: string,
  trackClicks: boolean
): string {
  if (!trackClicks) {
    return keyword.affiliateUrl
  }

  try {
    // Add tracking parameters while preserving existing URL structure
    const url = new URL(keyword.affiliateUrl)
    url.searchParams.set('mh_keyword', keyword.id)
    url.searchParams.set('mh_article', articleId)
    url.searchParams.set('mh_match', encodeURIComponent(matchedText))
    url.searchParams.set('mh_source', 'content_link')
    
    return url.toString()
  } catch (error) {
    console.warn(`⚠️ Invalid affiliate URL for keyword "${keyword.keyword}":`, error)
    return keyword.affiliateUrl
  }
}

/**
 * Default export for convenience
 */
export default remarkPluginAffiliate

/**
 * Factory function for creating the plugin with predefined keywords
 */
export function createAffiliatePlugin(keywords: KeywordLink[], articleId: string) {
  return (tree: Root) => {
    return remarkPluginAffiliate({
      keywords,
      articleId,
      maxLinksPerKeyword: true,
      respectCaseSensitive: false,
      excludeExistingLinks: true,
      addNoFollowRel: true,
      trackClicks: true
    })(tree)
  }
}

/**
 * Utility function to fetch keywords for a specific article/category
 */
export async function getKeywordsForArticle(category?: string): Promise<KeywordLink[]> {
  try {
    const response = await fetch('/api/admin/keywords', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch keywords')
    }

    const { keywords } = await response.json()
    
    // Filter by category if provided
    if (category) {
      return keywords.filter((k: KeywordLink) => 
        k.active && (k.category.toLowerCase() === category.toLowerCase() || k.category === 'General')
      )
    }
    
    return keywords.filter((k: KeywordLink) => k.active)
  } catch (error) {
    console.error('❌ Failed to fetch keywords for affiliate linking:', error)
    return []
  }
} 