'use client'

import HeroArticle from '@/components/articles/HeroArticle';
import TrendingArticles from '@/components/articles/TrendingArticles';
import CategorySection from '@/components/articles/CategorySection';
import Newsletter from '@/components/layout/Newsletter';
import { AdSlot, usePageViewTracking } from '@/components/ui/ad-slot';
import { 
  getFeaturedArticles,
  getTrendingArticles,
  getArticlesByCategory
} from '@/lib/data';

export default function Home() {
  // Track page views for pop-under functionality
  usePageViewTracking();

  const featuredArticles = getFeaturedArticles();
  const trendingArticles = getTrendingArticles();
  
  const fitnessArticles = getArticlesByCategory('fitness');
  const nutritionArticles = getArticlesByCategory('nutrition');
  const healthArticles = getArticlesByCategory('health');
  const weightLossArticles = getArticlesByCategory('weight-loss');

  return (
    <div>
      {/* Header Ad */}
      <AdSlot placement="header" className="container mx-auto px-4 mb-6" />

      {/* Hero Section */}
      {featuredArticles[0] && (
        <HeroArticle article={featuredArticles[0]} />
      )}

      {/* Mobile Leaderboard Ad */}
      <AdSlot placement="mobile-leaderboard" className="container mx-auto px-4 my-8" />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Trending Articles */}
            <TrendingArticles articles={trendingArticles} />

            {/* Mid-Content Ad */}
            <AdSlot placement="mid-article" className="my-8" />

            {/* Fitness Section */}
            <CategorySection 
              title="Fitness" 
              articles={fitnessArticles} 
              categorySlug="fitness" 
            />

            {/* Nutrition Section */}
            <CategorySection 
              title="Nutrition" 
              articles={nutritionArticles} 
              categorySlug="nutrition" 
            />

            {/* Health Section */}
            <CategorySection 
              title="Health" 
              articles={healthArticles} 
              categorySlug="health" 
            />

            {/* Weight Loss Section */}
            <CategorySection 
              title="Weight Loss" 
              articles={weightLossArticles} 
              categorySlug="weight-loss" 
            />

            {/* Bottom Banner Ad */}
            <AdSlot placement="bottom-banner" className="my-8" />

            {/* Newsletter */}
            <Newsletter />
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Sidebar Ad */}
              <AdSlot placement="sidebar" />
              
              {/* Newsletter Signup */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold mb-3">Stay Updated</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get the latest fitness, nutrition, and health tips delivered to your inbox.
                </p>
                <Newsletter />
              </div>

              {/* More Sidebar Ads */}
              <AdSlot placement="sidebar" />

              {/* Trending Topics */}
              <div className="bg-white border border-gray-200 p-6 rounded-lg">
                <h3 className="font-bold mb-4">Trending Topics</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/articles/fitness" className="text-gray-700 hover:text-red-600">Strength Training</a></li>
                  <li><a href="/articles/nutrition" className="text-gray-700 hover:text-red-600">Protein Intake</a></li>
                  <li><a href="/articles/health" className="text-gray-700 hover:text-red-600">Sleep Optimization</a></li>
                  <li><a href="/articles/weight-loss" className="text-gray-700 hover:text-red-600">Fat Loss</a></li>
                  <li><a href="/articles/fitness" className="text-gray-700 hover:text-red-600">Muscle Building</a></li>
                </ul>
              </div>

              {/* Another Sidebar Ad */}
              <AdSlot placement="sidebar" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Ad */}
      <AdSlot placement="footer" className="container mx-auto px-4 mt-8" />
    </div>
  );
}