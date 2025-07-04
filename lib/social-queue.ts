import { createClient } from '@supabase/supabase-js'
import { socialAPIManager } from './social-apis'
import { contentFormatter } from './social-content-formatter'

interface QueueItem {
  id: string
  article_id: string
  platform: string
  priority: number
  status: string
  attempts: number
  scheduled_for: string
  error_message?: string
}

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

export class SocialPostQueue {
  private supabase
  private isProcessing: boolean = false
  private processInterval: NodeJS.Timeout | null = null

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Start processing queue
   */
  async startProcessing(intervalSeconds: number = 60) {
    if (this.isProcessing) {
      console.log('Queue processor is already running')
      return
    }

    console.log(`Starting queue processor with ${intervalSeconds}s interval`)
    this.isProcessing = true

    // Process immediately
    await this.processQueue()

    // Then process on interval
    this.processInterval = setInterval(async () => {
      await this.processQueue()
    }, intervalSeconds * 1000)
  }

  /**
   * Stop processing queue
   */
  stopProcessing() {
    if (this.processInterval) {
      clearInterval(this.processInterval)
      this.processInterval = null
    }
    this.isProcessing = false
    console.log('Queue processor stopped')
  }

  /**
   * Process pending items in queue
   */
  private async processQueue() {
    try {
      console.log('Processing social media queue...')

      // Get pending items that are scheduled for now or past
      const { data: queueItems, error } = await this.supabase
        .from('social_post_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('scheduled_for', { ascending: true })
        .limit(10) // Process up to 10 items at a time

      if (error || !queueItems || queueItems.length === 0) {
        console.log('No items to process in queue')
        return
      }

      console.log(`Processing ${queueItems.length} queue items`)

      // Process each item
      for (const item of queueItems) {
        await this.processQueueItem(item)
      }
    } catch (error) {
      console.error('Queue processing error:', error)
    }
  }

  /**
   * Process a single queue item
   */
  private async processQueueItem(item: QueueItem) {
    try {
      console.log(`Processing queue item ${item.id} for ${item.platform}`)

      // Update status to processing
      await this.updateQueueItem(item.id, {
        status: 'processing',
        attempts: item.attempts + 1
      })

      // Get article details
      const { data: article, error: articleError } = await this.supabase
        .from('articles')
        .select('*')
        .eq('id', item.article_id)
        .single()

      if (articleError || !article) {
        throw new Error('Article not found')
      }

      // Generate tracking URL
      const trackingUrl = await this.generateTrackingUrl(item.article_id, article.slug, item.platform)

      // Format content for platform
      const socialContent = this.formatContent(article, item.platform)
      
      // Replace link with tracking URL
      socialContent.link = trackingUrl

      // Post to platform
      const result = await socialAPIManager.postToPlatform(item.platform, socialContent)

      if (result.success) {
        // Create social post record
        await this.createSocialPost({
          article_id: item.article_id,
          platform: item.platform,
          content: socialContent.text,
          media_urls: socialContent.media_url ? [socialContent.media_url] : [],
          hashtags: socialContent.hashtags,
          post_id: result.post_id,
          post_url: result.post_url,
          short_url: this.extractShortCode(trackingUrl),
          status: 'posted',
          posted_at: new Date().toISOString()
        })

        // Update queue item as completed
        await this.updateQueueItem(item.id, {
          status: 'completed',
          processed_at: new Date().toISOString()
        })

        console.log(`✅ Successfully posted to ${item.platform}`)
      } else {
        throw new Error(result.error || 'Failed to post')
      }
    } catch (error) {
      console.error(`Error processing queue item ${item.id}:`, error)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Check if we should retry
      if (item.attempts < 3) {
        // Schedule retry with exponential backoff
        const retryDelay = Math.pow(2, item.attempts) * 5 * 60 * 1000 // 5, 10, 20 minutes
        const nextRetry = new Date(Date.now() + retryDelay)

        await this.updateQueueItem(item.id, {
          status: 'pending',
          scheduled_for: nextRetry.toISOString(),
          error_message: errorMessage
        })

        console.log(`Scheduled retry for ${item.id} at ${nextRetry.toISOString()}`)
      } else {
        // Mark as failed after max attempts
        await this.updateQueueItem(item.id, {
          status: 'failed',
          error_message: errorMessage
        })

        // Create failed social post record
        await this.createSocialPost({
          article_id: item.article_id,
          platform: item.platform,
          content: '',
          status: 'failed',
          error_message: errorMessage
        })
      }
    }
  }

  /**
   * Format content for platform
   */
  private formatContent(article: Article, platform: string) {
    switch (platform) {
      case 'facebook':
        return contentFormatter.formatForFacebook(article)
      case 'twitter':
        return contentFormatter.formatForTwitter(article)
      case 'reddit':
        return contentFormatter.formatForReddit(article)
      case 'instagram':
        return contentFormatter.formatForInstagram(article)
      default:
        throw new Error(`Unknown platform: ${platform}`)
    }
  }

  /**
   * Generate tracking URL
   */
  private async generateTrackingUrl(
    articleId: string, 
    articleSlug: string, 
    platform: string
  ): Promise<string> {
    try {
      // Create temporary social post to get ID
      const { data: tempPost, error } = await this.supabase
        .from('social_posts')
        .insert({
          article_id: articleId,
          platform: platform,
          content: '',
          status: 'pending'
        })
        .select()
        .single()

      if (error || !tempPost) {
        throw new Error('Failed to create temporary post')
      }

      // Generate short URL
      const response = await fetch('/api/track/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          social_post_id: tempPost.id,
          article_slug: articleSlug
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate tracking URL')
      }

      const { short_url } = await response.json()
      return short_url
    } catch (error) {
      console.error('Error generating tracking URL:', error)
      // Fallback to direct URL
      return `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${articleSlug}?utm_source=${platform}`
    }
  }

  /**
   * Extract short code from tracking URL
   */
  private extractShortCode(url: string): string {
    const match = url.match(/[?&]c=([^&]+)/)
    return match ? match[1] : ''
  }

  /**
   * Update queue item
   */
  private async updateQueueItem(id: string, updates: any) {
    const { error } = await this.supabase
      .from('social_post_queue')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating queue item:', error)
    }
  }

