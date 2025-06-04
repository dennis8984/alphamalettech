import { getAllArticles } from './articles-db';

interface InternalLink {
  text: string
  url: string
  title: string
  relevanceScore: number
  context: string
}

interface InternalLinkResult {
  originalText: string
  linkedText: string
  linksAdded: InternalLink[]
}

export class InternalLinkOptimizer {
  
  /**
   * Find and add internal links to article content
   */
  static async optimizeInternalLinks(
    content: string, 
    currentArticleSlug: string,
    targetLinkCount: number = 2
  ): Promise<InternalLinkResult> {
    console.log('🔗 Optimizing internal links...');
    
    const availableArticles = await this.getAvailableArticles(currentArticleSlug);
    const linkOpportunities = this.findLinkOpportunities(content, availableArticles);
    const bestLinks = this.selectBestLinks(linkOpportunities, targetLinkCount);
    
    let updatedContent = content;
    const addedLinks: InternalLink[] = [];

    for (const link of bestLinks) {
      // Replace the first occurrence of the text with a link
      const linkHtml = `<a href="/articles/${link.url}" class="text-red-600 hover:text-red-800 underline font-medium">${link.text}</a>`;
      updatedContent = updatedContent.replace(link.text, linkHtml);
      addedLinks.push(link);
      console.log(`✅ Added internal link: ${link.text} → ${link.url}`);
    }

    return {
      originalText: content,
      linkedText: updatedContent,
      linksAdded: addedLinks
    };
  }

  /**
   * Get available articles for linking (excluding current article)
   */
  private static async getAvailableArticles(currentSlug: string) {
    const { data: articles } = await getAllArticles();
    
    if (!articles) {
      console.warn('No articles found for internal linking');
      return [];
    }

    return articles
      .filter(article => 
        article.status === 'published' && 
        article.slug !== currentSlug
      )
      .map(article => ({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category,
        tags: article.tags || []
      }));
  }

  /**
   * Find potential link opportunities in content
   */
  private static findLinkOpportunities(content: string, availableArticles: any[]): InternalLink[] {
    const opportunities: InternalLink[] = [];
    
    for (const article of availableArticles) {
      const linkOpps = this.findLinksForArticle(content, article);
      opportunities.push(...linkOpps);
    }

    return opportunities.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Find linking opportunities for a specific article
   */
  private static findLinksForArticle(content: string, article: any): InternalLink[] {
    const opportunities: InternalLink[] = [];
    
    // Extract keywords from article title
    const titleKeywords = this.extractKeywords(article.title);
    
    // Extract keywords from article excerpt
    const excerptKeywords = this.extractKeywords(article.excerpt);
    
    // Combine all keywords
    const allKeywords = [...titleKeywords, ...excerptKeywords, ...article.tags];
    
    for (const keyword of allKeywords) {
      const matches = this.findKeywordInContent(content, keyword);
      
      for (const match of matches) {
        opportunities.push({
          text: match.text,
          url: article.slug,
          title: article.title,
          relevanceScore: this.calculateRelevanceScore(match, article, content),
          context: match.context
        });
      }
    }

    return opportunities;
  }

  /**
   * Extract meaningful keywords from text
   */
  private static extractKeywords(text: string): string[] {
    if (!text) return [];
    
    // Remove common words and extract meaningful terms
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
      'your', 'you', 'how', 'ways', 'tips', 'guide', 'best', 'top', 'complete'
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !commonWords.has(word) &&
        !/^\d+$/.test(word) // Remove pure numbers
      );

    // Also extract meaningful phrases (2-3 words)
    const phrases: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      const twoWord = `${words[i]} ${words[i + 1]}`;
      if (twoWord.length > 8) {
        phrases.push(twoWord);
      }
      
      if (i < words.length - 2) {
        const threeWord = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        if (threeWord.length > 12) {
          phrases.push(threeWord);
        }
      }
    }

