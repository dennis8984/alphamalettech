import { SocialMediaAPI, SocialPost, PostResult, EngagementMetrics } from './base'

interface RedditCredentials {
  client_id: string
  client_secret: string
  refresh_token: string
  user_agent: string
}

interface RedditPost {
  platform: string
  content: string
  media_url?: string
  link?: string
  hashtags?: string[]
  subreddit?: string
  flair_id?: string
}

export class RedditAPI extends SocialMediaAPI {
  private baseUrl = 'https://oauth.reddit.com'
  private authUrl = 'https://www.reddit.com/api/v1/access_token'
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null
  
  constructor(credentials: RedditCredentials) {
    super('reddit', credentials)
  }

  /**
   * Get access token using refresh token
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken
    }

    try {
      const { client_id, client_secret, refresh_token } = this.credentials
      
      const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64')
      
      const response = await fetch(this.authUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.credentials.user_agent
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refresh_token
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get Reddit access token')
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000))
      
      return this.accessToken
    } catch (error) {
      console.error('Reddit auth error:', error)
      throw error
    }
  }

  /**
   * Post to Reddit
   */
  async post(content: SocialPost): Promise<PostResult> {
    const redditContent = content as RedditPost
    try {
      const accessToken = await this.getAccessToken()
      
      const subreddit = redditContent.subreddit || 'test' // Default to test subreddit
      
      // Reddit requires kind (link or self)
      const kind = content.link ? 'link' : 'self'
      
      const postData = new URLSearchParams({
        api_type: 'json',
        kind: kind,
        sr: subreddit,
        title: content.content, // Reddit uses title for the main text
        ...(kind === 'link' ? { url: content.link } : { text: '' }),
        ...(redditContent.flair_id ? { flair_id: redditContent.flair_id } : {})
      })

      const response = await fetch(`${this.baseUrl}/api/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': this.credentials.user_agent,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: postData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to post to Reddit')
      }

      const result = await response.json()
      
      if (result.json.errors && result.json.errors.length > 0) {
        throw new Error(result.json.errors[0][1])
      }

      const postId = result.json.data.name
      const permalink = result.json.data.url

      return {
        success: true,
        post_id: postId,
        post_url: `https://www.reddit.com${permalink}`
      }
    } catch (error) {
      console.error('Reddit API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Delete a Reddit post
   */
  async deletePost(postId: string): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken()
      
      const response = await fetch(`${this.baseUrl}/api/del`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': this.credentials.user_agent,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          id: postId
        })
      })

      return response.ok
    } catch (error) {
      console.error('Reddit delete error:', error)
      return false
    }
  }

  /**
   * Get post engagement metrics
   */
  async getEngagement(postId: string): Promise<EngagementMetrics> {
    try {
      const accessToken = await this.getAccessToken()
      
      const response = await fetch(
        `${this.baseUrl}/api/info?id=${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': this.credentials.user_agent
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to get engagement metrics')
      }

      const result = await response.json()
      const post = result.data.children[0]?.data
      
      if (!post) {
        throw new Error('Post not found')
      }
      
      return {
        likes: post.ups || 0,
        shares: 0, // Reddit doesn't track shares
        comments: post.num_comments || 0,
        views: 0, // Not available via API
        reach: 0, // Not available
        engagement_rate: post.upvote_ratio || 0
      }
    } catch (error) {
      console.error('Reddit engagement error:', error)
      return {
        likes: 0,
        shares: 0,
        comments: 0
      }
    }
  }

  /**
   * Validate Reddit credentials
   */
  async validateCredentials(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken()
      
      const response = await fetch(`${this.baseUrl}/api/v1/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': this.credentials.user_agent
        }
      })

      return response.ok
    } catch (error) {
      console.error('Reddit validation error:', error)
      return false
    }
  }

  /**
   * Get rate limit status
   */
  async getRateLimitStatus(): Promise<{ remaining: number; reset: Date }> {
    try {
      const accessToken = await this.getAccessToken()
      
      const response = await fetch(`${this.baseUrl}/api/v1/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': this.credentials.user_agent
        }
      })

      const remaining = parseInt(response.headers.get('X-Ratelimit-Remaining') || '60')
      const resetTimestamp = parseInt(response.headers.get('X-Ratelimit-Reset') || '0')
      const reset = new Date(resetTimestamp * 1000)

      return { remaining, reset }
    } catch (error) {
      return { remaining: 0, reset: new Date() }
    }
  }

  /**
   * Search for appropriate subreddits based on article category
   */
  async findSubreddits(category: string): Promise<string[]> {
    try {
      const accessToken = await this.getAccessToken()
      
      const subredditMap: Record<string, string[]> = {
        fitness: ['fitness', 'bodyweightfitness', 'gym', 'weightroom'],
        nutrition: ['nutrition', 'HealthyFood', 'MealPrepSunday', 'EatCheapAndHealthy'],
        health: ['health', 'menshealth', 'HealthyLiving'],
        'weight-loss': ['loseit', 'progresspics', 'fitness'],
        style: ['malefashionadvice', 'mensfashion'],
        entertainment: ['entertainment', 'movies', 'television'],
        lifestyle: ['lifestyle', 'selfimprovement', 'getmotivated']
      }

      return subredditMap[category.toLowerCase()] || ['fitness']
    } catch (error) {
      console.error('Reddit subreddit search error:', error)
      return ['fitness'] // Default fallback
    }
  }
}