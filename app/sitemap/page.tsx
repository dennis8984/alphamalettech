import Link from 'next/link'
import { categories } from '@/lib/data'
import { getAllArticles } from '@/lib/articles-db'

const collections = [
  { name: 'Abs Workouts', slug: 'abs-workouts', description: 'Core strengthening exercises and ab routines' },
  { name: 'Muscle Building', slug: 'muscle-building', description: 'Build lean muscle mass with proven strategies' },
  { name: 'Weight Loss Tips', slug: 'weight-loss-tips', description: 'Effective weight management and fat loss' },
  { name: 'Nutrition Guide', slug: 'nutrition-guide', description: 'Complete nutritional guidance and meal planning' },
  { name: 'Cardio Training', slug: 'cardio-training', description: 'Cardiovascular fitness and endurance training' },
  { name: 'Strength Training', slug: 'strength-training', description: 'Power and strength development programs' },
  { name: 'Healthy Recipes', slug: 'healthy-recipes', description: 'Nutritious and delicious meal ideas' },
  { name: 'Workout Plans', slug: 'workout-plans', description: 'Complete training programs and routines' },
  { name: 'Supplement Guide', slug: 'supplement-guide', description: 'Science-backed supplementation advice' },
  { name: 'Mental Health', slug: 'mental-health', description: 'Psychological wellness and stress management' },
  { name: 'Sleep Optimization', slug: 'sleep-optimization', description: 'Better sleep for better health' },
  { name: 'Protein Guide', slug: 'protein-guide', description: 'Complete guide to protein and amino acids' },
  { name: 'Fitness Gear', slug: 'fitness-gear', description: 'Equipment reviews and gear recommendations' },
  { name: 'Grooming Tips', slug: 'grooming-tips', description: 'Male grooming and personal care' },
  { name: 'Style Guide', slug: 'style-guide', description: 'Fashion and style advice for men' },
  { name: 'Relationship Advice', slug: 'relationship-advice', description: 'Dating, relationships, and social skills' }
]

export default async function SitemapPage() {
  const { data: articles } = await getAllArticles()
  const recentArticles = articles?.slice(0, 20) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Men's Hub Sitemap</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Navigate through all content on Men's Hub. Find articles, guides, and resources 
            organized by topic and category for easy discovery.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Sections */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-red-600 pb-2">
              Main Sections
            </h2>
            <div className="space-y-4">
              <Link 
                href="/" 
                className="block p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors border"
              >
                <h3 className="font-semibold text-lg text-gray-900">Home</h3>
                <p className="text-gray-600 text-sm">Latest articles and featured content</p>
              </Link>
              
              {categories.map((category) => (
                <Link 
                  key={category.slug}
                  href={`/articles/${category.slug}`}
                  className="block p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors border"
                >
                  <h3 className="font-semibold text-lg text-gray-900 capitalize">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{category.description}</p>
                </Link>
              ))}
              
              <Link 
                href="/about" 
                className="block p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors border"
              >
                <h3 className="font-semibold text-lg text-gray-900">About</h3>
                <p className="text-gray-600 text-sm">Learn more about Men's Hub</p>
              </Link>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-red-600 pb-2">
              Topic Collections
            </h2>
            <div className="space-y-4">
              {collections.map((collection) => (
                <Link 
                  key={collection.slug}
                  href={`/collections/${collection.slug}`}
                  className="block p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors border"
                >
                  <h3 className="font-semibold text-lg text-gray-900">
                    {collection.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{collection.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Articles */}
        {recentArticles.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-red-600 pb-2">
              Recent Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentArticles.map((article) => (
                <Link 
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="block p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors border"
                >
                  <h3 className="font-semibold text-base text-gray-900 line-clamp-2 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="capitalize bg-red-100 text-red-800 px-2 py-1 rounded">
                      {article.category}
                    </span>
                    <span className="ml-2">
                      {new Date(article.created_at || '').toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* SEO Links */}
        <div className="mt-16 pt-8 border-t">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Site Resources</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/sitemap.xml" className="text-red-600 hover:text-red-700 font-medium">
              XML Sitemap
            </Link>
            <Link href="/robots.txt" className="text-red-600 hover:text-red-700 font-medium">
              Robots.txt
            </Link>
            <Link href="/privacy-policy" className="text-red-600 hover:text-red-700 font-medium">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-red-600 hover:text-red-700 font-medium">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 