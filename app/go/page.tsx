import { redirect } from 'next/navigation'

// Server-side dynamic landing page for Google Ads
// Use this for faster redirects: yoursite.com/go?q=keyword

// Keyword mapping for intelligent routing
const KEYWORD_CATEGORIES: Record<string, string[]> = {
  fitness: [
    'workout', 'exercise', 'gym', 'training', 'muscle', 'strength',
    'cardio', 'abs', 'biceps', 'chest', 'legs', 'back', 'shoulders',
    'crossfit', 'hiit', 'bodybuilding', 'powerlifting', 'calisthenics',
    'dumbbell', 'barbell', 'squat', 'deadlift', 'bench press'
  ],
  nutrition: [
    'diet', 'nutrition', 'protein', 'supplement', 'vitamin', 'meal',
    'calories', 'macros', 'keto', 'paleo', 'intermittent fasting',
    'weight loss food', 'healthy eating', 'meal prep', 'protein powder',
    'creatine', 'whey', 'casein', 'bcaa', 'pre workout'
  ],
  health: [
    'health', 'wellness', 'testosterone', 'sleep', 'stress', 'mental',
    'heart', 'blood pressure', 'diabetes', 'cholesterol', 'immunity',
    'recovery', 'pain', 'injury', 'medical', 'symptoms', 'anxiety',
    'depression', 'therapy', 'mindfulness', 'meditation'
  ],
  'weight-loss': [
    'weight loss', 'lose weight', 'fat loss', 'burn fat', 'slim',
    'lean', 'cutting', 'deficit', 'metabolism', 'belly fat',
    'love handles', 'body fat', 'bmi', 'obesity', 'diet plan',
    'calorie deficit', 'fat burner', 'thermogenic'
  ],
  style: [
    'style', 'fashion', 'clothes', 'outfit', 'grooming', 'beard',
    'haircut', 'skincare', 'cologne', 'watches', 'shoes', 'suits',
    'casual', 'formal', 'streetwear', 'accessories', 'wardrobe'
  ],
  entertainment: [
    'celebrity', 'actor', 'movie', 'hollywood', 'chris hemsworth',
    'the rock', 'superhero', 'marvel', 'dc', 'athlete', 'nfl',
    'ufc', 'boxing', 'sports', 'documentary', 'dwayne johnson'
  ]
}

function findBestCategory(keyword: string): string {
  const lowerKeyword = keyword.toLowerCase()
  
  // Check each category for matches
  for (const [category, keywords] of Object.entries(KEYWORD_CATEGORIES)) {
    if (keywords.some(kw => lowerKeyword.includes(kw))) {
      return category
    }
  }
  
  // Default to fitness if no match
  return 'fitness'
}

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function DynamicGoPage({ searchParams }: PageProps) {
  // Get keyword from various possible parameters
  const keyword = (searchParams.q || 
                  searchParams.utm_term || 
                  searchParams.keyword ||
                  searchParams.k || '') as string
  
  // If no keyword, go to homepage
  if (!keyword) {
    redirect('/')
  }
  
  // Determine destination based on keyword
  let destination = '/'
  
  // Check for high commercial intent
  if (keyword.toLowerCase().includes('best') || 
      keyword.toLowerCase().includes('top') ||
      keyword.toLowerCase().includes('review')) {
    // Commercial intent - go to category
    const category = findBestCategory(keyword)
    destination = `/articles/${category}`
  } 
  // Check for informational intent
  else if (keyword.toLowerCase().includes('how to') || 
           keyword.toLowerCase().includes('guide') ||
           keyword.toLowerCase().includes('what is')) {
    // Informational intent - go to search
    destination = `/search?q=${encodeURIComponent(keyword)}`
  }
  // Long-tail keywords
  else if (keyword.length > 30) {
    // Very specific - use search
    destination = `/search?q=${encodeURIComponent(keyword)}`
  }
  // Short keywords
  else {
    // Find best category match
    const category = findBestCategory(keyword)
    destination = `/articles/${category}`
  }
  
  // Append UTM parameters if present
  const utmParams = []
  if (searchParams.utm_source) utmParams.push(`utm_source=${searchParams.utm_source}`)
  if (searchParams.utm_medium) utmParams.push(`utm_medium=${searchParams.utm_medium}`)
  if (searchParams.utm_campaign) utmParams.push(`utm_campaign=${searchParams.utm_campaign}`)
  if (searchParams.gclid) utmParams.push(`gclid=${searchParams.gclid}`)
  
  if (utmParams.length > 0) {
    destination += destination.includes('?') ? '&' : '?'
    destination += utmParams.join('&')
  }
  
  // Perform redirect
  redirect(destination)
}