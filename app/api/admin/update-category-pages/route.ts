import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { clearArticlesCache } from '@/lib/data'

// Health Category Landing Page Content
const healthLandingContent = `
<div class="category-landing-page">
  <!-- Hero Section -->
  <div class="hero-section bg-gradient-to-r from-red-600 to-red-800 text-white py-16 mb-12">
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-5xl font-bold mb-6">Men's Health Hub</h1>
      <p class="text-xl mb-8 max-w-3xl mx-auto">
        Your ultimate destination for health, wellness, and lifestyle content tailored for the modern man. 
        Discover expert advice, proven strategies, and actionable tips for optimal health and performance.
      </p>
      <div class="flex justify-center gap-4">
        <a href="/articles/fitness" class="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Explore Fitness
        </a>
        <a href="/articles/nutrition" class="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors">
          Nutrition Guide
        </a>
      </div>
    </div>
  </div>

  <!-- Editor's Picks -->
  <section class="mb-16">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-8 text-center">Health Editor's Picks</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop" alt="Mental Health" class="w-full h-48 object-cover">
          <div class="p-6">
            <h3 class="font-bold text-lg mb-2">Mental Health Mastery</h3>
            <p class="text-gray-600 text-sm">Science-backed strategies for stress management and mental wellness.</p>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop" alt="Sleep Optimization" class="w-full h-48 object-cover">
          <div class="p-6">
            <h3 class="font-bold text-lg mb-2">Sleep Optimization</h3>
            <p class="text-gray-600 text-sm">Unlock better sleep for peak performance and recovery.</p>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=250&fit=crop" alt="Preventive Health" class="w-full h-48 object-cover">
          <div class="p-6">
            <h3 class="font-bold text-lg mb-2">Preventive Health</h3>
            <p class="text-gray-600 text-sm">Proactive health measures every man should know.</p>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=250&fit=crop" alt="Longevity" class="w-full h-48 object-cover">
          <div class="p-6">
            <h3 class="font-bold text-lg mb-2">Longevity Secrets</h3>
            <p class="text-gray-600 text-sm">Research-backed methods for healthy aging and vitality.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Health Categories -->
  <section class="mb-16 bg-gray-50 py-16">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-12 text-center">Explore Health Topics</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        <!-- Mental Health -->
        <div class="bg-white p-8 rounded-lg shadow-md">
          <h3 class="text-2xl font-bold mb-4 text-red-600">Mental Health</h3>
          <ul class="space-y-3">
            <li><a href="/search?q=stress+management" class="text-gray-700 hover:text-red-600 transition-colors">Stress Management Techniques</a></li>
            <li><a href="/search?q=anxiety+relief" class="text-gray-700 hover:text-red-600 transition-colors">Anxiety Relief Strategies</a></li>
            <li><a href="/search?q=mindfulness" class="text-gray-700 hover:text-red-600 transition-colors">Mindfulness Practices</a></li>
            <li><a href="/search?q=productivity" class="text-gray-700 hover:text-red-600 transition-colors">Mental Performance Tips</a></li>
          </ul>
        </div>

        <!-- Physical Health -->
        <div class="bg-white p-8 rounded-lg shadow-md">
          <h3 class="text-2xl font-bold mb-4 text-red-600">Physical Health</h3>
          <ul class="space-y-3">
            <li><a href="/search?q=heart+health" class="text-gray-700 hover:text-red-600 transition-colors">Heart Health Essentials</a></li>
            <li><a href="/search?q=immune+system" class="text-gray-700 hover:text-red-600 transition-colors">Immune System Boosters</a></li>
            <li><a href="/search?q=injury+prevention" class="text-gray-700 hover:text-red-600 transition-colors">Injury Prevention</a></li>
            <li><a href="/search?q=recovery" class="text-gray-700 hover:text-red-600 transition-colors">Recovery Protocols</a></li>
          </ul>
        </div>

        <!-- Lifestyle Health -->
        <div class="bg-white p-8 rounded-lg shadow-md">
          <h3 class="text-2xl font-bold mb-4 text-red-600">Lifestyle Health</h3>
          <ul class="space-y-3">
            <li><a href="/search?q=sleep" class="text-gray-700 hover:text-red-600 transition-colors">Sleep Optimization</a></li>
            <li><a href="/search?q=hydration" class="text-gray-700 hover:text-red-600 transition-colors">Hydration Guidelines</a></li>
            <li><a href="/search?q=work+life+balance" class="text-gray-700 hover:text-red-600 transition-colors">Work-Life Balance</a></li>
            <li><a href="/search?q=habits" class="text-gray-700 hover:text-red-600 transition-colors">Healthy Habits</a></li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Expert Advice Section -->
  <section class="mb-16">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-8 text-center">Expert Health Advice</h2>
      <div class="bg-red-50 border-l-4 border-red-600 p-8 rounded-lg">
        <div class="flex items-start space-x-4">
          <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face" alt="Health Expert" class="w-16 h-16 rounded-full">
          <div>
            <h3 class="text-xl font-bold mb-2">Dr. Michael Health, MD</h3>
            <p class="text-gray-700 mb-4">
              "The key to optimal health isn't just avoiding disease—it's actively building resilience, energy, and vitality. 
              Focus on the fundamentals: quality sleep, regular movement, proper nutrition, and stress management."
            </p>
            <p class="text-sm text-gray-600">Board-Certified Internal Medicine Physician</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Newsletter Signup -->
  <section class="bg-red-600 text-white py-16">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl font-bold mb-4">Get the Latest Health Tips</h2>
      <p class="text-xl mb-8 max-w-2xl mx-auto">
        Join thousands of men who receive weekly health insights, workout tips, and nutrition advice delivered directly to their inbox.
      </p>
      <div class="max-w-md mx-auto">
        <div class="flex gap-2">
          <input type="email" placeholder="Enter your email" class="flex-1 px-4 py-3 rounded-lg text-gray-900">
          <button class="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  </section>
</div>
`

