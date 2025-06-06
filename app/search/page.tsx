import Link from 'next/link';
import { Search } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block text-3xl font-bold text-gray-900 mb-6">
            <span className="bg-red-600 text-white px-2 py-1 mr-1">MEN&apos;S</span>
            HUB
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Search Men&apos;s Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find articles on fitness, nutrition, health, style, and more
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <form className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search articles, topics, or categories..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Search Articles
            </button>
          </form>
        </div>

        {/* Popular Categories */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Fitness', slug: 'fitness', count: 150 },
              { name: 'Nutrition', slug: 'nutrition', count: 120 },
              { name: 'Health', slug: 'health', count: 100 },
              { name: 'Style', slug: 'style', count: 80 },
              { name: 'Weight Loss', slug: 'weight-loss', count: 90 },
              { name: 'Entertainment', slug: 'entertainment', count: 60 }
            ].map((category) => (
              <Link
                key={category.slug}
                href={`/articles/${category.slug}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.count} articles</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Articles Preview */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Articles</h2>
          <div className="space-y-4">
            {[
              'Ultimate Guide to Building Muscle',
              'Best Nutrition Tips for Men',
              'Mental Health Strategies',
              'Workout Routines for Beginners'
            ].map((title, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 hover:text-red-600 cursor-pointer">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Discover expert advice and actionable tips...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link href="/" className="text-red-600 hover:text-red-700 font-medium">
            ← Back to Men&apos;s Hub
          </Link>
        </div>
      </div>
    </div>
  );
} 