import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { clearArticlesCache } from '@/lib/data'

// Nutrition Category Landing Page Content
const nutritionLandingContent = `
<div class="category-landing-page">
  <!-- Hero Section -->
  <div class="hero-section bg-gradient-to-r from-green-600 to-green-800 text-white py-16 mb-12">
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-5xl font-bold mb-6">Nutrition Mastery Hub</h1>
      <p class="text-xl mb-8 max-w-3xl mx-auto">
        Master the art of eating for optimal health, performance, and longevity. Discover science-backed nutrition strategies,
        meal planning tips, and expert dietary guidance tailored for men's unique nutritional needs.
      </p>
      <div class="flex justify-center gap-4">
        <a href="/search?q=meal+plan" class="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Get Meal Plans
        </a>
        <a href="/search?q=supplements" class="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
          Supplement Guide
        </a>
      </div>
    </div>
  </div>

  <!-- Nutrition Programs -->
  <section class="mb-16">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-8 text-center">Featured Nutrition Programs</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop" alt="Muscle Building Nutrition" class="w-full h-48 object-cover">
          <div class="p-6">
            <h3 class="font-bold text-xl mb-3">Muscle Building Nutrition</h3>
            <p class="text-gray-600 mb-4">Optimize your diet for maximum muscle growth with strategic protein timing and nutrient partitioning.</p>
            <div class="flex justify-between items-center">
              <span class="text-green-600 font-semibold">Complete Guide</span>
              <a href="/search?q=muscle+building+nutrition" class="text-green-600 hover:text-green-800 font-medium">Learn More →</a>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=250&fit=crop" alt="Fat Loss Nutrition" class="w-full h-48 object-cover">
          <div class="p-6">
            <h3 class="font-bold text-xl mb-3">Fat Loss Nutrition</h3>
            <p class="text-gray-600 mb-4">Science-based nutrition strategies for sustainable fat loss while maintaining muscle mass and energy.</p>
            <div class="flex justify-between items-center">
              <span class="text-green-600 font-semibold">8 Week Plan</span>
              <a href="/search?q=fat+loss+nutrition" class="text-green-600 hover:text-green-800 font-medium">Learn More →</a>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=250&fit=crop" alt="Performance Nutrition" class="w-full h-48 object-cover">
          <div class="p-6">
            <h3 class="font-bold text-xl mb-3">Performance Nutrition</h3>
            <p class="text-gray-600 mb-4">Fuel your workouts and recovery with precision nutrition timing and athletic performance protocols.</p>
            <div class="flex justify-between items-center">
              <span class="text-green-600 font-semibold">Pro Level</span>
              <a href="/search?q=performance+nutrition" class="text-green-600 hover:text-green-800 font-medium">Learn More →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Nutrition Categories -->
  <section class="mb-16 bg-gray-50 py-16">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-12 text-center">Nutrition Categories</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Macronutrients -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-bold mb-4 text-green-600">Macronutrients</h3>
          <ul class="space-y-2">
            <li><a href="/search?q=protein+intake" class="text-gray-700 hover:text-green-600 transition-colors">Protein Requirements</a></li>
            <li><a href="/search?q=carbohydrate+timing" class="text-gray-700 hover:text-green-600 transition-colors">Carb Timing</a></li>
            <li><a href="/search?q=healthy+fats" class="text-gray-700 hover:text-green-600 transition-colors">Healthy Fats</a></li>
            <li><a href="/search?q=macro+tracking" class="text-gray-700 hover:text-green-600 transition-colors">Macro Tracking</a></li>
          </ul>
        </div>

        <!-- Meal Planning -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-bold mb-4 text-green-600">Meal Planning</h3>
          <ul class="space-y-2">
            <li><a href="/search?q=meal+prep" class="text-gray-700 hover:text-green-600 transition-colors">Meal Prep Strategies</a></li>
            <li><a href="/search?q=healthy+recipes" class="text-gray-700 hover:text-green-600 transition-colors">Healthy Recipes</a></li>
            <li><a href="/search?q=budget+nutrition" class="text-gray-700 hover:text-green-600 transition-colors">Budget Nutrition</a></li>
            <li><a href="/search?q=quick+meals" class="text-gray-700 hover:text-green-600 transition-colors">Quick Meal Ideas</a></li>
          </ul>
        </div>

        <!-- Supplements -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-bold mb-4 text-green-600">Supplements</h3>
          <ul class="space-y-2">
            <li><a href="/search?q=protein+powder" class="text-gray-700 hover:text-green-600 transition-colors">Protein Powders</a></li>
            <li><a href="/search?q=creatine" class="text-gray-700 hover:text-green-600 transition-colors">Creatine Guide</a></li>
            <li><a href="/search?q=vitamins" class="text-gray-700 hover:text-green-600 transition-colors">Essential Vitamins</a></li>
            <li><a href="/search?q=pre+workout" class="text-gray-700 hover:text-green-600 transition-colors">Pre-Workout Nutrition</a></li>
          </ul>
        </div>

        <!-- Special Diets -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-bold mb-4 text-green-600">Special Diets</h3>
          <ul class="space-y-2">
            <li><a href="/search?q=keto+diet" class="text-gray-700 hover:text-green-600 transition-colors">Keto for Men</a></li>
            <li><a href="/search?q=intermittent+fasting" class="text-gray-700 hover:text-green-600 transition-colors">Intermittent Fasting</a></li>
            <li><a href="/search?q=plant+based" class="text-gray-700 hover:text-green-600 transition-colors">Plant-Based Nutrition</a></li>
            <li><a href="/search?q=mediterranean+diet" class="text-gray-700 hover:text-green-600 transition-colors">Mediterranean Diet</a></li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Expert Nutritionist -->
  <section class="mb-16">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-8 text-center">Expert Nutritionists</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center">
          <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face" alt="Nutritionist" class="w-24 h-24 rounded-full mx-auto mb-4">
          <h3 class="font-bold text-lg">Dr. Sarah Nutrition, RD</h3>
          <p class="text-green-600 font-medium">Sports Nutritionist</p>
          <p class="text-gray-600 text-sm mt-2">PhD in Nutritional Sciences</p>
        </div>
        <div class="text-center">
          <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face" alt="Nutritionist" class="w-24 h-24 rounded-full mx-auto mb-4">
          <h3 class="font-bold text-lg">Mark Thompson, MS</h3>
          <p class="text-green-600 font-medium">Performance Nutritionist</p>
          <p class="text-gray-600 text-sm mt-2">Masters in Exercise Nutrition</p>
        </div>
        <div class="text-center">
          <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face" alt="Nutritionist" class="w-24 h-24 rounded-full mx-auto mb-4">
          <h3 class="font-bold text-lg">Lisa Chen, RD</h3>
          <p class="text-green-600 font-medium">Clinical Nutritionist</p>
          <p class="text-gray-600 text-sm mt-2">Registered Dietitian</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Quote -->
  <section class="mb-16">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-8 text-center">Expert Nutrition Advice</h2>
      <div class="bg-green-50 border-l-4 border-green-600 p-8 rounded-lg">
        <div class="flex items-start space-x-4">
          <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face" alt="Nutrition Expert" class="w-16 h-16 rounded-full">
          <div>
            <h3 class="text-xl font-bold mb-2">Dr. Sarah Nutrition, RD</h3>
            <p class="text-gray-700 mb-4">
              "Optimal nutrition isn't about perfection—it's about consistency and making informed choices that support your goals. 
              Focus on whole foods, adequate protein, and timing your nutrition around your training for best results."
            </p>
            <p class="text-sm text-gray-600">PhD Nutritional Sciences, Sports Nutrition Specialist</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Newsletter Signup -->
  <section class="bg-green-600 text-white py-16">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl font-bold mb-4">Get Weekly Nutrition Tips</h2>
      <p class="text-xl mb-8 max-w-2xl mx-auto">
        Join thousands of men who receive expert nutrition advice, meal plans, and healthy recipes delivered weekly.
      </p>
      <div class="max-w-md mx-auto">
        <div class="flex gap-2">
          <input type="email" placeholder="Enter your email" class="flex-1 px-4 py-3 rounded-lg text-gray-900">
          <button class="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Nutrition Tips
          </button>
        </div>
      </div>
    </div>
  </section>
</div>
`

