import { createClient } from '@supabase/supabase-js'

interface Alert {
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  platform?: string
  details?: any
}

export class SocialMonitoring {
  private supabase: any
  private alerts: Alert[] = []
  private monitoringInterval: NodeJS.Timeout | null = null

  constructor() {
    // Initialize lazily
  }

  private getSupabase() {
    if (!this.getSupabase()) {
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
   * Start monitoring social media operations
   */
  startMonitoring(intervalMinutes: number = 10) {
    console.log(`Starting social media monitoring (${intervalMinutes}min intervals)`)
    
    // Run initial check
    this.runHealthChecks()

    // Schedule regular checks
    this.monitoringInterval = setInterval(() => {
      this.runHealthChecks()
    }, intervalMinutes * 60 * 1000)
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    console.log('Social media monitoring stopped')
  }

  /**
   * Run all health checks
   */
  private async runHealthChecks() {
    console.log('Running social media health checks...')
    this.alerts = [] // Clear previous alerts

    try {
      await Promise.all([
        this.checkFailureRate(),
        this.checkQueueBacklog(),
        this.checkPlatformStatus(),
        this.checkEngagementDrops(),
        this.checkRateLimits(),
        this.checkPostingSchedule()
      ])

      // Send alerts if any
      if (this.alerts.length > 0) {
        await this.sendAlerts()
      }
    } catch (error) {
      console.error('Health check error:', error)
    }
  }

  /**
   * Check failure rate for posts
   */
  private async checkFailureRate() {
    const { data: recentPosts } = await this.getSupabase()
      .from('social_posts')
      .select('status, platform')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (!recentPosts || recentPosts.length === 0) return

    // Calculate failure rate by platform
    const platformStats: Record<string, { total: number, failed: number }> = {}
    
    recentPosts.forEach((post: any) => {
      if (!platformStats[post.platform]) {
        platformStats[post.platform] = { total: 0, failed: 0 }
      }
      platformStats[post.platform].total++
      if (post.status === 'failed') {
        platformStats[post.platform].failed++
      }
    })

    // Check for high failure rates
    Object.entries(platformStats).forEach(([platform, stats]) => {
      const failureRate = (stats.failed / stats.total) * 100
      
      if (failureRate > 20) {
        this.alerts.push({
          type: 'error',
          title: 'High Failure Rate',
          message: `${platform} has ${failureRate.toFixed(0)}% failure rate in last 24h`,
          platform,
          details: stats
        })
      } else if (failureRate > 10) {
        this.alerts.push({
          type: 'warning',
          title: 'Elevated Failure Rate',
          message: `${platform} has ${failureRate.toFixed(0)}% failure rate`,
          platform,
          details: stats
        })
      }
    })
  }

  /**
   * Check queue backlog
   */
  private async checkQueueBacklog() {
    const { count: pendingCount } = await this.getSupabase()
      .from('social_post_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lt('scheduled_for', new Date().toISOString())

    const { count: failedCount } = await this.getSupabase()
      .from('social_post_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')

    if (pendingCount && pendingCount > 50) {
      this.alerts.push({
        type: 'error',
        title: 'Large Queue Backlog',
        message: `${pendingCount} posts are overdue for processing`,
        details: { pendingCount }
      })
    } else if (pendingCount && pendingCount > 20) {
      this.alerts.push({
        type: 'warning',
        title: 'Queue Backlog',
        message: `${pendingCount} posts pending processing`,
        details: { pendingCount }
      })
    }

    if (failedCount && failedCount > 10) {
      this.alerts.push({
        type: 'warning',
        title: 'Failed Posts',
        message: `${failedCount} posts have failed and need attention`,
        details: { failedCount }
      })
    }
  }

  /**
   * Check platform API status
   */
  private async checkPlatformStatus() {
    const { data: platforms } = await this.getSupabase()
      .from('social_platforms')
      .select('*')
      .eq('is_active', true)

    if (!platforms) return

    for (const platform of platforms) {
      // Check if platform hasn't posted in a while
      if (platform.last_posted_at) {
        const hoursSincePost = (Date.now() - new Date(platform.last_posted_at).getTime()) / (1000 * 60 * 60)
        
        if (hoursSincePost > 24) {
          this.alerts.push({
            type: 'warning',
            title: 'Platform Inactive',
            message: `${platform.platform} hasn't posted in ${Math.floor(hoursSincePost)} hours`,
            platform: platform.platform
          })
        }
      }

      // Check credentials validity (would need actual API calls)
      // This is a placeholder for demonstration
      if (!platform.credentials) {
        this.alerts.push({
          type: 'error',
          title: 'Missing Credentials',
          message: `${platform.platform} is missing API credentials`,
          platform: platform.platform
        })
      }
    }
  }

  /**
   * Check for engagement drops
   */
  private async checkEngagementDrops() {
    // Compare this week vs last week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

    const { data: thisWeek } = await this.getSupabase()
      .from('social_engagement')
      .select('likes, shares, comments')
      .gte('updated_at', oneWeekAgo.toISOString())

    const { data: lastWeek } = await this.getSupabase()
      .from('social_engagement')
      .select('likes, shares, comments')
      .gte('updated_at', twoWeeksAgo.toISOString())
      .lt('updated_at', oneWeekAgo.toISOString())

    if (!thisWeek || !lastWeek || thisWeek.length === 0 || lastWeek.length === 0) return

    // Calculate averages
    const thisWeekAvg = this.calculateEngagementAverage(thisWeek)
    const lastWeekAvg = this.calculateEngagementAverage(lastWeek)

    const dropPercentage = ((lastWeekAvg - thisWeekAvg) / lastWeekAvg) * 100

    if (dropPercentage > 30) {
      this.alerts.push({
        type: 'error',
        title: 'Significant Engagement Drop',
        message: `Engagement down ${dropPercentage.toFixed(0)}% compared to last week`,
        details: { thisWeekAvg, lastWeekAvg }
      })
    } else if (dropPercentage > 15) {
      this.alerts.push({
        type: 'warning',
        title: 'Engagement Decline',
        message: `Engagement down ${dropPercentage.toFixed(0)}% from last week`,
        details: { thisWeekAvg, lastWeekAvg }
      })
    }
  }

  /**
   * Check rate limits
   */
  private async checkRateLimits() {
    // This would check actual API rate limits
    // Placeholder implementation
    const { data: recentPosts } = await this.getSupabase()
      .from('social_posts')
      .select('platform, posted_at')
      .gte('posted_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order('posted_at', { ascending: false })

    if (!recentPosts) return

    // Count posts per platform in last hour
    const hourlyCount: Record<string, number> = {}
    recentPosts.forEach((post: any) => {
      hourlyCount[post.platform] = (hourlyCount[post.platform] || 0) + 1
    })

    // Check against platform limits
    const platformLimits: Record<string, number> = {
      facebook: 10,
      twitter: 15,
      reddit: 10,
      instagram: 5
    }

    Object.entries(hourlyCount).forEach(([platform, count]) => {
      const limit = platformLimits[platform] || 10
      const usage = (count / limit) * 100

      if (usage > 80) {
        this.alerts.push({
          type: 'warning',
          title: 'Approaching Rate Limit',
          message: `${platform} at ${usage.toFixed(0)}% of hourly limit`,
          platform,
          details: { count, limit }
        })
      }
    })
  }

  /**
   * Check posting schedule compliance
   */
  private async checkPostingSchedule() {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const hour = now.getHours()

    // Check if we should have posted in the last hour
    const { data: schedules } = await this.getSupabase()
      .from('social_schedule')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .eq('hour', hour - 1)
      .eq('is_active', true)

    if (!schedules || schedules.length === 0) return

    // Check if posts were made for each scheduled slot
    for (const schedule of schedules) {
      const { count } = await this.getSupabase()
        .from('social_posts')
        .select('*', { count: 'exact', head: true })
        .eq('platform', schedule.platform)
        .gte('posted_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())

      if (count === 0) {
        this.alerts.push({
          type: 'info',
          title: 'Missed Schedule',
          message: `No ${schedule.platform} post for scheduled slot`,
          platform: schedule.platform,
          details: { schedule }
        })
      }
    }
  }

  /**
   * Calculate engagement average
   */
  private calculateEngagementAverage(posts: any[]): number {
    if (posts.length === 0) return 0
    
    const total = posts.reduce((sum, post) => {
      return sum + (post.likes || 0) + (post.shares || 0) + (post.comments || 0)
    }, 0)

    return total / posts.length
  }

  /**
   * Send alerts
   */
  private async sendAlerts() {
    console.log(`📢 Sending ${this.alerts.length} alerts`)

    // Log alerts
    this.alerts.forEach(alert => {
      const emoji = alert.type === 'error' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'
      console.log(`${emoji} ${alert.title}: ${alert.message}`)
    })

    // In production, you would:
    // 1. Send email notifications
    // 2. Post to Slack/Discord
    // 3. Create dashboard notifications
    // 4. Log to monitoring service

    // Store alerts in database
    for (const alert of this.alerts) {
      await this.logAlert(alert)
    }
  }

  /**
   * Log alert to database
   */
  private async logAlert(alert: Alert) {
    try {
      await this.getSupabase()
        .from('social_monitoring_alerts')
        .insert({
          type: alert.type,
          title: alert.title,
          message: alert.message,
          platform: alert.platform,
          details: alert.details,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error logging alert:', error)
    }
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(hours: number = 24) {
    const { data: alerts } = await this.getSupabase()
      .from('social_monitoring_alerts')
      .select('*')
      .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    return alerts || []
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    return {
      isRunning: this.monitoringInterval !== null,
      currentAlerts: this.alerts,
      alertCount: this.alerts.length
    }
  }
}

// Create monitoring alerts table
const createMonitoringTable = `
CREATE TABLE IF NOT EXISTS social_monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  platform VARCHAR(50),
  details JSONB,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_monitoring_alerts_created ON social_monitoring_alerts(created_at);
CREATE INDEX idx_monitoring_alerts_type ON social_monitoring_alerts(type);
CREATE INDEX idx_monitoring_alerts_acknowledged ON social_monitoring_alerts(acknowledged);
`

// Singleton instance
let monitoringInstance: SocialMonitoring | null = null

export function getSocialMonitoring(): SocialMonitoring {
  if (!monitoringInstance) {
    monitoringInstance = new SocialMonitoring()
  }
  return monitoringInstance
}

// Monitoring should be started manually when needed