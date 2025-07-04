import HeroArticle from '@/components/articles/HeroArticle';
import TrendingArticles from '@/components/articles/TrendingArticles';
import CategorySection from '@/components/articles/CategorySection';
import Newsletter from '@/components/layout/Newsletter';
import SidebarNewsletter from '@/components/ui/sidebar-newsletter';
import { AdSlot } from '@/components/ui/ad-slot';
import { PageTracker } from '@/components/ui/page-tracker';
import { 
  getFeaturedArticles,
  getTrendingArticles,
  getArticlesByCategory,
  initializeArticles
} from '@/lib/data';

// Revalidate the page every 60 seconds to ensure fresh content
export const revalidate = 60;

export default async function Home() {
  // Initialize articles from the database
  await initializeArticles();
  
  const featuredArticles = getFeaturedArticles();
  const trendingArticles = getTrendingArticles();
  
  const fitnessArticles = getArticlesByCategory('fitness');
  const nutritionArticles = getArticlesByCategory('nutrition');
  const healthArticles = getArticlesByCategory('health');
  const weightLossArticles = getArticlesByCategory('weight-loss');

  // Check if we have any articles
  const hasArticles = featuredArticles.length > 0 || trendingArticles.length > 0 || 
                      fitnessArticles.length > 0 || nutritionArticles.length > 0 || 
                      healthArticles.length > 0 || weightLossArticles.length > 0;

  return (
    <div>
      <PageTracker />
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
            {!hasArticles ? (
              <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">No Articles Found</h2>
                <p className="text-gray-600 mb-8">No published articles are currently available. Please check back later or contact the administrator.</p>
                <a href="/admin" className="text-red-600 hover:text-red-700 font-medium">Go to Admin Panel →</a>
              </div>
            ) : (
              <>
                {/* Trending Articles */}
                {trendingArticles.length > 0 && <TrendingArticles articles={trendingArticles} />}

                {/* Mid-Content Ad */}
                <AdSlot placement="mid-article" className="my-8" />

                {/* Fitness Section */}
                {fitnessArticles.length > 0 && (
                  <CategorySection 
                    title="Fitness" 
                    articles={fitnessArticles} 
                    categorySlug="fitness" 
                  />
                )}

                {/* Nutrition Section */}
                {nutritionArticles.length > 0 && (
                  <CategorySection 
                    title="Nutrition" 
                    articles={nutritionArticles} 
                    categorySlug="nutrition" 
                  />
                )}

                {/* Health Section */}
                {healthArticles.length > 0 && (
                  <CategorySection 
                    title="Health" 
                    articles={healthArticles} 
                    categorySlug="health" 
                  />
                )}

                {/* Weight Loss Section */}
                {weightLossArticles.length > 0 && (
                  <CategorySection 
                    title="Weight Loss" 
                    articles={weightLossArticles} 
                    categorySlug="weight-loss" 
                  />
                )}
              </>
            )}

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
                <SidebarNewsletter />
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