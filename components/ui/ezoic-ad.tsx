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
    console.log(`🔍 EzoicAd component loaded for placement ${placementId}`)
    console.log('🔍 Window ezstandalone available:', typeof window !== 'undefined' ? !!window.ezstandalone : 'No window')
    
    // Use Ezoic's official implementation pattern
    if (typeof window !== 'undefined' && window.ezstandalone) {
      window.ezstandalone.cmd.push(function() {
        window.ezstandalone!.showAds(placementId)
      })
      
      console.log(`📺 Ezoic ad placement ${placementId} queued`)
    } else {
      console.log(`⏳ ezstandalone not ready, retrying for placement ${placementId}`)
      // Retry if ezstandalone not ready yet
      const timer = setTimeout(() => {
        if (window.ezstandalone) {
          window.ezstandalone.cmd.push(function() {
            window.ezstandalone!.showAds(placementId)
          })
          console.log(`📺 Ezoic ad placement ${placementId} queued (delayed)`)
        } else {
          console.error(`❌ ezstandalone still not available for placement ${placementId}`)
        }
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [placementId])

  // Ezoic's exact implementation pattern
  return (
    <div className={className}>
      <div id={`ezoic-pub-ad-placeholder-${placementId}`}></div>
      {/* Debug: Visible indicator that component is rendering */}
      <div style={{ 
        border: '2px dashed #ccc', 
        padding: '20px', 
        margin: '10px 0', 
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        fontSize: '14px',
        color: '#666'
      }}>
        🔍 Debug: Ezoic Ad Placeholder {placementId}
        <br />
        <small>Check browser console for logs</small>
      </div>
    </div>
  )
}

 