import HeroArticle from '@/components/articles/HeroArticle';
import TrendingArticles from '@/components/articles/TrendingArticles';
import CategorySection from '@/components/articles/CategorySection';
import Newsletter from '@/components/layout/Newsletter';
import { 
  getFeaturedArticles,
  getTrendingArticles,
  getArticlesByCategory
} from '@/lib/data';

export default function Home() {
  const featuredArticles = getFeaturedArticles();
  const trendingArticles = getTrendingArticles();
  
  const fitnessArticles = getArticlesByCategory('fitness');
  const nutritionArticles = getArticlesByCategory('nutrition');
  const healthArticles = getArticlesByCategory('health');
  const weightLossArticles = getArticlesByCategory('weight-loss');

  return (
    <div>
      {/* Hero Section */}
      {featuredArticles[0] && (
        <HeroArticle article={featuredArticles[0]} />
      )}

      <div className="container mx-auto px-4">
        {/* Trending Articles */}
        {trendingArticles.length > 0 && (
          <TrendingArticles articles={trendingArticles} />
        )}

        {/* Main Content */}
        <div className="py-8">
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

          {/* Newsletter */}
          <Newsletter />

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
        </div>
      </div>
    </div>
  );
}