'use client'

import { useEffect, useRef } from 'react'

interface EzoicAdProps {
  placement: 'sidebar' | 'banner' | 'footer'
  adId: string
  className?: string
}

declare global {
  interface Window {
    ezstandalone?: {
      cmd: any[]
      define: (adId: string, options: any) => void
    }
  }
}

export function EzoicAd({ placement, adId, className = '' }: EzoicAdProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current) return

    // Load Ezoic script if not already loaded
    if (!document.querySelector('script[src*="ezoic.net"]')) {
      const script = document.createElement('script')
      script.async = true
      script.src = '//go.ezoic.net/ezoic/ezoic.js'
      document.head.appendChild(script)
      
      console.log('📺 Ezoic script loaded')
    }

    // Initialize Ezoic ads
    const initializeEzoicAd = () => {
      if (typeof window !== 'undefined' && window.ezstandalone) {
        try {
          window.ezstandalone.define(adId, {
            // Ad configuration
            slot: adId,
            sizes: getAdSizes(placement),
            responsive: true
          })
          
          console.log(`📺 Ezoic ad initialized: ${adId}`)
          isInitialized.current = true
        } catch (error) {
          console.error('❌ Ezoic ad initialization error:', error)
        }
      } else {
        // Retry initialization after a short delay
        setTimeout(initializeEzoicAd, 100)
      }
    }

    initializeEzoicAd()
  }, [adId, placement])

  const getAdSizes = (placement: string) => {
    switch (placement) {
      case 'sidebar':
        return [[300, 250], [336, 280], [320, 50]]
      case 'banner':
        return [[728, 90], [970, 250], [320, 50]]
      case 'footer':
        return [[728, 90], [320, 50]]
      default:
        return [[300, 250]]
    }
  }

  const getPlacementClasses = (placement: string) => {
    switch (placement) {
      case 'sidebar':
        return 'flex justify-center my-4'
      case 'banner':
        return 'flex justify-center mb-4'
      case 'footer':
        return 'flex justify-center mt-6'
      default:
        return 'flex justify-center'
    }
  }

  return (
    <div className={`${getPlacementClasses(placement)} ${className}`}>
      <div 
        ref={adRef}
        id={adId}
        className="ezoic-ad-container"
        style={{
          minHeight: placement === 'sidebar' ? '250px' : '90px',
          minWidth: placement === 'sidebar' ? '300px' : '320px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px'
        }}
      >
        {/* Placeholder content while ad loads */}
        <div className="text-center text-gray-500">
          <div className="text-sm font-medium">Advertisement</div>
          <div className="text-xs">Loading...</div>
        </div>
      </div>
    </div>
  )
}

// Hook to load Ezoic ads on page
export function useEzoicAds() {
  useEffect(() => {
    // Initialize Ezoic command queue if not exists
    if (typeof window !== 'undefined' && !window.ezstandalone) {
      window.ezstandalone = {
        cmd: [],
        define: function(adId: string, options: any) {
          this.cmd.push(['define', adId, options])
        }
      }
    }
  }, [])
} 