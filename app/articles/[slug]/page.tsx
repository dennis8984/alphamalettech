import { articles, categories, getArticlesByCategory, initializeArticles } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import ArticleCard from '@/components/articles/ArticleCard';
import { AdSlot } from '@/components/ui/ad-slot';
import { OpenWebComments } from '@/components/ui/openweb-comments';
import { PageTracker } from '@/components/ui/page-tracker';
import ArticleContent from '@/components/ArticleContent';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Newsletter from '@/components/layout/Newsletter';

// Generate static params for all articles and categories
export async function generateStaticParams() {
  console.log('[generateStaticParams] Generating params...'); // Added for cache busting
  
  // Initialize articles to get the latest data
  await initializeArticles();
  
  // Generate paths for all articles
  const articlePaths = articles.map((article) => ({
    slug: article.slug,
  }));

  // Generate paths for all categories
  const categoryPaths = categories.map((category) => ({
    slug: category.slug,
  }));

  // Combine both arrays
  const allPaths = [...articlePaths, ...categoryPaths];
  console.log(`[generateStaticParams] Generated ${allPaths.length} paths.`); // Added for cache busting
  return allPaths;
}

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = params;
  
  // Check if this is a category page
  const category = categories.find(c => c.slug === slug);
  if (category) {
    return {
      title: `${category.name} Articles - Men's Hub`,
      description: `Browse the latest ${category.name.toLowerCase()} articles, tips, and advice from Men's Hub.`
    };
  }

  // Check if this is an article page
  const article = articles.find(a => a.slug === slug);
  if (article) {
    return {
      title: `${article.title} - Men's Hub`,
      description: article.excerpt
    };
  }

  return {
    title: 'Not Found',
    description: 'The requested page could not be found.'
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = params;
  
  // Initialize articles to get the latest data
  await initializeArticles();

  // Check if this is a category page
  const category = categories.find(c => c.slug === slug);
  if (category) {
    const categoryArticles = getArticlesByCategory(slug);

    return (
      <div className="container mx-auto px-4 py-8">
        <PageTracker />
        <div className="max-w-5xl mx-auto">
          {/* Header Ad */}
          <AdSlot placement="header" className="mb-6" />

          {/* Category Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Explore the latest {category.name.toLowerCase()} articles, tips, and expert advice from Men&apos;s Hub.
            </p>
          </div>

          {/* Mobile Leaderboard Ad */}
          <AdSlot placement="mobile-leaderboard" className="mb-8" />

          {/* Articles Grid */}
          {categoryArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No articles found in this category.</p>
            </div>
          )}

          {/* Newsletter */}
          <div className="mt-16">
            <Newsletter />
          </div>

          {/* Footer Ad */}
          <AdSlot placement="footer" className="mt-8" />
        </div>
      </div>
    );
  }

  // Check if this is an article page
  const article = articles.find(a => a.slug === slug);
  if (!article) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-6">
            The page you are looking for could not be found.
          </p>
          <Link 
            href="/"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Get related articles from the same category
  const relatedArticles = articles
    .filter(a => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  // Use the actual article content
  const fullArticleContent = article.content || `<p class="lead">${article.excerpt}</p>`;

  return (
    <div className="pt-8">
      <PageTracker />
      {/* Header Ad */}
      <AdSlot placement="header" className="mb-6" />

      {/* Article Header */}
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href={`/articles/${article.category}`}
          className="inline-block uppercase text-xs font-bold text-red-600 mb-3 hover:text-red-700 transition-colors"
        >
          {article.category}
        </Link>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
          {article.title}
        </h1>
        
        <div className="flex items-center text-sm text-gray-700 mb-6">
          <span className="font-medium">{article.author}</span>
          <span className="mx-2">·</span>
          <span>{formatDate(article.date)}</span>
        </div>

        {/* Mobile Leaderboard Ad */}
        <AdSlot placement="mobile-leaderboard" className="mb-6" />
      </div>

      {/* Featured Image */}
      <div className="relative aspect-[16/9] max-w-5xl mx-auto mb-8">
        <Image
          src={article.image}
          alt={article.title}
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Article Content with Sidebar Layout */}
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <article className="mb-12">
                {/* Article Content with Keyword Linking */}
                <ArticleContent
                  articleId={article.id?.toString() || article.slug}
                  content={fullArticleContent}
                  enableKeywordLinking={true}
                  showLinkingStats={false}
                />
                
                {/* Mid-Article Ad */}
                <div className="my-8">
                  <AdSlot placement="mid-article" />
                </div>
              </article>

              {/* Bottom Banner Ad */}
              <AdSlot placement="bottom-banner" className="mb-8" />
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-12">
                <span className="text-sm font-medium text-gray-700">Tags:</span>
                {['health', 'fitness', 'workout', 'strength', article.category].map((tag) => (
                  <Link
                    key={tag}
                    href={`/articles/${tag}`}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Comments Section */}
              <OpenWebComments 
                articleId={article.id?.toString() || article.slug}
                articleTitle={article.title}
                articleUrl={`https://www.menshb.com/articles/${article.slug}`}
              />

              {/* Newsletter */}
              <div className="mt-12">
                <Newsletter />
              </div>

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedArticles.map((relatedArticle) => (
                      <ArticleCard
                        key={relatedArticle.id}
                        article={relatedArticle}
                        variant="small"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Desktop Only */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Sidebar Ad */}
                <AdSlot placement="sidebar" />
                
                {/* Newsletter Signup */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold mb-3">Get the Latest</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Join our newsletter for exclusive tips and advice.
                  </p>
                  <Newsletter />
                </div>

                {/* More Sidebar Ads */}
                <AdSlot placement="sidebar" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Ad */}
      <div className="container mx-auto px-4 mt-12">
        <AdSlot placement="footer" />
      </div>
    </div>
  );
}