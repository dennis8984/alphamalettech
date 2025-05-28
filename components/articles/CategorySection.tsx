import Link from 'next/link';
import { Article } from '@/types';
import ArticleCard from './ArticleCard';

interface CategorySectionProps {
  title: string;
  articles: Article[];
  categorySlug: string;
}

const CategorySection = ({ title, articles, categorySlug }: CategorySectionProps) => {
  if (!articles.length) return null;

  // Display the first article larger, and the rest in a grid
  const mainArticle = articles[0];
  const remainingArticles = articles.slice(1, 5);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link 
          href={`/articles/${categorySlug}`}
          className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main featured article */}
        <div className="lg:col-span-1">
          <ArticleCard article={mainArticle} variant="large" />
        </div>

        {/* Grid of smaller articles */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {remainingArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="medium" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;