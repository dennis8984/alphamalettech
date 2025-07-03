'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Lightweight landing page for Google Ads
// Usage: yoursite.com/l?q=keyword
// or: yoursite.com/l?utm_term=keyword

export default function QuickLanding() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Get keyword from various sources
    const keyword = searchParams.get('q') || 
                   searchParams.get('utm_term') || 
                   searchParams.get('keyword') || 
                   searchParams.get('k') || ''
    
    // Quick keyword analysis
    const lowerKeyword = keyword.toLowerCase()
    let destination = '/'
    
    // Route based on keyword content
    if (!keyword) {
      destination = '/'
    } else if (
      lowerKeyword.includes('workout') || 
      lowerKeyword.includes('exercise') ||
      lowerKeyword.includes('muscle') ||
      lowerKeyword.includes('gym')
    ) {
      destination = '/articles/fitness'
    } else if (
      lowerKeyword.includes('diet') || 
      lowerKeyword.includes('nutrition') ||
      lowerKeyword.includes('protein') ||
      lowerKeyword.includes('supplement')
    ) {
      destination = '/articles/nutrition'
    } else if (
      lowerKeyword.includes('weight loss') || 
      lowerKeyword.includes('fat loss') ||
      lowerKeyword.includes('lose weight') ||
      lowerKeyword.includes('burn fat')
    ) {
      destination = '/articles/weight-loss'
    } else if (
      lowerKeyword.includes('health') || 
      lowerKeyword.includes('wellness') ||
      lowerKeyword.includes('medical') ||
      lowerKeyword.includes('doctor')
    ) {
      destination = '/articles/health'
    } else if (
      lowerKeyword.includes('style') || 
      lowerKeyword.includes('fashion') ||
      lowerKeyword.includes('grooming') ||
      lowerKeyword.includes('clothes')
    ) {
      destination = '/articles/style'
    } else {
      // Default to search for unmatched keywords
      destination = `/search?q=${encodeURIComponent(keyword)}`
    }
    
    // Preserve UTM parameters
    const utm = new URLSearchParams()
    if (searchParams.get('utm_source')) utm.set('utm_source', searchParams.get('utm_source')!)
    if (searchParams.get('utm_medium')) utm.set('utm_medium', searchParams.get('utm_medium')!)
    if (searchParams.get('utm_campaign')) utm.set('utm_campaign', searchParams.get('utm_campaign')!)
    if (searchParams.get('gclid')) utm.set('gclid', searchParams.get('gclid')!)
    
    if (utm.toString()) {
      destination += destination.includes('?') ? '&' : '?'
      destination += utm.toString()
    }
    
    // Immediate redirect
    router.replace(destination)
  }, [router, searchParams])
  
  // Minimal loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          <span className="bg-red-600 text-white px-2 py-1">MEN'S</span>
          <span className="ml-1">HUB</span>
        </h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}