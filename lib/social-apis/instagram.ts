import { SocialMediaAPI, SocialPost, PostResult, EngagementMetrics } from './base'

interface InstagramCredentials {
  access_token: string
  instagram_business_account_id: string
}

export class InstagramAPI extends SocialMediaAPI {
  private baseUrl = 'https://graph.facebook.com/v18.0'
  
  constructor(credentials: InstagramCredentials) {
    super('instagram', credentials)
  }

  /**
   * Post to Instagram Business Account
   * Note: Instagram requires a two-step process for posting
   */
  async post(content: SocialPost): Promise<PostResult> {
    try {
      const { access_token, instagram_business_account_id } = this.credentials
      
      if (!content.media_url) {
        return {
          success: false,
          error: 'Instagram requires an image or video'
        }
      }

      // Step 1: Create media container
      const containerResponse = await fetch(
        `${this.baseUrl}/${instagram_business_account_id}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: content.media_url,
            caption: content.content,
            access_token
          })
        }
      )

      if (!containerResponse.ok) {
        const error = await containerResponse.json()
        throw new Error(error.error?.message || 'Failed to create media container')
      }

      const containerResult = await containerResponse.json()
      const creationId = containerResult.id

      // Wait for container to be ready (Instagram needs time to process)
      await this.waitForContainer(creationId)

      // Step 2: Publish the media
      const publishResponse = await fetch(
        `${this.baseUrl}/${instagram_business_account_id}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creation_id: creationId,
            access_token
          })
        }
      )

      if (!publishResponse.ok) {
        const error = await publishResponse.json()
        throw new Error(error.error?.message || 'Failed to publish to Instagram')
      }

      const publishResult = await publishResponse.json()
      
      return {
        success: true,
        post_id: publishResult.id,
        post_url: `https://www.instagram.com/p/${await this.getMediaCode(publishResult.id)}/`
      }
    } catch (error) {
      console.error('Instagram API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Wait for media container to be ready
   */
  private async waitForContainer(containerId: string, maxAttempts = 10): Promise<void> {
    const { access_token } = this.credentials
    
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(
        `${this.baseUrl}/${containerId}?fields=status_code&access_token=${access_token}`
      )

      if (response.ok) {
        const data = await response.json()
        if (data.status_code === 'FINISHED') {
          return
        } else if (data.status_code === 'ERROR') {
          throw new Error('Media processing failed')
        }
      }

      // Wait 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    throw new Error('Media processing timeout')
  }

  /**
   * Get Instagram media code from ID
   */
  private async getMediaCode(mediaId: string): Promise<string> {
    try {
      const { access_token } = this.credentials
      
      const response = await fetch(
        `${this.baseUrl}/${mediaId}?fields=shortcode&access_token=${access_token}`
      )

      if (response.ok) {
        const data = await response.json()
        return data.shortcode || mediaId
      }

      return mediaId
    } catch {
      return mediaId
    }
  }

  /**
   * Delete an Instagram post
   */
  async deletePost(postId: string): Promise<boolean> {
    try {
      const { access_token } = this.credentials
      
      const response = await fetch(
        `${this.baseUrl}/${postId}?access_token=${access_token}`,
        {
          method: 'DELETE'
        }
      )

      return response.ok
    } catch (error) {
      console.error('Instagram delete error:', error)
      return false
    }
  }

  /**
   * Get post engagement metrics
   */
  async getEngagement(postId: string): Promise<EngagementMetrics> {
    try {
      const { access_token } = this.credentials
      
      const fields = 'like_count,comments_count,media_type,media_url,permalink,timestamp'
      const response = await fetch(
        `${this.baseUrl}/${postId}?fields=${fields}&access_token=${access_token}`
      )

      if (!response.ok) {
        throw new Error('Failed to get engagement metrics')
      }

      const data = await response.json()
      
      // Get insights if available (requires instagram_basic permission)
      let impressions = 0
      let reach = 0
      
      try {
        const insightsResponse = await fetch(
          `${this.baseUrl}/${postId}/insights?metric=impressions,reach&access_token=${access_token}`
        )
        
        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json()
          impressions = insightsData.data.find((m: any) => m.name === 'impressions')?.values[0]?.value || 0
          reach = insightsData.data.find((m: any) => m.name === 'reach')?.values[0]?.value || 0
        }
      } catch {
        // Insights might not be available
      }
      
      return {
        likes: data.like_count || 0,
        comments: data.comments_count || 0,
        shares: 0, // Instagram doesn't provide share count
        views: impressions,
        reach: reach,
        engagement_rate: 0 // Calculate externally
      }
    } catch (error) {
      console.error('Instagram engagement error:', error)
      return {
        likes: 0,
        shares: 0,
        comments: 0
      }
    }
  }

  /**
   * Validate Instagram credentials
   */
  async validateCredentials(): Promise<boolean> {
    try {
      const { access_token, instagram_business_account_id } = this.credentials
      
      const response = await fetch(
        `${this.baseUrl}/${instagram_business_account_id}?access_token=${access_token}`
      )

      return response.ok
    } catch (error) {
      console.error('Instagram validation error:', error)
      return false
    }
  }

  /**
   * Get rate limit status
   */
  async getRateLimitStatus(): Promise<{ remaining: number; reset: Date }> {
    try {
      const { access_token, instagram_business_account_id } = this.credentials
      
      const response = await fetch(
        `${this.baseUrl}/${instagram_business_account_id}?access_token=${access_token}`
      )

      // Instagram uses Facebook's rate limiting
      const usage = response.headers.get('X-Business-Use-Case-Usage')
      let remaining = 100
      
      if (usage) {
        try {
          const usageData = JSON.parse(usage)
          const accountUsage = usageData[instagram_business_account_id]
          if (accountUsage) {
            remaining = Math.max(0, 100 - (accountUsage[0]?.call_count || 0))
          }
        } catch {
          // Failed to parse usage
        }
      }

      const reset = new Date(Date.now() + 3600000) // 1 hour from now

      return { remaining, reset }
    } catch (error) {
      return { remaining: 0, reset: new Date() }
    }
  }
}