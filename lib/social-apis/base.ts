export interface SocialPost {
  platform: string
  content: string
  media_url?: string
  link?: string
  hashtags?: string[]
}

export interface PostResult {
  success: boolean
  post_id?: string
  post_url?: string
  error?: string
}

export interface EngagementMetrics {
  likes: number
  shares: number
  comments: number
  views?: number
  reach?: number
  engagement_rate?: number
}

export abstract class SocialMediaAPI {
  protected platform: string
  protected credentials: any

  constructor(platform: string, credentials: any) {
    this.platform = platform
    this.credentials = credentials
  }

  /**
   * Post content to social media platform
   */
  abstract post(content: SocialPost): Promise<PostResult>

  /**
   * Delete a post from the platform
   */
  abstract deletePost(postId: string): Promise<boolean>

  /**
   * Get engagement metrics for a post
   */
  abstract getEngagement(postId: string): Promise<EngagementMetrics>

  /**
   * Validate credentials
   */
  abstract validateCredentials(): Promise<boolean>

  /**
   * Get rate limit status
   */
  abstract getRateLimitStatus(): Promise<{
    remaining: number
    reset: Date
  }>
}