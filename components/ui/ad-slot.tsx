'use client'

import { useState, useEffect } from 'react'
import { getAdsByPlacement, trackAdImpression, trackAdClick, shouldShowPopUnder, type Ad } from '@/lib/ads-db'

interface AdSlotProps {
  placement: 'header' | 'sidebar' | 'mid-article' | 'footer' | 'mobile-leaderboard' | 'bottom-banner'
  className?: string
}

export function AdSlot({ placement, className = '' }: AdSlotProps) {
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAd = async () => {
      try {
        const { data, error } = await getAdsByPlacement(placement)
        
        if (error) {
          console.error('❌ Failed to load ads for placement:', placement, error)
          setLoading(false)
          return
        }
        
        if (data && data.length > 0) {
          // Select first ad (highest weight)
          const selectedAd = data[0]
          setAd(selectedAd)
          
          // Track impression
          await trackAdImpression(selectedAd.id!)
          console.log('👁️ Ad impression tracked:', selectedAd.name)
        }
        
        setLoading(false)
      } catch (err) {
        console.error('💥 Error loading ad:', err)
        setLoading(false)
      }
    }

    loadAd()
  }, [placement])

  const handleAdClick = async () => {
    if (!ad) return

    try {
      // Track click
      await trackAdClick(ad.id!)
      console.log('🖱️ Ad click tracked:', ad.name)
      
      // Open target URL
      if (ad.target_url) {
        window.open(ad.target_url, '_blank')
      }
    } catch (err) {
      console.error('💥 Error tracking click:', err)
    }
  }

  // Don't render anything if loading or no ad
  if (loading || !ad) {
    return null
  }

  // Get responsive classes based on ad size
  const getAdSizeClasses = (size: string) => {
    switch (size) {
      case '320x50':
        return 'w-full max-w-[320px] h-[50px]'
      case '320x100':
        return 'w-full max-w-[320px] h-[100px]'
      case '300x250':
        return 'w-full max-w-[300px] h-[250px]'
      case '300x50':
        return 'w-full max-w-[300px] h-[50px]'
      case '336x280':
        return 'w-full max-w-[336px] h-[280px]'
      default:
        return 'w-full'
    }
  }

  const getPlacementClasses = (placement: string) => {
    switch (placement) {
      case 'header':
        return 'flex justify-center mb-4'
      case 'mobile-leaderboard':
        return 'flex justify-center my-4'
      case 'mid-article':
        return 'flex justify-center my-6'
      case 'sidebar':
        return 'flex justify-center'
      case 'bottom-banner':
        return 'flex justify-center mt-6'
      case 'footer':
        return 'flex justify-center'
      default:
        return 'flex justify-center'
    }
  }

  return (
    <div className={`${getPlacementClasses(placement)} ${className}`}>
      <div 
        className={`${getAdSizeClasses(ad.size)} cursor-pointer relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 hover:shadow-md transition-shadow`}
        onClick={handleAdClick}
      >
        {ad.image_url ? (
          <img 
            src={ad.image_url} 
            alt={ad.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          // Fallback placeholder
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">{ad.name}</div>
              <div className="text-xs text-gray-500">{ad.size}</div>
            </div>
          </div>
        )}
        
        {/* Ad label (for transparency) */}
        <div className="absolute top-1 right-1 bg-gray-800 bg-opacity-75 text-white text-xs px-1 py-0.5 rounded">
          Ad
        </div>
      </div>
    </div>
  )
}

// Hook for page view tracking
export function usePageViewTracking() {
  useEffect(() => {
    // Track page view
    const trackPageView = async () => {
      const currentViews = parseInt(localStorage.getItem('pageViewCount') || '0', 10)
      const newViews = currentViews + 1
      localStorage.setItem('pageViewCount', newViews.toString())
      
      console.log('📄 Page view tracked:', newViews)
      
      // Check if we should show pop-under using database settings
      const { shouldShow, settings } = await shouldShowPopUnder()
      
      if (shouldShow && settings) {
        const delay = settings.popunder_settings?.delay_seconds || 2
        setTimeout(() => {
          showPopunder(settings)
        }, delay * 1000)
      }
    }

    trackPageView()
  }, [])
}

// Pop-under functionality with database-driven settings
function showPopunder(ad: Ad) {
  try {
    // Mark as shown with timestamp
    localStorage.setItem('popunderLastShown', new Date().toISOString())
    
    // Track impression
    trackAdImpression(ad.id!)
    
    // Open pop-under window
    const popup = window.open(
      ad.target_url,
      '_blank',
      'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    )
    
    // Focus back to main window (makes it a pop-under)
    if (popup) {
      window.focus()
      console.log('🎯 Pop-under displayed:', ad.name)
      
      // Track click when user interacts with pop-under
      popup.addEventListener('focus', () => {
        trackAdClick(ad.id!)
      })
    }
  } catch (err) {
    console.error('💥 Pop-under error:', err)
  }
} 