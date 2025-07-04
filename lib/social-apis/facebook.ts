import { SocialMediaAPI, SocialPost, PostResult, EngagementMetrics } from './base'

interface FacebookCredentials {
  page_id: string
  access_token: string
}

export class FacebookAPI extends SocialMediaAPI {
  private baseUrl = 'https://graph.facebook.com/v18.0'
  
  constructor(credentials: FacebookCredentials) {
    super('facebook', credentials)
  }

  /**
   * Post to Facebook Page
   */
  async post(content: SocialPost): Promise<PostResult> {
    try {
      const { page_id, access_token } = this.credentials
      
      // Prepare post data
      const postData: any = {
        message: content.content,
        access_token
      }

      // Add link if provided
      if (content.link) {
        postData.link = content.link
      }

      // Add photo if provided
      if (content.media_url) {
        // Post photo with message
        const response = await fetch(
          `${this.baseUrl}/${page_id}/photos`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: content.media_url,
              message: content.content,
              access_token
            })
          }
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || 'Failed to post to Facebook')
        }

        const result = await response.json()
        return {
          success: true,
          post_id: result.post_id || result.id,
          post_url: `https://www.facebook.com/${result.post_id || result.id}`
        }
      } else {
        // Text post with optional link
        const response = await fetch(
          `${this.baseUrl}/${page_id}/feed`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
          }
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || 'Failed to post to Facebook')
        }

        const result = await response.json()
        return {
          success: true,
          post_id: result.id,
          post_url: `https://www.facebook.com/${result.id}`
        }
      }
    } catch (error) {
      console.error('Facebook API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Delete a Facebook post
   */
  async deletePost(postId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${postId}?access_token=${this.credentials.access_token}`,
        {
          method: 'DELETE'
        }
      )

      return response.ok
    } catch (error) {
      console.error('Facebook delete error:', error)
      return false
    }
  }

  /**
   * Get post engagement metrics
   */
  async getEngagement(postId: string): Promise<EngagementMetrics> {
    try {
      const fields = 'likes.summary(true),comments.summary(true),shares,reactions.summary(true)'
      const response = await fetch(
        `${this.baseUrl}/${postId}?fields=${fields}&access_token=${this.credentials.access_token}`
      )

      if (!response.ok) {
        throw new Error('Failed to get engagement metrics')
      }

      const data = await response.json()
      
      return {
        likes: data.reactions?.summary?.total_count || 0,
        comments: data.comments?.summary?.total_count || 0,
        shares: data.shares?.count || 0,
        views: 0, // Facebook doesn't provide view count for regular posts
        reach: 0, // Requires page insights permission
        engagement_rate: 0 // Will be calculated externally
      }
    } catch (error) {
      console.error('Facebook engagement error:', error)
      return {
        likes: 0,
        shares: 0,
        comments: 0
      }
    }
  }

  /**
   * Validate Facebook credentials
   */
  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.credentials.page_id}?access_token=${this.credentials.access_token}`
      )

      return response.ok
    } catch (error) {
      console.error('Facebook validation error:', error)
      return false
    }
  }

  /**
   * Get rate limit status
   */
  async getRateLimitStatus(): Promise<{ remaining: number; reset: Date }> {
    try {
      // Facebook returns rate limit info in headers
      const response = await fetch(
        `${this.baseUrl}/${this.credentials.page_id}?access_token=${this.credentials.access_token}`
      )

      const remaining = parseInt(response.headers.get('X-App-Usage') || '100')
      const reset = new Date(Date.now() + 3600000) // 1 hour from now

      return { remaining, reset }
    } catch (error) {
      return { remaining: 0, reset: new Date() }
    }
  }
}