export async function POST() {
  try {
    console.log('🥗 Creating nutrition category landing page...')
    
    // Create the nutrition landing page article
    const { data, error } = await supabase
      .from('articles')
      .insert({
        title: 'Nutrition Mastery Hub',
        slug: 'nutrition-hub',
        content: nutritionLandingContent,
        excerpt: 'Master the art of eating for optimal health, performance, and longevity. Discover science-backed nutrition strategies, meal planning tips, and expert dietary guidance tailored for men\'s unique nutritional needs.',
        category: 'nutrition',
        status: 'published',
        featured_image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=600&fit=crop',
        tags: ['nutrition', 'diet', 'meal planning', 'supplements', 'healthy eating'],
        author: 'Nutrition Expert',
        published_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('❌ Failed to create nutrition page:', error)
      return NextResponse.json({ error: 'Failed to create nutrition page' }, { status: 500 })
    }
    
    console.log('✅ Nutrition category page created successfully')

    // Clear cache
    clearArticlesCache()
    console.log('🔄 Articles cache cleared')
    
    console.log('🎉 Nutrition landing page created successfully!')
    
    return NextResponse.json({
      success: true,
      message: 'Nutrition landing page created successfully',
      article: data?.[0] || null
    })
    
  } catch (error) {
    console.error('💥 Creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create nutrition landing page', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 