    return [...words, ...phrases];
  }

  /**
   * Find keyword matches in content
   */
  private static findKeywordInContent(content: string, keyword: string): Array<{text: string, context: string, position: number}> {
    const matches: Array<{text: string, context: string, position: number}> = [];
    const lowerContent = content.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    
    let startIndex = 0;
    let index = lowerContent.indexOf(lowerKeyword, startIndex);
    
    while (index !== -1) {
      // Get the actual text (preserving case)
      const actualText = content.substring(index, index + keyword.length);
      
      // Get surrounding context (50 chars on each side)
      const contextStart = Math.max(0, index - 50);
      const contextEnd = Math.min(content.length, index + keyword.length + 50);
      const context = content.substring(contextStart, contextEnd);
      
      // Check if this is a good linking opportunity
      if (this.isGoodLinkOpportunity(content, index, keyword)) {
        matches.push({
          text: actualText,
          context: context,
          position: index
        });
      }
      
      startIndex = index + 1;
      index = lowerContent.indexOf(lowerKeyword, startIndex);
    }

    return matches;
  }

  /**
   * Check if a position is good for linking
   */
  private static isGoodLinkOpportunity(content: string, position: number, keyword: string): boolean {
    // Don't link if already inside a link
    const beforeLink = content.lastIndexOf('<a', position);
    const beforeCloseLink = content.lastIndexOf('</a>', position);
    if (beforeLink > beforeCloseLink) {
      return false;
    }

    // Don't link if inside HTML tags
    const beforeTag = content.lastIndexOf('<', position);
    const beforeCloseTag = content.lastIndexOf('>', position);
    if (beforeTag > beforeCloseTag) {
      return false;
    }

    // Don't link if in headers (h1, h2, etc.)
    const headerPattern = /<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi;
    const headerMatches = content.matchAll(headerPattern);
    for (const match of headerMatches) {
      if (match.index !== undefined && 
          position >= match.index && 
          position < match.index + match[0].length) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate relevance score for a link opportunity
   */
  private static calculateRelevanceScore(
    match: {text: string, context: string, position: number}, 
    article: any, 
    content: string
  ): number {
    let score = 0;

    // Base score for keyword match
    score += 10;

    // Boost for exact title matches
    if (match.text.toLowerCase() === article.title.toLowerCase()) {
      score += 50;
    }

    // Boost for longer matches (phrases)
    if (match.text.split(' ').length > 1) {
      score += 20;
    }

    // Boost for position in content (earlier is better)
    const relativePosition = match.position / content.length;
    if (relativePosition < 0.3) {
      score += 15; // Early in article
    } else if (relativePosition < 0.7) {
      score += 10; // Middle of article
    } else {
      score += 5; // Later in article
    }

    // Boost for category relevance
    const contentLower = content.toLowerCase();
    if (contentLower.includes(article.category.toLowerCase())) {
      score += 15;
    }

    // Penalize if the keyword appears too frequently (avoid over-linking)
    const keywordCount = (content.toLowerCase().match(new RegExp(match.text.toLowerCase(), 'g')) || []).length;
    if (keywordCount > 3) {
      score -= 10;
    }

    return score;
  }

  /**
   * Select the best links to add
   */
  private static selectBestLinks(opportunities: InternalLink[], targetCount: number): InternalLink[] {
    const selected: InternalLink[] = [];
    const usedUrls = new Set<string>();
    const usedTexts = new Set<string>();

    for (const opportunity of opportunities) {
      if (selected.length >= targetCount) break;
      
      // Don't link to the same article twice
      if (usedUrls.has(opportunity.url)) continue;
      
      // Don't link the same text twice
      if (usedTexts.has(opportunity.text.toLowerCase())) continue;
      
      // Only include high-relevance opportunities
      if (opportunity.relevanceScore < 15) continue;
      
      selected.push(opportunity);
      usedUrls.add(opportunity.url);
      usedTexts.add(opportunity.text.toLowerCase());
    }

    return selected;
  }

  /**
   * Generate prompt for manual internal linking
   */
  static async generateInternalLinkPrompt(content: string, currentSlug: string): Promise<string> {
    const availableArticles = await this.getAvailableArticles(currentSlug);
    const recentArticles = availableArticles.slice(0, 20); // Show top 20 for context

    return `
TASK: Add 2 strategic internal links to this article content.

ARTICLE CONTENT:
${content}

AVAILABLE ARTICLES TO LINK TO:
${recentArticles.map((article, index) => 
  `${index + 1}. "${article.title}" (/articles/${article.slug})
     Category: ${article.category}
     Description: ${article.excerpt.substring(0, 100)}...`
).join('\n')}

INSTRUCTIONS:
1. Analyze the article content for natural linking opportunities
2. Find 2 places where you can add contextually relevant links to other articles
3. Choose links that provide additional value to readers
4. Use keyword-rich anchor text that flows naturally

LINKING STRATEGY:
- Link to articles that expand on concepts mentioned
- Use related topics from the same or complementary categories  
- Place links where they enhance the reader's understanding
- Avoid forced or awkward link placement

REQUIREMENTS:
- Links should feel natural and helpful
- Use relevant anchor text (not just "click here")
- Link to articles that complement the current content
- Ensure links add value for the reader's journey

OUTPUT FORMAT:
1. **Link 1:**
   - Anchor text: [exact text to be linked]
   - Target article: [article title and URL]
   - Placement context: [surrounding sentence]
   - Reasoning: [why this link adds value]

2. **Link 2:**
   - Anchor text: [exact text to be linked]
   - Target article: [article title and URL]
   - Placement context: [surrounding sentence]
   - Reasoning: [why this link adds value]
`;
  }

  /**
   * Get internal linking suggestions for content
   */
  static async getLinkingSuggestions(content: string, currentSlug: string): Promise<InternalLink[]> {
    const result = await this.optimizeInternalLinks(content, currentSlug, 5);
    return result.linksAdded;
  }
} 