  /**
   * Create social post record
   */
  private async createSocialPost(data: any) {
    const { error } = await this.supabase
      .from('social_posts')
      .upsert(data, {
        onConflict: 'article_id,platform'
      })

    if (error) {
      console.error('Error creating social post:', error)
    }
  }

  /**
   * Get queue status
   */
  async getQueueStatus() {
    const { data: stats } = await this.supabase
      .from('social_post_queue')
      .select('status')

    const statusCounts = stats?.reduce((acc: any, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {}) || {}

    return {
      isProcessing: this.isProcessing,
      pending: statusCounts.pending || 0,
      processing: statusCounts.processing || 0,
      completed: statusCounts.completed || 0,
      failed: statusCounts.failed || 0
    }
  }

  /**
   * Clear completed items older than days
   */
  async cleanupQueue(daysOld: number = 7) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const { error } = await this.supabase
      .from('social_post_queue')
      .delete()
      .eq('status', 'completed')
      .lt('processed_at', cutoffDate.toISOString())

    if (!error) {
      console.log('Queue cleanup completed')
    }
  }
}

// Singleton instance
let queueInstance: SocialPostQueue | null = null

export function getSocialQueue(): SocialPostQueue {
  if (!queueInstance) {
    queueInstance = new SocialPostQueue()
  }
  return queueInstance
}

/**
 * Add item to social queue
 */
export async function addToSocialQueue(data: {
  article_id: string
  platform: string
  priority?: number
  scheduled_for?: Date
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('social_post_queue')
    .insert({
      article_id: data.article_id,
      platform: data.platform,
      priority: data.priority || 0,
      scheduled_for: data.scheduled_for?.toISOString() || new Date().toISOString()
    })

  if (error) {
    console.error('Error adding to queue:', error)
    throw error
  }
}

// Start queue processor if in production and on server
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  const queue = getSocialQueue()
  queue.startProcessing(60) // Process every minute
}