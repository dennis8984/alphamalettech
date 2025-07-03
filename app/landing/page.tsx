'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Keyword mapping for intelligent routing
const KEYWORD_MAPPINGS = {
  // Fitness keywords
  fitness: [
    'workout', 'exercise', 'gym', 'training', 'muscle', 'strength',
    'cardio', 'abs', 'biceps', 'chest', 'legs', 'back', 'shoulders',
    'crossfit', 'hiit', 'bodybuilding', 'powerlifting', 'calisthenics'
  ],
  // Nutrition keywords
  nutrition: [
    'diet', 'nutrition', 'protein', 'supplement', 'vitamin', 'meal',
    'calories', 'macros', 'keto', 'paleo', 'intermittent fasting',
    'weight loss food', 'healthy eating', 'meal prep', 'protein powder'
  ],
  // Health keywords
  health: [
    'health', 'wellness', 'testosterone', 'sleep', 'stress', 'mental',
    'heart', 'blood pressure', 'diabetes', 'cholesterol', 'immunity',
    'recovery', 'pain', 'injury', 'medical', 'symptoms'
  ],
  // Weight Loss keywords
  'weight-loss': [
    'weight loss', 'lose weight', 'fat loss', 'burn fat', 'slim',
    'lean', 'cutting', 'deficit', 'metabolism', 'belly fat',
    'love handles', 'body fat', 'bmi', 'obesity', 'diet plan'
  ],
  // Style keywords
  style: [
    'style', 'fashion', 'clothes', 'outfit', 'grooming', 'beard',
    'haircut', 'skincare', 'cologne', 'watches', 'shoes', 'suits',
    'casual', 'formal', 'streetwear', 'accessories'
  ],
  // Entertainment keywords
  entertainment: [
    'celebrity', 'actor', 'movie', 'hollywood', 'chris hemsworth',
    'the rock', 'superhero', 'marvel', 'dc', 'athlete', 'nfl',
    'ufc', 'boxing', 'sports', 'documentary'
  ]
}

export default function DynamicLanding() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRedirecting, setIsRedirecting] = useState(true)
  const [targetUrl, setTargetUrl] = useState('')
  
  // Get keyword from various possible parameters
  const keyword = searchParams.get('q') || 
                  searchParams.get('utm_term') || 
                  searchParams.get('keyword') ||
                  searchParams.get('gclid') // Google Click ID present = Google Ads traffic
  
  // Get UTM parameters for tracking
  const utmSource = searchParams.get('utm_source') || 'google'
  const utmMedium = searchParams.get('utm_medium') || 'cpc'
  const utmCampaign = searchParams.get('utm_campaign') || 'dynamic'
  
  useEffect(() => {
    // Track landing page visit
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Dynamic Landing Page',
        page_location: window.location.href,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        keyword: keyword || 'direct'
      })
    }
    
    // Determine best destination
    let destination = '/articles/fitness' // Default destination
    
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase()
      
      // Check each category for keyword matches
      for (const [category, keywords] of Object.entries(KEYWORD_MAPPINGS)) {
        if (keywords.some(kw => lowerKeyword.includes(kw))) {
          destination = `/articles/${category}`
          break
        }
      }
      
      // Special cases for specific high-intent keywords
      if (lowerKeyword.includes('best') || lowerKeyword.includes('top')) {
        // High commercial intent - show category page
        setTargetUrl(destination)
      } else if (lowerKeyword.includes('how to') || lowerKeyword.includes('guide')) {
        // Informational intent - go to search
        destination = `/search?q=${encodeURIComponent(keyword)}`
        setTargetUrl(destination)
      } else if (lowerKeyword.length > 20) {
        // Long-tail keyword - probably specific, use search
        destination = `/search?q=${encodeURIComponent(keyword)}`
        setTargetUrl(destination)
      } else {
        setTargetUrl(destination)
      }
    } else {
      // No keyword - go to homepage
      destination = '/'
      setTargetUrl(destination)
    }
    
    // Redirect after short delay (allows analytics to fire)
    const timer = setTimeout(() => {
      router.push(destination)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [keyword, router, utmSource, utmMedium, utmCampaign])
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            <span className="bg-red-600 text-white px-3 py-2">MEN'S</span>
            <span className="text-black ml-2">HUB</span>
          </h1>
        </div>
        
        {/* Loading indicator */}
        <div className="mb-6">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto" />
        </div>
        
        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">
            Finding the best content for you...
          </h2>
          
          {keyword && (
            <p className="text-gray-600">
              Searching for: <span className="font-medium text-red-600">{keyword}</span>
            </p>
          )}
          
          {targetUrl && (
            <p className="text-sm text-gray-500">
              Redirecting to {targetUrl.includes('search') ? 'search results' : 'relevant articles'}...
            </p>
          )}
        </div>
        
        {/* Manual navigation fallback */}
        <div className="mt-8 text-sm text-gray-500">
          Not redirecting? 
          <button 
            onClick={() => router.push(targetUrl || '/')}
            className="ml-2 text-red-600 hover:text-red-700 font-medium underline"
          >
            Click here
          </button>
        </div>
      </div>
    </div>
  )
}