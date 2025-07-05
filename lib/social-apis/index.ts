import { createClient } from '@supabase/supabase-js'
import { SocialMediaAPI, SocialPost, PostResult } from './base'
import { FacebookAPI } from './facebook'
import { TwitterAPI } from './twitter'
import { RedditAPI } from './reddit'
import { InstagramAPI } from './instagram'

export class SocialAPIManager {
  private supabase: any
  private apis: Map<string, SocialMediaAPI> = new Map()

  constructor() {
    // Initialize lazily
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
   * Initialize API for a platform
   */
  async initializePlatform(platform: string): Promise<boolean> {
    try {
      // Get platform credentials from database
      const { data: platformData, error } = await this.getSupabase()
        .from('social_platforms')
        .select('*')
        .eq('platform', platform)
        .eq('is_active', true)
        .single()

      if (error || !platformData || !platformData.credentials) {
        console.error(`Platform ${platform} not configured or inactive`)
        return false
      }

      // Decrypt credentials (in production, use proper encryption)
      const credentials = platformData.credentials

      // Initialize appropriate API
      let api: SocialMediaAPI | null = null

      switch (platform) {
        case 'facebook':
          api = new FacebookAPI(credentials)
          break
        case 'twitter':
          api = new TwitterAPI(credentials)
          break
        case 'reddit':
          api = new RedditAPI(credentials)
          break
        case 'instagram':
          api = new InstagramAPI(credentials)
          break
        default:
          console.error(`Unknown platform: ${platform}`)
          return false
      }

      // Validate credentials
      const isValid = await api.validateCredentials()
      if (!isValid) {
        console.error(`Invalid credentials for ${platform}`)
        return false
      }

      // Store API instance
      this.apis.set(platform, api)
      return true
    } catch (error) {
      console.error(`Error initializing ${platform}:`, error)
      return false
    }
  }

  /**
   * Post to a specific platform
   */
  async postToPlatform(platform: string, content: SocialPost): Promise<PostResult> {
    try {
      // Get or initialize API
      if (!this.apis.has(platform)) {
        const initialized = await this.initializePlatform(platform)
        if (!initialized) {
          return {
            success: false,
            error: `Failed to initialize ${platform} API`
          }
        }
      }

      const api = this.apis.get(platform)!

      // Check rate limits
      const rateLimit = await api.getRateLimitStatus()
      if (rateLimit.remaining === 0) {
        return {
          success: false,
          error: `Rate limit exceeded. Resets at ${rateLimit.reset.toISOString()}`
        }
      }

      // Post content
      const result = await api.post(content)

      // Update rate limit info in database
      if (result.success) {
        await this.updateLastPosted(platform)
      }

      return result
    } catch (error) {
      console.error(`Error posting to ${platform}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Delete post from platform
   */
  async deleteFromPlatform(platform: string, postId: string): Promise<boolean> {
    try {
      const api = this.apis.get(platform)
      if (!api) {
        const initialized = await this.initializePlatform(platform)
        if (!initialized) return false
      }

      return await this.apis.get(platform)!.deletePost(postId)
    } catch (error) {
      console.error(`Error deleting from ${platform}:`, error)
      return false
    }
  }

  /**
   * Get engagement metrics
   */
  async getEngagement(platform: string, postId: string) {
    try {
      const api = this.apis.get(platform)
      if (!api) {
        const initialized = await this.initializePlatform(platform)
        if (!initialized) return null
      }

      return await this.apis.get(platform)!.getEngagement(postId)
    } catch (error) {
      console.error(`Error getting engagement from ${platform}:`, error)
      return null
    }
  }

  /**
   * Update last posted timestamp
   */
  private async updateLastPosted(platform: string) {
    try {
      await this.getSupabase()
        .from('social_platforms')
        .update({ last_posted_at: new Date().toISOString() })
        .eq('platform', platform)
    } catch (error) {
      console.error('Error updating last posted:', error)
    }
  }

  /**
   * Get rate limit status for all platforms
   */
  async getAllRateLimits() {
    const limits: Record<string, any> = {}

    for (const [platform, api] of this.apis) {
      try {
        limits[platform] = await api.getRateLimitStatus()
      } catch (error) {
        limits[platform] = { error: 'Failed to get rate limit' }
      }
    }

    return limits
  }

  /**
   * Update platform credentials
   */
  async updateCredentials(platform: string, credentials: any): Promise<boolean> {
    try {
      // Encrypt credentials (in production, use proper encryption)
      const encryptedCredentials = credentials

      // Update in database
      const { error } = await this.getSupabase()
        .from('social_platforms')
        .update({ credentials: encryptedCredentials })
        .eq('platform', platform)

      if (error) throw error

      // Reinitialize API
      this.apis.delete(platform)
      return await this.initializePlatform(platform)
    } catch (error) {
      console.error('Error updating credentials:', error)
      return false
    }
  }
}

// Export singleton instance
export const socialAPIManager = new SocialAPIManager()

// Export types
export * from './base'