// Fitness Category Landing Page Content  
const fitnessLandingContent = `
<div class="category-landing-page">
  <!-- Hero Section -->
  <div class="hero-section bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 mb-12">
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-5xl font-bold mb-6">Ultimate Fitness Hub</h1>
      <p class="text-xl mb-8 max-w-3xl mx-auto">
        Transform your body and unlock your potential with expert-designed workouts, training programs, 
        and fitness strategies proven to deliver real results.
      </p>
      <div class="flex justify-center gap-4">
        <a href="/search?q=workout+plan" class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Start Training
        </a>
        <a href="/search?q=muscle+building" class="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
          Build Muscle
        </a>
      </div>
    </div>
  </div>

  <!-- Fitness Programs -->
  <section class="mb-16">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-8 text-center">Featured Fitness Programs</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=250&fit=crop" alt="Strength Training" class="w-full h-48 object-cover">
          <div class="p-6">
            <h3 class="font-bold text-xl mb-3">Strength Training Mastery</h3>
            <p class="text-gray-600 mb-4">Build serious muscle and strength with proven compound movements and progressive overload techniques.</p>
            <div class="flex justify-between items-center">
              <span class="text-blue-600 font-semibold">12 Week Program</span>
              <a href="/search?q=strength+training" class="text-blue-600 hover:text-blue-800 font-medium">Learn More →</a>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1571019613540-996a5c9b6c6e?w=400&h=250&fit=crop" alt="Fat Loss" class="w-full h-48 object-cover">
          <div class="p-6">
            <h3 class="font-bold text-xl mb-3">Fat Loss Accelerator</h3>
            <p class="text-gray-600 mb-4">Science-based approach to burning fat while preserving muscle mass through strategic training and nutrition.</p>
            <div class="flex justify-between items-center">
              <span class="text-blue-600 font-semibold">8 Week Program</span>
              <a href="/search?q=fat+loss" class="text-blue-600 hover:text-blue-800 font-medium">Learn More →</a>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1571019613540-996a5c9b6c6e?w=400&h=250&fit=crop" alt="Athletic Performance" class="w-full h-48 object-cover">
          <div class="p-6">
            <h3 class="font-bold text-xl mb-3">Athletic Performance</h3>
            <p class="text-gray-600 mb-4">Enhance speed, power, and agility with sport-specific training protocols used by elite athletes.</p>
            <div class="flex justify-between items-center">
              <span class="text-blue-600 font-semibold">16 Week Program</span>
              <a href="/search?q=athletic+performance" class="text-blue-600 hover:text-blue-800 font-medium">Learn More →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Workout Categories -->
  <section class="mb-16 bg-gray-50 py-16">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-12 text-center">Workout Categories</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Muscle Building -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-bold mb-4 text-blue-600">Muscle Building</h3>
          <ul class="space-y-2">
            <li><a href="/search?q=chest+workout" class="text-gray-700 hover:text-blue-600 transition-colors">Chest Workouts</a></li>
            <li><a href="/search?q=back+workout" class="text-gray-700 hover:text-blue-600 transition-colors">Back Training</a></li>
            <li><a href="/search?q=arm+workout" class="text-gray-700 hover:text-blue-600 transition-colors">Arm Development</a></li>
            <li><a href="/search?q=leg+workout" class="text-gray-700 hover:text-blue-600 transition-colors">Leg Training</a></li>
          </ul>
        </div>

        <!-- Cardio Training -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-bold mb-4 text-blue-600">Cardio Training</h3>
          <ul class="space-y-2">
            <li><a href="/search?q=hiit+workout" class="text-gray-700 hover:text-blue-600 transition-colors">HIIT Workouts</a></li>
            <li><a href="/search?q=running" class="text-gray-700 hover:text-blue-600 transition-colors">Running Programs</a></li>
            <li><a href="/search?q=cycling" class="text-gray-700 hover:text-blue-600 transition-colors">Cycling Training</a></li>
            <li><a href="/search?q=endurance" class="text-gray-700 hover:text-blue-600 transition-colors">Endurance Building</a></li>
          </ul>
        </div>

        <!-- Functional Fitness -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-bold mb-4 text-blue-600">Functional Fitness</h3>
          <ul class="space-y-2">
            <li><a href="/search?q=mobility" class="text-gray-700 hover:text-blue-600 transition-colors">Mobility Work</a></li>
            <li><a href="/search?q=core+strength" class="text-gray-700 hover:text-blue-600 transition-colors">Core Strength</a></li>
            <li><a href="/search?q=flexibility" class="text-gray-700 hover:text-blue-600 transition-colors">Flexibility Training</a></li>
            <li><a href="/search?q=bodyweight" class="text-gray-700 hover:text-blue-600 transition-colors">Bodyweight Exercises</a></li>
          </ul>
        </div>

        <!-- Specialized Training -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-bold mb-4 text-blue-600">Specialized Training</h3>
          <ul class="space-y-2">
            <li><a href="/search?q=powerlifting" class="text-gray-700 hover:text-blue-600 transition-colors">Powerlifting</a></li>
            <li><a href="/search?q=calisthenics" class="text-gray-700 hover:text-blue-600 transition-colors">Calisthenics</a></li>
            <li><a href="/search?q=crossfit" class="text-gray-700 hover:text-blue-600 transition-colors">CrossFit Training</a></li>
            <li><a href="/search?q=martial+arts" class="text-gray-700 hover:text-blue-600 transition-colors">Martial Arts</a></li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Trainer Spotlight -->
  <section class="mb-16">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-8 text-center">Expert Trainers</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center">
          <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face" alt="Trainer" class="w-24 h-24 rounded-full mx-auto mb-4">
          <h3 class="font-bold text-lg">Mike Johnson</h3>
          <p class="text-blue-600 font-medium">Strength Coach</p>
          <p class="text-gray-600 text-sm mt-2">15+ years training elite athletes</p>
        </div>
        <div class="text-center">
          <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face" alt="Trainer" class="w-24 h-24 rounded-full mx-auto mb-4">
          <h3 class="font-bold text-lg">Sarah Davis</h3>
          <p class="text-blue-600 font-medium">Functional Movement</p>
          <p class="text-gray-600 text-sm mt-2">NASM-CPT, Movement Specialist</p>
        </div>
        <div class="text-center">
          <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face" alt="Trainer" class="w-24 h-24 rounded-full mx-auto mb-4">
          <h3 class="font-bold text-lg">Alex Rodriguez</h3>
          <p class="text-blue-600 font-medium">Performance Coach</p>
          <p class="text-gray-600 text-sm mt-2">Olympic lifting specialist</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Newsletter Signup -->
  <section class="bg-blue-600 text-white py-16">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl font-bold mb-4">Get Free Weekly Workouts</h2>
      <p class="text-xl mb-8 max-w-2xl mx-auto">
        Join over 50,000 men who receive expert workout plans, training tips, and fitness motivation delivered weekly.
      </p>
      <div class="max-w-md mx-auto">
        <div class="flex gap-2">
          <input type="email" placeholder="Enter your email" class="flex-1 px-4 py-3 rounded-lg text-gray-900">
          <button class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Workouts
          </button>
        </div>
      </div>
    </div>
  </section>
</div>
`

