import { SocialMediaAPI, SocialPost, PostResult, EngagementMetrics } from './base'
import crypto from 'crypto'

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
   * Create OAuth 1.0a signature
   */
  private createOAuthSignature(
    method: string,
    url: string,
    params: Record<string, string>
  ): string {
    const { api_key, api_secret, access_token, access_token_secret } = this.credentials
    
    // OAuth parameters
    const oauthParams = {
      oauth_consumer_key: api_key,
      oauth_nonce: crypto.randomBytes(32).toString('base64'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: access_token,
      oauth_version: '1.0'
    }

    // Combine all parameters
    const allParams = { ...params, ...oauthParams }
    
    // Sort parameters
    const sortedParams = Object.keys(allParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&')

    // Create signature base string
    const signatureBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`
    
    // Create signing key
    const signingKey = `${encodeURIComponent(api_secret)}&${encodeURIComponent(access_token_secret)}`
    
    // Generate signature
    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(signatureBase)
      .digest('base64')

    // Create Authorization header
    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ') + `, oauth_signature="${encodeURIComponent(signature)}"`

    return authHeader
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
          'Authorization': `Bearer ${this.credentials.access_token}`,
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
   */
  private async uploadMedia(mediaUrl: string): Promise<string | null> {
    try {
      // Download image
      const imageResponse = await fetch(mediaUrl)
      const imageBuffer = await imageResponse.arrayBuffer()
      const base64Image = Buffer.from(imageBuffer).toString('base64')

      // Upload to Twitter (v1.1 API for media upload)
      const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json'
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': this.createOAuthSignature('POST', uploadUrl, {
            media_data: base64Image
          }),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `media_data=${encodeURIComponent(base64Image)}`
      })

      if (!response.ok) {
        console.error('Failed to upload media to Twitter')
        return null
      }

      const result = await response.json()
      return result.media_id_string
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
          'Authorization': `Bearer ${this.credentials.access_token}`,
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
            'Authorization': `Bearer ${this.credentials.access_token}`,
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
          'Authorization': `Bearer ${this.credentials.access_token}`,
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
          'Authorization': `Bearer ${this.credentials.access_token}`,
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