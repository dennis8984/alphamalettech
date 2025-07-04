import { SocialMediaAPI, SocialPost, PostResult, EngagementMetrics } from './base'

interface TwitterCredentials {
  api_key: string
  api_secret: string
  access_token: string
  access_token_secret: string
}

export class TwitterAPI extends SocialMediaAPI {
  private baseUrl = 'https://api.twitter.com/2'
  
  constructor(credentials: TwitterCredentials) {
    super('twitter', credentials)
  }

  /**
   * Create OAuth Bearer Token header
   * Note: Twitter API v2 uses OAuth 2.0 Bearer Token, not OAuth 1.0a
   */
  private createAuthHeader(): string {
    // For Twitter API v2, we use Bearer token authentication
    return `Bearer ${this.credentials.access_token}`
  }

  /**
   * Post to Twitter/X
   */
  async post(content: SocialPost): Promise<PostResult> {
    try {
      // For Twitter API v2, we need to use OAuth 2.0 with Bearer Token
      // This is a simplified version - in production, use a proper Twitter SDK
      
      const tweet = {
        text: content.content
      }

      // If media is provided, we need to upload it first
      let mediaIds: string[] = []
      if (content.media_url) {
        const mediaId = await this.uploadMedia(content.media_url)
        if (mediaId) {
          mediaIds.push(mediaId)
          // @ts-ignore
          tweet.media = { media_ids: mediaIds }
        }
      }

      const response = await fetch(`${this.baseUrl}/tweets`, {
        method: 'POST',
        headers: {
          'Authorization': this.createAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tweet)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to post to Twitter')
      }

      const result = await response.json()
      return {
        success: true,
        post_id: result.data.id,
        post_url: `https://twitter.com/i/web/status/${result.data.id}`
      }
    } catch (error) {
      console.error('Twitter API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Upload media to Twitter
   * Note: Media upload requires additional setup with Twitter API v1.1
   */
  private async uploadMedia(mediaUrl: string): Promise<string | null> {
    try {
      // For now, we'll skip media uploads
      // Twitter will automatically create a preview from the link
      console.log('Media upload not implemented for Twitter')
      return null
    } catch (error) {
      console.error('Twitter media upload error:', error)
      return null
    }
  }

  /**
   * Delete a tweet
   */
  async deletePost(postId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/tweets/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': this.createAuthHeader(),
        }
      })

      return response.ok
    } catch (error) {
      console.error('Twitter delete error:', error)
      return false
    }
  }

  /**
   * Get tweet engagement metrics
   */
  async getEngagement(postId: string): Promise<EngagementMetrics> {
    try {
      const fields = 'public_metrics,organic_metrics'
      const response = await fetch(
        `${this.baseUrl}/tweets/${postId}?tweet.fields=${fields}`,
        {
          headers: {
            'Authorization': this.createAuthHeader(),
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to get engagement metrics')
      }

      const result = await response.json()
      const metrics = result.data.public_metrics || {}
      
      return {
        likes: metrics.like_count || 0,
        shares: metrics.retweet_count || 0,
        comments: metrics.reply_count || 0,
        views: metrics.impression_count || 0,
        reach: result.data.organic_metrics?.impression_count || 0,
        engagement_rate: 0 // Calculate externally
      }
    } catch (error) {
      console.error('Twitter engagement error:', error)
      return {
        likes: 0,
        shares: 0,
        comments: 0
      }
    }
  }

  /**
   * Validate Twitter credentials
   */
  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          'Authorization': this.createAuthHeader(),
        }
      })

      return response.ok
    } catch (error) {
      console.error('Twitter validation error:', error)
      return false
    }
  }

  /**
   * Get rate limit status
   */
  async getRateLimitStatus(): Promise<{ remaining: number; reset: Date }> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          'Authorization': this.createAuthHeader(),
        }
      })

      const remaining = parseInt(response.headers.get('x-rate-limit-remaining') || '15')
      const resetTimestamp = parseInt(response.headers.get('x-rate-limit-reset') || '0')
      const reset = new Date(resetTimestamp * 1000)

      return { remaining, reset }
    } catch (error) {
      return { remaining: 0, reset: new Date() }
    }
  }
}