export async function POST() {
  try {
    console.log('🔄 Updating category landing pages...')
    
    // Update Welcome to Men's Hub (Health category)
    console.log('📝 Updating Health category page...')
    const { error: healthError } = await supabase
      .from('articles')
      .update({
        content: healthLandingContent,
        excerpt: 'Your ultimate destination for health, wellness, and lifestyle content tailored for the modern man. Discover expert advice, proven strategies, and actionable tips for optimal health and performance.',
        featured_image: 'https://images.unsplash.com/photo-1571019613540-996a5c9b6c6e?w=1200&h=600&fit=crop',
        tags: ['health', 'wellness', 'lifestyle', 'men\'s health', 'prevention']
      })
      .eq('slug', 'welcome-to-mens-hub')

    if (healthError) {
      console.error('❌ Failed to update health page:', healthError)
      return NextResponse.json({ error: 'Failed to update health page' }, { status: 500 })
    }
    
    console.log('✅ Health category page updated successfully')

    // Update Ultimate Workout Guide (Fitness category)
    console.log('📝 Updating Fitness category page...')
    const { error: fitnessError } = await supabase
      .from('articles')
      .update({
        content: fitnessLandingContent,
        excerpt: 'Transform your body and unlock your potential with expert-designed workouts, training programs, and fitness strategies proven to deliver real results.',
        featured_image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200&h=600&fit=crop',
        tags: ['fitness', 'workout', 'training', 'muscle building', 'strength']
      })
      .eq('slug', 'ultimate-workout-guide')

    if (fitnessError) {
      console.error('❌ Failed to update fitness page:', fitnessError)
      return NextResponse.json({ error: 'Failed to update fitness page' }, { status: 500 })
    }
    
    console.log('✅ Fitness category page updated successfully')

    // Clear cache
    clearArticlesCache()
    console.log('🔄 Articles cache cleared')
    
    console.log('🎉 Category pages updated successfully!')
    
    return NextResponse.json({
      success: true,
      message: 'Category pages updated successfully',
      updated: ['welcome-to-mens-hub', 'ultimate-workout-guide']
    })
    
  } catch (error) {
    console.error('💥 Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update category pages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 