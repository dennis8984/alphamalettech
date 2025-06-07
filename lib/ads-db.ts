'use client'

import { supabase } from './supabase-client'

// Ad type definition
export interface Ad {
  id?: string
  name: string
  placement: 'header' | 'sidebar' | 'inline' | 'footer' | 'mobile-leaderboard' | 'mid-article' | 'bottom-banner' | 'pop-under'
  size: string
  status: 'active' | 'paused' | 'expired'
  target_url: string
  image_url?: string
  weight: number
  impressions: number
  clicks: number
  ctr: number
  // Pop-under specific settings
  popunder_settings?: {
    trigger_after_views: number
    frequency_days: number
    user_interaction_required: boolean
    delay_seconds: number
  }
  created_at?: string
  updated_at?: string
}

// Get all ads
export const getAllAds = async (): Promise<{ data: Ad[] | null, error: string | null }> => {
  try {
    console.log('📊 Fetching all ads from Supabase...')
    
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('weight', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching ads:', error)
      return { data: null, error: error.message }
    }
    
    console.log(`✅ Retrieved ${data?.length || 0} ads`)
    return { data, error: null }
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to get ads'
    console.error('💥 Unexpected error:', errorMessage)
    return { data: null, error: errorMessage }
  }
}

// Get ads by placement
export const getAdsByPlacement = async (placement: string): Promise<{ data: Ad[] | null, error: string | null }> => {
  try {
    console.log(`📊 Fetching ads for placement: ${placement}`)
    
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('placement', placement)
      .eq('status', 'active')
      .order('weight', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching ads by placement:', error)
      return { data: null, error: error.message }
    }
    
    console.log(`✅ Retrieved ${data?.length || 0} ads for ${placement}`)
    return { data, error: null }
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to get ads by placement'
    console.error('💥 Unexpected error:', errorMessage)
    return { data: null, error: errorMessage }
  }
}

// Get single ad by ID
export const getAd = async (id: string): Promise<{ data: Ad | null, error: string | null }> => {
  try {
    console.log(`📊 Fetching ad by ID: ${id}`)
    
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('❌ Error fetching ad:', error)
      return { data: null, error: error.message }
    }
    
    console.log('✅ Retrieved ad:', data?.name)
    return { data, error: null }
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to get ad'
    console.error('💥 Unexpected error:', errorMessage)
    return { data: null, error: errorMessage }
  }
}

// Create new ad
export const createAd = async (adData: Omit<Ad, 'id' | 'created_at' | 'updated_at' | 'impressions' | 'clicks' | 'ctr'>): Promise<{ data: Ad | null, error: string | null }> => {
  try {
    console.log('📊 Creating new ad:', adData.name)
    
    const { data, error } = await supabase
      .from('ads')
      .insert([{
        name: adData.name,
        placement: adData.placement,
        size: adData.size,
        status: adData.status,
        target_url: adData.target_url,
        image_url: adData.image_url || null,
        weight: adData.weight,
        popunder_settings: adData.popunder_settings || null,
        impressions: 0,
        clicks: 0,
        ctr: 0.00
      }])
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error creating ad:', error)
      return { data: null, error: error.message }
    }
    
    console.log('✅ Ad created successfully:', data?.name)
    return { data, error: null }
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to create ad'
    console.error('💥 Unexpected error:', errorMessage)
    return { data: null, error: errorMessage }
  }
}

// Update ad
export const updateAd = async (id: string, adData: Partial<Omit<Ad, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Ad | null, error: string | null }> => {
  try {
    console.log(`📊 Updating ad: ${id}`)
    
    const updateData: any = {}
    
    // Only include fields that are provided
    if (adData.name !== undefined) updateData.name = adData.name
    if (adData.placement !== undefined) updateData.placement = adData.placement
    if (adData.size !== undefined) updateData.size = adData.size
    if (adData.status !== undefined) updateData.status = adData.status
    if (adData.target_url !== undefined) updateData.target_url = adData.target_url
    if (adData.image_url !== undefined) updateData.image_url = adData.image_url
    if (adData.weight !== undefined) updateData.weight = adData.weight
    if (adData.popunder_settings !== undefined) updateData.popunder_settings = adData.popunder_settings
    
    const { data, error } = await supabase
      .from('ads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error updating ad:', error)
      return { data: null, error: error.message }
    }
    
    console.log('✅ Ad updated successfully:', data?.name)
    return { data, error: null }
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update ad'
    console.error('💥 Unexpected error:', errorMessage)
    return { data: null, error: errorMessage }
  }
}

// Delete ad
export const deleteAd = async (id: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    console.log(`🗑️ Deleting ad: ${id}`)
    
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('❌ Error deleting ad:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Ad deleted successfully')
    return { success: true, error: null }
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete ad'
    console.error('💥 Unexpected error:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Track ad impression
export const trackAdImpression = async (adId: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    console.log(`👁️ Tracking impression for ad: ${adId}`)
    
    const { error } = await supabase
      .from('ad_impressions')
      .insert([{
        ad_id: adId,
        ip_address: null, // Could be populated server-side if needed
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        referrer: typeof document !== 'undefined' ? document.referrer : null
      }])
    
    if (error) {
      console.error('❌ Error tracking impression:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Impression tracked successfully')
    return { success: true, error: null }
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to track impression'
    console.error('💥 Unexpected error:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Track ad click
export const trackAdClick = async (adId: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    console.log(`🖱️ Tracking click for ad: ${adId}`)
    
    const { error } = await supabase
      .from('ad_clicks')
      .insert([{
        ad_id: adId,
        ip_address: null, // Could be populated server-side if needed
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        referrer: typeof document !== 'undefined' ? document.referrer : null
      }])
    
    if (error) {
      console.error('❌ Error tracking click:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Click tracked successfully')
    return { success: true, error: null }
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to track click'
    console.error('💥 Unexpected error:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Pop-under specific functions
export const shouldShowPopUnder = async (): Promise<{ show: boolean, error: string | null }> => {
  try {
    // Check if pop-under ads are enabled globally
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'popunder_enabled')
      .single()
    
    if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking pop-under settings:', settingsError)
      return { show: false, error: settingsError.message }
    }
    
    const popunderEnabled = settings?.value === 'true'
    
    if (!popunderEnabled) {
      return { show: false, error: null }
    }
    
    // Get active pop-under ads
    const { data: ads, error: adsError } = await supabase
      .from('ads')
      .select('*')
      .eq('placement', 'pop-under')
      .eq('status', 'active')
      .order('weight', { ascending: false })
      .limit(1)
    
    if (adsError) {
      console.error('❌ Error fetching pop-under ads:', adsError)
      return { show: false, error: adsError.message }
    }
    
    const shouldShow = ads && ads.length > 0
    console.log(`Pop-under check: ${shouldShow ? 'Show' : 'Hide'}`)
    
    return { show: shouldShow, error: null }
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to check pop-under'
    console.error('💥 Unexpected error:', errorMessage)
    return { show: false, error: errorMessage }
  }
} 