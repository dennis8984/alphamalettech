'use client'

// Ad type definition
export interface Ad {
  id?: string
  name: string
  placement: 'header' | 'sidebar' | 'inline' | 'footer' | 'mobile-leaderboard' | 'mid-article' | 'bottom-banner'
  size: string
  status: 'active' | 'paused' | 'expired'
  target_url: string
  image_url?: string
  weight: number
  impressions: number
  clicks: number
  ctr: number
  created_at?: string
  updated_at?: string
}

// Mock database for ads
let mockAds: Ad[] = [
  {
    id: '1',
    name: 'Protein Powder Banner',
    placement: 'header',
    size: '320x50',
    status: 'active',
    target_url: 'https://example.com/protein',
    image_url: '/api/placeholder/320/50',
    weight: 100,
    impressions: 45670,
    clicks: 1543,
    ctr: 3.4,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Fitness App Sidebar',
    placement: 'sidebar',
    size: '300x250',
    status: 'active',
    target_url: 'https://example.com/fitness-app',
    image_url: '/api/placeholder/300/250',
    weight: 80,
    impressions: 23450,
    clicks: 892,
    ctr: 3.8,
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'Supplement Footer',
    placement: 'footer',
    size: '320x50',
    status: 'paused',
    target_url: 'https://example.com/supplements',
    image_url: '/api/placeholder/320/50',
    weight: 60,
    impressions: 12890,
    clicks: 234,
    ctr: 1.8,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '4',
    name: 'Mid-Article Supplement',
    placement: 'mid-article',
    size: '300x250',
    status: 'active',
    target_url: 'https://example.com/mid-supplement',
    image_url: '/api/placeholder/300/250',
    weight: 90,
    impressions: 18750,
    clicks: 675,
    ctr: 3.6,
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
]

export const createAd = async (adData: Omit<Ad, 'id' | 'created_at' | 'updated_at' | 'impressions' | 'clicks' | 'ctr'>): Promise<{ data: Ad | null, error: string | null }> => {
  try {
    console.log('📊 Creating new ad:', adData.name)
    
    const newAd: Ad = {
      ...adData,
      id: `${Date.now()}`,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockAds.push(newAd)
    
    console.log('✅ Ad created successfully:', newAd.id)
    return { data: newAd, error: null }
    
  } catch (err) {
    console.error('❌ Failed to create ad:', err)
    return { data: null, error: err instanceof Error ? err.message : 'Failed to create ad' }
  }
}

export const updateAd = async (id: string, adData: Partial<Ad>): Promise<{ data: Ad | null, error: string | null }> => {
  try {
    console.log('✏️ Updating ad:', id)
    
    const adIndex = mockAds.findIndex(ad => ad.id === id)
    if (adIndex === -1) {
      return { data: null, error: 'Ad not found' }
    }
    
    // Update ad and recalculate CTR if needed
    const updatedAd = {
      ...mockAds[adIndex],
      ...adData,
      updated_at: new Date().toISOString()
    }
    
    // Recalculate CTR
    if (updatedAd.impressions > 0) {
      updatedAd.ctr = Math.round((updatedAd.clicks / updatedAd.impressions) * 100 * 100) / 100
    }
    
    mockAds[adIndex] = updatedAd
    
    console.log('✅ Ad updated successfully:', id)
    return { data: updatedAd, error: null }
    
  } catch (err) {
    console.error('❌ Failed to update ad:', err)
    return { data: null, error: err instanceof Error ? err.message : 'Failed to update ad' }
  }
}

export const getAd = async (id: string): Promise<{ data: Ad | null, error: string | null }> => {
  try {
    const ad = mockAds.find(ad => ad.id === id)
    
    if (!ad) {
      return { data: null, error: 'Ad not found' }
    }
    
    return { data: ad, error: null }
    
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to get ad' }
  }
}

export const getAllAds = async (): Promise<{ data: Ad[] | null, error: string | null }> => {
  try {
    const sortedAds = [...mockAds].sort((a, b) => 
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    )
    
    return { data: sortedAds, error: null }
    
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to get ads' }
  }
}

export const getAdsByPlacement = async (placement: string): Promise<{ data: Ad[] | null, error: string | null }> => {
  try {
    const ads = mockAds.filter(ad => ad.placement === placement && ad.status === 'active')
    
    // Sort by weight (higher weight = higher priority)
    const sortedAds = ads.sort((a, b) => b.weight - a.weight)
    
    return { data: sortedAds, error: null }
    
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to get ads by placement' }
  }
}

export const deleteAd = async (id: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    console.log('🗑️ Deleting ad:', id)
    
    const adIndex = mockAds.findIndex(ad => ad.id === id)
    if (adIndex === -1) {
      return { success: false, error: 'Ad not found' }
    }
    
    mockAds.splice(adIndex, 1)
    
    console.log('✅ Ad deleted successfully:', id)
    return { success: true, error: null }
    
  } catch (err) {
    console.error('❌ Failed to delete ad:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete ad' }
  }
}

export const trackAdImpression = async (id: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    const adIndex = mockAds.findIndex(ad => ad.id === id)
    if (adIndex === -1) {
      return { success: false, error: 'Ad not found' }
    }
    
    mockAds[adIndex].impressions += 1
    
    // Recalculate CTR
    if (mockAds[adIndex].impressions > 0) {
      mockAds[adIndex].ctr = Math.round((mockAds[adIndex].clicks / mockAds[adIndex].impressions) * 100 * 100) / 100
    }
    
    return { success: true, error: null }
    
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to track impression' }
  }
}

export const trackAdClick = async (id: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    const adIndex = mockAds.findIndex(ad => ad.id === id)
    if (adIndex === -1) {
      return { success: false, error: 'Ad not found' }
    }
    
    mockAds[adIndex].clicks += 1
    
    // Recalculate CTR
    if (mockAds[adIndex].impressions > 0) {
      mockAds[adIndex].ctr = Math.round((mockAds[adIndex].clicks / mockAds[adIndex].impressions) * 100 * 100) / 100
    }
    
    return { success: true, error: null }
    
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to track click' }
  }
} 