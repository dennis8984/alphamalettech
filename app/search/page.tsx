'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  published_at: string | null;
  created_at: string;
  image_url: string | null;
  relevanceScore?: number;
}

interface SearchResults {
  results: Article[];
  total: number;
  query: string;
}

interface SearchError {
  error: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (response.ok) {
        const searchResults = data as SearchResults;
        setResults(searchResults.results);
        setHasSearched(true);
      } else {
        const errorResponse = data as SearchError;
        setError(errorResponse.error || 'Search failed');
      }
    } catch (err) {
      setError('Failed to search articles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  // Search on URL params if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlQuery = urlParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    }
  }, []);
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles, topics, or categories..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
                autoFocus
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Searching...
                </>
              ) : (
                'Search Articles'
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {results.length > 0 ? (
                `Found ${results.length} article${results.length === 1 ? '' : 's'} for "${query}"`
              ) : (
                `No articles found for "${query}"`
              )}
            </h2>
            
            {results.length > 0 ? (
              <div className="space-y-6">
                {results.map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="block p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-4">
                      {article.image_url && (
                        <div className="flex-shrink-0">
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 hover:text-red-600 transition-colors">
                            {article.title}
                          </h3>
                          {article.category && (
                            <span className="text-sm text-red-600 font-medium ml-4">
                              {article.category}
                            </span>
                          )}
                        </div>
                        {article.excerpt && (
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Try searching for different keywords or browse our popular categories below.</p>
              </div>
            )}
          </div>
        )}

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