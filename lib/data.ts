import { Article, Category } from '@/types';
import { getAllArticles } from './articles-db';

export const categories: Category[] = [
  { id: 'fitness', name: 'Fitness', slug: 'fitness' },
  { id: 'nutrition', name: 'Nutrition', slug: 'nutrition' },
  { id: 'health', name: 'Health', slug: 'health' },
  { id: 'style', name: 'Style', slug: 'style' },
  { id: 'weight-loss', name: 'Weight Loss', slug: 'weight-loss' },
  { id: 'entertainment', name: 'Entertainment', slug: 'entertainment' },
];

// Cache for articles to avoid multiple fetches
let articlesCache: Article[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5000; // Reduced to 5 seconds for immediate debugging

// Function to clear cache (useful after imports)
export const clearArticlesCache = () => {
  articlesCache = null;
  lastFetchTime = 0;
  console.log('🗑️ Articles cache cleared');
};

// Helper function to get all articles with caching
const getArticles = async (): Promise<Article[]> => {
  const now = Date.now();
  
  // For new article detection, be more aggressive about cache refresh
  const shouldRefresh = !articlesCache || (now - lastFetchTime) > CACHE_DURATION;
  
  if (!shouldRefresh && articlesCache) {
    console.log('📦 Using cached articles:', articlesCache.length);
    return articlesCache;
  }
  
  console.log('🔄 Fetching fresh articles from database...');
  
  // Fetch fresh data
  const { data, error } = await getAllArticles();
  
  if (error || !data) {
    console.error('❌ Failed to fetch articles:', error);
    // Return cached data if available, otherwise empty array
    return articlesCache || [];
  }
  
  console.log('📄 Raw articles from database:', data.length);
  console.log('📊 Articles by status:', data.reduce((acc, article) => {
    acc[article.status] = (acc[article.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));
  
  // Log article slugs for debugging
  const publishedSlugs = data
    .filter(article => article.status === 'published')
    .map(article => article.slug);
  console.log('📝 Published article slugs:', publishedSlugs.slice(0, 10), publishedSlugs.length > 10 ? `... and ${publishedSlugs.length - 10} more` : '');
  
  // Transform the data to match the expected format
  const transformedArticles = data
    .filter(article => article.status === 'published')
    .map(article => ({
      id: article.id || '',
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content || '',
      image: article.featured_image || 'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: article.category,
      author: article.author,
      date: article.published_at || article.created_at || new Date().toISOString(),
      featured: false, // You can add logic to determine featured articles
      trending: false  // You can add logic to determine trending articles
    }));
  
  console.log('✅ Published articles after filtering:', transformedArticles.length);
  console.log('📋 Articles by category:', transformedArticles.reduce((acc, article) => {
    acc[article.category] = (acc[article.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));
  
  // Update cache
  articlesCache = transformedArticles;
  lastFetchTime = now;
  
  return transformedArticles;
};

// For server-side rendering, we need synchronous versions that use the cached data
// These will be called after the initial async load
export const articles: Article[] = [];

// Function to initialize articles (call this in page components)
export const initializeArticles = async () => {
  const fetchedArticles = await getArticles();
  articles.length = 0;
  articles.push(...fetchedArticles);
  console.log(`🚀 Articles initialized: ${articles.length} articles loaded`);
  return fetchedArticles;
};

// Helper function to find an article by slug (with fresh database lookup if needed)
export const findArticleBySlug = async (slug: string): Promise<Article | null> => {
  // First check the cached articles
  await initializeArticles();
  let article = articles.find(a => a.slug === slug);
  
  if (article) {
    console.log(`✅ Found article "${slug}" in cache`);
    return article;
  }
  
  // If not in cache, try a fresh database lookup
  console.log(`🔍 Article "${slug}" not in cache, checking database directly...`);
  
  try {
    const { data, error } = await getAllArticles();
    
    if (error || !data) {
      console.error('❌ Database error:', error);
      return null;
    }
    
    const dbArticle = data.find(a => a.slug === slug && a.status === 'published');
    
    if (dbArticle) {
      console.log(`✅ Found article "${slug}" in database`);
      
      // Transform to expected format
      article = {
        id: dbArticle.id || '',
        title: dbArticle.title,
        slug: dbArticle.slug,
        excerpt: dbArticle.excerpt,
        content: dbArticle.content || '',
        image: dbArticle.featured_image || 'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        category: dbArticle.category,
        author: dbArticle.author,
        date: dbArticle.published_at || dbArticle.created_at || new Date().toISOString(),
        featured: false,
        trending: false
      };
      
      // Add to cache for subsequent requests
      articles.push(article);
      return article;
    }
    
    console.log(`❌ Article "${slug}" not found in database`);
    return null;
    
  } catch (error) {
    console.error(`❌ Error looking up article "${slug}":`, error);
    return null;
  }
};

export const getFeaturedArticles = (): Article[] => {
  // For now, return the first 3 articles as featured
  return articles.slice(0, 3);
};

export const getTrendingArticles = (): Article[] => {
  // For now, return articles 3-8 as trending
  return articles.slice(3, 8);
};

export const getArticlesByCategory = (category: string): Article[] => {
  return articles.filter((article) => article.category === category);
};

export const getRecentArticles = (limit = 6): Article[] => {
  return [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};