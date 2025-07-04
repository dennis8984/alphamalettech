interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  featured_image: string
  slug: string
}

interface SocialContent {
  text: string
  hashtags: string[]
  media_url?: string
  link: string
}

export class SocialContentFormatter {
  private baseUrl: string

  constructor(baseUrl: string = 'https://www.menshb.com') {
    this.baseUrl = baseUrl
  }

  /**
   * Format content for Facebook
   */
  formatForFacebook(article: Article): SocialContent {
    // Facebook allows longer posts, include full excerpt
    const title = this.cleanTitle(article.title)
    const excerpt = this.cleanExcerpt(article.excerpt, 200)
    const link = this.generateTrackingLink(article.slug, 'facebook')
    
    // Facebook best practices: question or engaging statement
    const hooks = [
      `💪 ${title}`,
      `Did you know? ${excerpt}`,
      `New on Men's Hub: ${title}`,
      `Transform your ${article.category} game! ${title}`,
      `🎯 ${title}\n\n${excerpt}`
    ]
    
    const text = this.selectRandomHook(hooks) + `\n\nRead more: ${link}`
    
    const hashtags = this.generateHashtags(article, 5, 'facebook')
    
    return {
      text: text + '\n\n' + hashtags.join(' '),
      hashtags,
      media_url: article.featured_image,
      link
    }
  }

  /**
   * Format content for Reddit
   */
  formatForReddit(article: Article, subreddit: string = 'fitness'): SocialContent {
    // Reddit prefers natural titles without emojis or hashtags
    const title = this.cleanTitle(article.title)
    const link = this.generateTrackingLink(article.slug, 'reddit')
    
    // Reddit-specific formatting based on subreddit
    const templates: Record<string, string[]> = {
      fitness: [
        `${title} - Science-backed guide for men`,
        `[Article] ${title}`,
        `New guide: ${title} (with research citations)`,
        `${title} - What actually works`
      ],
      nutrition: [
        `${title} - Evidence-based nutrition for men`,
        `[Nutrition Guide] ${title}`,
        `${title} - Practical meal planning tips`,
        `Science says: ${title}`
      ],
      menshealth: [
        `${title} - Comprehensive guide`,
        `[Men's Health] ${title}`,
        `${title} - Expert advice and tips`,
        `Guide: ${title}`
      ]
    }
    
    const titleTemplates = templates[subreddit] || templates.fitness
    const redditTitle = this.selectRandomHook(titleTemplates)
    
    // Reddit doesn't use hashtags
    return {
      text: redditTitle,
      hashtags: [],
      link,
      media_url: undefined // Reddit will pull preview from link
    }
  }

  /**
   * Format content for X/Twitter
   */
  formatForTwitter(article: Article): SocialContent {
    // Twitter has 280 character limit
    const title = this.truncateTitle(article.title, 100)
    const link = this.generateTrackingLink(article.slug, 'twitter')
    const hashtags = this.generateHashtags(article, 3, 'twitter')
    
    // Calculate remaining characters for text
    const linkLength = 23 // Twitter shortens all links to ~23 chars
    const hashtagsLength = hashtags.join(' ').length
    const availableChars = 280 - linkLength - hashtagsLength - 4 // spaces and newlines
    
    // Twitter engagement hooks
    const hooks = [
      `💪 ${title}`,
      `New: ${title}`,
      `${this.getEmoji(article.category)} ${title}`,
      `Just published: ${title}`,
      `${title} 🔥`
    ]
    
    let text = this.selectRandomHook(hooks)
    
    // Truncate if needed
    if (text.length > availableChars) {
      text = text.substring(0, availableChars - 3) + '...'
    }
    
    const fullText = `${text}\n\n${link}\n\n${hashtags.join(' ')}`
    
    return {
      text: fullText,
      hashtags,
      media_url: article.featured_image,
      link
    }
  }

  /**
   * Format content for Instagram
   */
  formatForInstagram(article: Article): SocialContent {
    // Instagram allows up to 2,200 characters
    const title = this.cleanTitle(article.title)
    const excerpt = this.cleanExcerpt(article.excerpt, 150)
    const link = this.generateTrackingLink(article.slug, 'instagram')
    const hashtags = this.generateHashtags(article, 20, 'instagram') // Instagram allows up to 30
    
    // Instagram engagement format with emojis
    const templates = [
      `${this.getEmoji(article.category)} ${title}\n\n${excerpt}\n\n✅ Swipe up for the full guide (link in bio)`,
      `NEW POST 🚨\n\n${title}\n\n${excerpt}\n\n👉 Full article link in bio`,
      `${title} 💯\n\n${excerpt}\n\n📖 Read more: Check our bio link`,
      `Transform your ${article.category} game! 🎯\n\n${title}\n\n${excerpt}\n\n🔗 Link in bio for full article`
    ]
    
    const text = this.selectRandomHook(templates)
    
    // Instagram posts need line breaks between content and hashtags
    const fullText = `${text}\n.\n.\n.\n${hashtags.join(' ')}`
    
    return {
      text: fullText,
      hashtags,
      media_url: article.featured_image, // Required for Instagram
      link // Will be in bio, not in post
    }
  }

