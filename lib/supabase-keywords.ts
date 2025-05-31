import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface Keyword {
  id: string
  keyword: string
  affiliate_url: string
  category: string
  max_hits_per_page: number
  status: 'active' | 'paused' | 'expired'
  weight: number
  total_hits: number
  revenue: number
  created_at: string
  updated_at: string
}

export interface KeywordClick {
  id: string
  keyword_id: string
  article_id: string
  clicked_at: string
  ip_address?: string
  user_agent?: string
  referrer?: string
  revenue: number
}

export interface KeywordStats {
  total_keywords: number
  active_keywords: number
  total_clicks: number
  total_revenue: number
  avg_ctr: number
}

export interface CreateKeywordData {
  keyword: string
  affiliate_url: string
  category: string
  max_hits_per_page: number
  weight: number
}

export interface UpdateKeywordData extends Partial<CreateKeywordData> {
  status?: 'active' | 'paused' | 'expired'
}

// Get all keywords
export async function getKeywords(): Promise<{
  success: boolean
  keywords?: Keyword[]
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('keywords')
      .select('*')
      .order('total_hits', { ascending: false })

    if (error) {
      console.error('❌ Supabase error getting keywords:', error)
      return { success: false, error: error.message }
    }

    return { success: true, keywords: data || [] }
  } catch (error) {
    console.error('❌ Error getting keywords:', error)
    return { success: false, error: 'Failed to fetch keywords' }
  }
}

// Get active keywords for public use
export async function getActiveKeywords(): Promise<{
  success: boolean
  keywords?: Keyword[]
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('keywords')
      .select('*')
      .eq('status', 'active')
      .order('weight', { ascending: false })

    if (error) {
      console.error('❌ Supabase error getting active keywords:', error)
      return { success: false, error: error.message }
    }

    return { success: true, keywords: data || [] }
  } catch (error) {
    console.error('❌ Error getting active keywords:', error)
    return { success: false, error: 'Failed to fetch active keywords' }
  }
}

// Get keyword by ID
export async function getKeywordById(id: string): Promise<{
  success: boolean
  keyword?: Keyword
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('keywords')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Supabase error getting keyword:', error)
      return { success: false, error: error.message }
    }

    return { success: true, keyword: data }
  } catch (error) {
    console.error('❌ Error getting keyword:', error)
    return { success: false, error: 'Failed to fetch keyword' }
  }
}

// Create new keyword
export async function createKeyword(keywordData: CreateKeywordData): Promise<{
  success: boolean
  keyword?: Keyword
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('keywords')
      .insert([keywordData])
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase error creating keyword:', error)
      return { success: false, error: error.message }
    }

    return { success: true, keyword: data }
  } catch (error) {
    console.error('❌ Error creating keyword:', error)
    return { success: false, error: 'Failed to create keyword' }
  }
}

// Update keyword
export async function updateKeyword(id: string, updates: UpdateKeywordData): Promise<{
  success: boolean
  keyword?: Keyword
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('keywords')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase error updating keyword:', error)
      return { success: false, error: error.message }
    }

    return { success: true, keyword: data }
  } catch (error) {
    console.error('❌ Error updating keyword:', error)
    return { success: false, error: 'Failed to update keyword' }
  }
}

// Delete keyword
export async function deleteKeyword(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('keywords')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Supabase error deleting keyword:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('❌ Error deleting keyword:', error)
    return { success: false, error: 'Failed to delete keyword' }
  }
}

// Track keyword click
export async function trackKeywordClick(
  keywordId: string,
  articleId: string,
  metadata?: {
    ip_address?: string
    user_agent?: string
    referrer?: string
    revenue?: number
  }
): Promise<{
  success: boolean
  click?: KeywordClick
  error?: string
}> {
  try {
    const clickData = {
      keyword_id: keywordId,
      article_id: articleId,
      ip_address: metadata?.ip_address,
      user_agent: metadata?.user_agent,
      referrer: metadata?.referrer,
      revenue: metadata?.revenue || 0
    }

    const { data, error } = await supabase
      .from('keyword_clicks')
      .insert([clickData])
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase error tracking click:', error)
      return { success: false, error: error.message }
    }

    return { success: true, click: data }
  } catch (error) {
    console.error('❌ Error tracking click:', error)
    return { success: false, error: 'Failed to track click' }
  }
}

// Get keyword statistics
export async function getKeywordStats(): Promise<{
  success: boolean
  stats?: KeywordStats
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .rpc('get_keyword_stats')

    if (error) {
      console.error('❌ Supabase error getting stats:', error)
      return { success: false, error: error.message }
    }

    return { success: true, stats: data[0] }
  } catch (error) {
    console.error('❌ Error getting keyword stats:', error)
    return { success: false, error: 'Failed to fetch keyword statistics' }
  }
}

// Get keyword analytics
export async function getKeywordAnalytics(): Promise<{
  success: boolean
  analytics?: any[]
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('keyword_analytics')
      .select('*')

    if (error) {
      console.error('❌ Supabase error getting analytics:', error)
      return { success: false, error: error.message }
    }

    return { success: true, analytics: data || [] }
  } catch (error) {
    console.error('❌ Error getting keyword analytics:', error)
    return { success: false, error: 'Failed to fetch keyword analytics' }
  }
}

// Get clicks for a specific keyword
export async function getKeywordClicks(keywordId: string, limit = 100): Promise<{
  success: boolean
  clicks?: KeywordClick[]
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('keyword_clicks')
      .select('*')
      .eq('keyword_id', keywordId)
      .order('clicked_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Supabase error getting clicks:', error)
      return { success: false, error: error.message }
    }

    return { success: true, clicks: data || [] }
  } catch (error) {
    console.error('❌ Error getting keyword clicks:', error)
    return { success: false, error: 'Failed to fetch keyword clicks' }
  }
} 