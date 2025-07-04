import { createClient } from '@supabase/supabase-js'

interface AutomationRule {
  id: string
  name: string
  description?: string
  rule_type: 'category_based' | 'keyword_based' | 'time_based' | 'engagement_based'
  conditions: {
    categories?: string[]
    keywords?: string[]
    min_word_count?: number
    requires_image?: boolean
    min_engagement?: number
    time_since_last_post?: number // hours
  }
  platforms: string[]
  is_active: boolean
  priority: number
}

export class SocialAutomationConfig {
  private supabase
  private rules: AutomationRule[] = []

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    this.loadRules()
  }

  /**
   * Load automation rules from database
   */
  private async loadRules() {
    try {
      const { data: rules } = await this.supabase
        .from('social_automation_rules')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })

      this.rules = rules || []
      console.log(`Loaded ${this.rules.length} automation rules`)
    } catch (error) {
      console.error('Error loading automation rules:', error)
    }
  }

  /**
   * Get active automation rules
   */
  async getActiveRules(): Promise<AutomationRule[]> {
    await this.loadRules() // Refresh rules
    return this.rules
  }

  /**
   * Create new automation rule
   */
  async createRule(rule: Omit<AutomationRule, 'id'>): Promise<AutomationRule | null> {
    try {
      const { data, error } = await this.supabase
        .from('social_automation_rules')
        .insert(rule)
        .select()
        .single()

      if (error) throw error

      await this.loadRules() // Refresh cache
      return data
    } catch (error) {
      console.error('Error creating rule:', error)
      return null
    }
  }

  /**
   * Update automation rule
   */
  async updateRule(id: string, updates: Partial<AutomationRule>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('social_automation_rules')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      await this.loadRules() // Refresh cache
      return true
    } catch (error) {
      console.error('Error updating rule:', error)
      return false
    }
  }

  /**
   * Delete automation rule
   */
  async deleteRule(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('social_automation_rules')
        .delete()
        .eq('id', id)

      if (error) throw error

      await this.loadRules() // Refresh cache
      return true
    } catch (error) {
      console.error('Error deleting rule:', error)
      return false
    }
  }

  /**
   * Initialize default automation rules
   */
  async initializeDefaultRules() {
    const defaultRules: Omit<AutomationRule, 'id'>[] = [
      {
        name: 'Fitness Articles - All Platforms',
        description: 'Post fitness articles to all major platforms',
        rule_type: 'category_based',
        conditions: {
          categories: ['fitness'],
          min_word_count: 500,
          requires_image: true
        },
        platforms: ['facebook', 'twitter', 'instagram', 'reddit'],
        is_active: true,
        priority: 10
      },
      {
        name: 'Nutrition Content - Health Focused',
        description: 'Share nutrition articles on health-focused platforms',
        rule_type: 'category_based',
        conditions: {
          categories: ['nutrition'],
          min_word_count: 400
        },
        platforms: ['facebook', 'reddit'],
        is_active: true,
        priority: 8
      },
      {
        name: 'Workout Keywords - Fitness Platforms',
        description: 'Post articles with workout keywords to fitness communities',
        rule_type: 'keyword_based',
        conditions: {
          keywords: ['workout', 'exercise', 'training', 'gym'],
          min_word_count: 300
        },
        platforms: ['instagram', 'reddit'],
        is_active: true,
        priority: 7
      },
      {
        name: 'High Engagement Content',
        description: 'Repost high-performing content across platforms',
        rule_type: 'engagement_based',
        conditions: {
          min_engagement: 100,
          time_since_last_post: 168 // 1 week
        },
        platforms: ['facebook', 'twitter'],
        is_active: true,
        priority: 5
      },
      {
        name: 'Weight Loss Success Stories',
        description: 'Share weight loss content on supportive communities',
        rule_type: 'keyword_based',
        conditions: {
          keywords: ['weight loss', 'transformation', 'before after'],
          requires_image: true
        },
        platforms: ['facebook', 'instagram', 'reddit'],
        is_active: true,
        priority: 9
      },
      {
        name: 'Quick Tips - Twitter Focus',
        description: 'Short articles perfect for Twitter',
        rule_type: 'category_based',
        conditions: {
          categories: ['fitness', 'nutrition', 'health'],
          min_word_count: 200,
          max_word_count: 500
        },
        platforms: ['twitter'],
        is_active: true,
        priority: 6
      }
    ]

    // Check if rules already exist
    const { data: existingRules } = await this.supabase
      .from('social_automation_rules')
      .select('name')

    const existingNames = new Set(existingRules?.map(r => r.name) || [])

    // Insert only new rules
    for (const rule of defaultRules) {
      if (!existingNames.has(rule.name)) {
        await this.createRule(rule)
      }
    }

    console.log('Default automation rules initialized')
  }

  /**
   * Test article against rules
   */
  testArticle(article: any): { 
    matchingRules: AutomationRule[], 
    platforms: Set<string> 
  } {
    const matchingRules: AutomationRule[] = []
    const platforms = new Set<string>()

    for (const rule of this.rules) {
      if (this.matchesRule(article, rule)) {
        matchingRules.push(rule)
        rule.platforms.forEach(p => platforms.add(p))
      }
    }

    return { matchingRules, platforms }
  }

  /**
   * Check if article matches rule conditions
   */
  private matchesRule(article: any, rule: AutomationRule): boolean {
    const conditions = rule.conditions

    switch (rule.rule_type) {
      case 'category_based':
        if (conditions.categories && conditions.categories.length > 0) {
          if (!conditions.categories.includes(article.category)) {
            return false
          }
        }
        break

      case 'keyword_based':
        if (conditions.keywords && conditions.keywords.length > 0) {
          const articleText = `${article.title} ${article.excerpt} ${article.content}`.toLowerCase()
          const hasKeyword = conditions.keywords.some(keyword => 
            articleText.includes(keyword.toLowerCase())
          )
          if (!hasKeyword) {
            return false
          }
        }
        break

      case 'engagement_based':
        // Would need to check historical engagement data
        break

      case 'time_based':
        // Would need to check posting schedule
        break
    }

    // Check common conditions
    if (conditions.min_word_count) {
      const wordCount = article.content.split(/\s+/).length
      if (wordCount < conditions.min_word_count) {
        return false
      }
    }

    if (conditions.requires_image && !article.featured_image) {
      return false
    }

    return true
  }

  /**
   * Get rule statistics
   */
  async getRuleStatistics(ruleId: string) {
    try {
      // Get posts triggered by this rule
      const { data: posts } = await this.supabase
        .from('social_posts')
        .select(`
          *,
          engagement:social_engagement(*),
          clicks:social_clicks(count)
        `)
        .eq('automation_rule_id', ruleId)

      if (!posts) return null

      const stats = {
        total_posts: posts.length,
        successful_posts: posts.filter(p => p.status === 'posted').length,
        failed_posts: posts.filter(p => p.status === 'failed').length,
        total_clicks: posts.reduce((sum, p) => sum + (p.clicks?.[0]?.count || 0), 0),
        total_engagement: posts.reduce((sum, p) => {
          const eng = p.engagement?.[0] || {}
          return sum + (eng.likes || 0) + (eng.shares || 0) + (eng.comments || 0)
        }, 0),
        platforms: [...new Set(posts.map(p => p.platform))]
      }

      return stats
    } catch (error) {
      console.error('Error getting rule statistics:', error)
      return null
    }
  }
}

// Export singleton instance
let configInstance: SocialAutomationConfig | null = null

export function getAutomationConfig(): SocialAutomationConfig {
  if (!configInstance) {
    configInstance = new SocialAutomationConfig()
  }
  return configInstance
}

// Export helper function
export async function getActiveAutomationRules(): Promise<AutomationRule[]> {
  const config = getAutomationConfig()
  return config.getActiveRules()
}

// Initialize default rules on first run
if (process.env.NODE_ENV === 'production') {
  const config = getAutomationConfig()
  config.initializeDefaultRules()
}