  /**
   * Generate platform-specific hashtags
   */
  private generateHashtags(article: Article, maxCount: number, platform: string): string[] {
    const hashtags: string[] = []
    
    // Category hashtag
    hashtags.push(`#${article.category.toLowerCase().replace(/\s+/g, '')}`);
    
    // Platform-specific popular hashtags
    const platformHashtags: Record<string, string[]> = {
      facebook: ['#MensHealth', '#FitnessMotivation', '#HealthyLiving', '#WorkoutTips', '#Nutrition'],
      twitter: ['#MensHealth', '#Fitness', '#Health'],
      instagram: [
        '#MensHealth', '#FitnessMotivation', '#GymLife', '#HealthyLifestyle', 
        '#WorkoutMotivation', '#FitnessTips', '#NutritionTips', '#MensFitness',
        '#HealthyLiving', '#FitnessJourney', '#GymMotivation', '#FitLife',
        '#TrainHard', '#HealthyChoices', '#FitnessGoals', '#StayFit'
      ],
      reddit: [] // Reddit doesn't use hashtags
    }
    
    // Add platform-specific hashtags
    const availableHashtags = platformHashtags[platform] || []
    const selectedPlatformTags = this.selectRandom(availableHashtags, Math.min(5, maxCount - hashtags.length))
    hashtags.push(...selectedPlatformTags)
    
    // Extract hashtags from article tags
    if (article.tags && article.tags.length > 0) {
      const tagHashtags = article.tags
        .slice(0, maxCount - hashtags.length)
        .map(tag => `#${tag.toLowerCase().replace(/\s+/g, '')}`)
      hashtags.push(...tagHashtags)
    }
    
    // Ensure uniqueness and limit
    return [...new Set(hashtags)].slice(0, maxCount)
  }

  /**
   * Generate tracking link
   */
  private generateTrackingLink(slug: string, platform: string): string {
    // This will be replaced with actual short URL from tracking system
    return `${this.baseUrl}/articles/${slug}?utm_source=${platform}&utm_medium=social&utm_campaign=auto`
  }

  /**
   * Clean and format title
   */
  private cleanTitle(title: string): string {
    return title
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Clean and truncate excerpt
   */
  private cleanExcerpt(excerpt: string, maxLength: number): string {
    const cleaned = excerpt
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ')
      .trim()
    
    if (cleaned.length <= maxLength) {
      return cleaned
    }
    
    return cleaned.substring(0, maxLength - 3) + '...'
  }

  /**
   * Truncate title for character-limited platforms
   */
  private truncateTitle(title: string, maxLength: number): string {
    const cleaned = this.cleanTitle(title)
    if (cleaned.length <= maxLength) {
      return cleaned
    }
    return cleaned.substring(0, maxLength - 3) + '...'
  }

  /**
   * Select random element from array
   */
  private selectRandomHook(hooks: string[]): string {
    return hooks[Math.floor(Math.random() * hooks.length)]
  }

  /**
   * Select multiple random elements from array
   */
  private selectRandom(array: string[], count: number): string[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  /**
   * Get emoji for category
   */
  private getEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
      fitness: '💪',
      nutrition: '🥗',
      health: '❤️',
      'weight-loss': '⚖️',
      style: '👔',
      entertainment: '🎬',
      lifestyle: '🌟',
      default: '📖'
    }
    
    return emojiMap[category.toLowerCase()] || emojiMap.default
  }

  /**
   * Generate A/B test variants
   */
  generateABTestVariants(article: Article, platform: string): { variantA: SocialContent; variantB: SocialContent } {
    // Generate two different versions for A/B testing
    let variantA: SocialContent
    let variantB: SocialContent
    
    switch (platform) {
      case 'facebook':
        // Test different hooks
        variantA = this.formatForFacebook(article)
        variantB = this.formatForFacebook(article)
        // Ensure variants are different
        while (variantA.text === variantB.text) {
          variantB = this.formatForFacebook(article)
        }
        break
        
      case 'twitter':
        // Test with/without emojis or different hashtag counts
        variantA = this.formatForTwitter(article)
        const tempArticle = { ...article }
        tempArticle.tags = tempArticle.tags.slice(0, 1) // Fewer hashtags
        variantB = this.formatForTwitter(tempArticle)
        break
        
      case 'instagram':
        // Test different CTA styles
        variantA = this.formatForInstagram(article)
        variantB = this.formatForInstagram(article)
        while (variantA.text === variantB.text) {
          variantB = this.formatForInstagram(article)
        }
        break
        
      default:
        variantA = this.formatForFacebook(article)
        variantB = this.formatForFacebook(article)
    }
    
    return { variantA, variantB }
  }

  /**
   * Validate content meets platform requirements
   */
  validateContent(content: SocialContent, platform: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    switch (platform) {
      case 'twitter':
        if (content.text.length > 280) {
          errors.push('Text exceeds 280 character limit')
        }
        if (content.hashtags.length > 3) {
          errors.push('Too many hashtags (max 3 recommended)')
        }
        break
        
      case 'instagram':
        if (!content.media_url) {
          errors.push('Instagram requires an image')
        }
        if (content.hashtags.length > 30) {
          errors.push('Too many hashtags (max 30)')
        }
        if (content.text.length > 2200) {
          errors.push('Caption exceeds 2,200 character limit')
        }
        break
        
      case 'reddit':
        if (content.text.length > 300) {
          errors.push('Title too long for Reddit (max 300 chars)')
        }
        if (content.hashtags.length > 0) {
          errors.push('Reddit does not use hashtags')
        }
        break
        
      case 'facebook':
        if (content.text.length > 63206) {
          errors.push('Text exceeds Facebook limit')
        }
        break
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const contentFormatter = new SocialContentFormatter()