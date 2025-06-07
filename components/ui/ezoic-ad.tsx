'use client'

import { useEffect } from 'react'

interface EzoicAdProps {
  placementId: number // Ezoic uses 3-digit numeric IDs like 101, 102, etc.
  className?: string
}

declare global {
  interface Window {
    ezstandalone?: {
      cmd: any[]
      showAds: (...ids: number[]) => void
    }
  }
}

export function EzoicAd({ placementId, className = '' }: EzoicAdProps) {
  useEffect(() => {
    // Use Ezoic's official implementation pattern
    if (typeof window !== 'undefined' && window.ezstandalone) {
      window.ezstandalone.cmd.push(function() {
        window.ezstandalone!.showAds(placementId)
      })
      
      console.log(`📺 Ezoic ad placement ${placementId} queued`)
    } else {
      // Retry if ezstandalone not ready yet
      const timer = setTimeout(() => {
        if (window.ezstandalone) {
          window.ezstandalone.cmd.push(function() {
            window.ezstandalone!.showAds(placementId)
          })
          console.log(`📺 Ezoic ad placement ${placementId} queued (delayed)`)
        }
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [placementId])

  // Ezoic's exact implementation pattern
  return (
    <div className={className}>
      <div id={`ezoic-pub-ad-placeholder-${placementId}`}></div>
    </div>
  )
}

 