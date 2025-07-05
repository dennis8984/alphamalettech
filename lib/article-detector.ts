import { createClient } from '@supabase/supabase-js'
import { addToSocialQueue } from './social-queue'
import { getActiveAutomationRules } from './social-automation-config'

interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  featured_image: string
  status: string
  created_at: string
  updated_at: string
}

export class ArticleDetector {
  private supabase: any
  private lastCheckTime: Date
  private isRunning: boolean = false
  private checkInterval: NodeJS.Timeout | null = null

  constructor() {
    this.lastCheckTime = new Date()
  }

  private getSupabase() {
    if (!this.supabase) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!url || !key) {
        throw new Error('Supabase credentials not configured')
      }
      
      this.supabase = createClient(url, key)
    }
    return this.supabase
  }

  /**
   * Start monitoring for new published articles
   */
  async startMonitoring(intervalMinutes: number = 5) {
    if (this.isRunning) {
      console.log('Article detector is already running')
      return
    }

    console.log(`Starting article detector with ${intervalMinutes} minute interval`)
    this.isRunning = true
    
    // Run immediately
    await this.checkForNewArticles()
    
    // Then run on interval
    this.checkInterval = setInterval(async () => {
      await this.checkForNewArticles()
    }, intervalMinutes * 60 * 1000)
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.isRunning = false
    console.log('Article detector stopped')
  }

  /**
   * Check for new published articles
   */
  private async checkForNewArticles() {
    try {
      console.log('Checking for new articles...')
      
      // Get articles published since last check
      const { data: newArticles, error } = await this.getSupabase()
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .gt('created_at', this.lastCheckTime.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching new articles:', error)
        return
      }

      if (!newArticles || newArticles.length === 0) {
        console.log('No new articles found')
        return
      }

      console.log(`Found ${newArticles.length} new articles`)

      // Process each new article
      for (const article of newArticles) {
        await this.processNewArticle(article)
      }

      // Update last check time
      this.lastCheckTime = new Date()
    } catch (error) {
      console.error('Error in article detection:', error)
    }
  }

  /**
   * Process a newly published article
   */
  private async processNewArticle(article: Article) {
    try {
      console.log(`Processing new article: ${article.title}`)

      // Check if article has already been posted to social media
      const { data: existingPosts } = await this.getSupabase()
        .from('social_posts')
        .select('platform')
        .eq('article_id', article.id)

      const postedPlatforms = existingPosts?.map((p: any) => p.platform) || []

      // Get active automation rules
      const rules = await getActiveAutomationRules()
      
      // Check which platforms should receive this article
      const platformsToPost = await this.determinePlatforms(article, rules, postedPlatforms)

      if (platformsToPost.length === 0) {
        console.log(`No platforms to post article: ${article.title}`)
        return
      }

      // Add to social queue for each platform
      for (const platform of platformsToPost) {
        const scheduledTime = await this.calculateScheduleTime(platform)
        await addToSocialQueue({
          article_id: article.id,
          platform,
          priority: this.calculatePriority(article),
          scheduled_for: scheduledTime
        })
      }

      console.log(`Added article to queue for platforms: ${platformsToPost.join(', ')}`)
    } catch (error) {
      console.error(`Error processing article ${article.id}:`, error)
    }
  }

  /**
   * Determine which platforms should receive the article
   */
  private async determinePlatforms(
    article: Article, 
    rules: any[], 
    postedPlatforms: string[]
  ): Promise<string[]> {
    const platforms = new Set<string>()

    // Check each automation rule
    for (const rule of rules) {
      if (this.matchesRule(article, rule)) {
        rule.platforms.forEach((platform: string) => {
          if (!postedPlatforms.includes(platform)) {
            platforms.add(platform)
          }
        })
      }
    }

    // Check if platforms are active
    const activePlatforms = await this.getActivePlatforms()
    return Array.from(platforms).filter(p => activePlatforms.includes(p))
  }

  /**
   * Check if article matches automation rule
   */
  private matchesRule(article: Article, rule: any): boolean {
    const conditions = rule.conditions

    // Check category
    if (conditions.categories && conditions.categories.length > 0) {
      if (!conditions.categories.includes(article.category)) {
        return false
      }
    }

    // Check keywords
    if (conditions.keywords && conditions.keywords.length > 0) {
      const articleText = `${article.title} ${article.excerpt} ${article.content}`.toLowerCase()
      const hasKeyword = conditions.keywords.some((keyword: string) => 
        articleText.includes(keyword.toLowerCase())
      )
      if (!hasKeyword) {
        return false
      }
    }

    // Check minimum word count
    if (conditions.min_word_count) {
      const wordCount = article.content.split(/\s+/).length
      if (wordCount < conditions.min_word_count) {
        return false
      }
    }

    // Check if article has featured image (required for Instagram)
    if (conditions.requires_image && !article.featured_image) {
      return false
    }

    return true
  }

  /**
   * Calculate priority for social posting
   */
  private calculatePriority(article: Article): number {
    let priority = 0

    // Higher priority for featured articles
    if (article.tags?.includes('featured')) {
      priority += 10
    }

    // Higher priority for certain categories
    const highPriorityCategories = ['fitness', 'nutrition', 'health']
    if (highPriorityCategories.includes(article.category)) {
      priority += 5
    }

    // Higher priority for longer articles (more substantial content)
    const wordCount = article.content.split(/\s+/).length
    if (wordCount > 1000) {
      priority += 3
    }

    return priority
  }

  /**
   * Calculate optimal schedule time for platform
   */
  private async calculateScheduleTime(platform: string): Promise<Date> {
    try {
      // Get next available schedule slot for platform
      const { data: schedules } = await this.getSupabase()
        .from('social_schedule')
        .select('*')
        .eq('platform', platform)
        .eq('is_active', true)
        .order('day_of_week', { ascending: true })
        .order('hour', { ascending: true })

      if (!schedules || schedules.length === 0) {
        // No schedule defined, post in 15 minutes
        return new Date(Date.now() + 15 * 60 * 1000)
      }

      // Find next available slot
      const now = new Date()
      const currentDay = now.getDay()
      const currentHour = now.getHours()

      for (const schedule of schedules) {
        const scheduledDate = this.getNextScheduledDate(
          schedule.day_of_week,
          schedule.hour,
          schedule.minute || 0,
          schedule.timezone
        )

        // Check if this slot is already taken
        const { data: existingPost } = await this.getSupabase()
          .from('social_posts')
          .select('id')
          .eq('platform', platform)
          .eq('scheduled_for', scheduledDate.toISOString())
          .single()

        if (!existingPost) {
          return scheduledDate
        }
      }

      // All slots taken, schedule for next available time
      return new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    } catch (error) {
      console.error('Error calculating schedule time:', error)
      return new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    }
  }

  /**
   * Get next occurrence of scheduled time
   */
  private getNextScheduledDate(
    dayOfWeek: number,
    hour: number,
    minute: number,
    timezone: string
  ): Date {
    const now = new Date()
    const targetDate = new Date()
    
    // Set target time
    targetDate.setHours(hour, minute, 0, 0)
    
    // Calculate days until target day
    const currentDay = now.getDay()
    let daysUntilTarget = dayOfWeek - currentDay
    
    // If target day is today but time has passed, schedule for next week
    if (daysUntilTarget === 0 && targetDate <= now) {
      daysUntilTarget = 7
    } else if (daysUntilTarget < 0) {
      daysUntilTarget += 7
    }
    
    targetDate.setDate(targetDate.getDate() + daysUntilTarget)
    
    return targetDate
  }

  /**
   * Get list of active platforms
   */
  private async getActivePlatforms(): Promise<string[]> {
    try {
      const { data: platforms } = await this.getSupabase()
        .from('social_platforms')
        .select('platform')
        .eq('is_active', true)

      return platforms?.map((p: any) => p.platform) || []
    } catch (error) {
      console.error('Error fetching active platforms:', error)
      return []
    }
  }

  /**
   * Manually trigger article detection for specific article
   */
  async detectArticle(articleId: string) {
    try {
      const { data: article, error } = await this.getSupabase()
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .eq('status', 'published')
        .single()

      if (error || !article) {
        console.error('Article not found or not published:', error)
        return false
      }

      await this.processNewArticle(article)
      return true
    } catch (error) {
      console.error('Error detecting article:', error)
      return false
    }
  }

  /**
   * Get detection status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheckTime: this.lastCheckTime,
      nextCheckTime: this.checkInterval ? 
        new Date(this.lastCheckTime.getTime() + 5 * 60 * 1000) : null
    }
  }
}

// Singleton instance
let detectorInstance: ArticleDetector | null = null

export function getArticleDetector(): ArticleDetector {
  if (!detectorInstance) {
    detectorInstance = new ArticleDetector()
  }
  return detectorInstance
}

// Article detector should be started manually when needed