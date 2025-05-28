import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { formatDate } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  variant?: 'small' | 'medium' | 'large';
}

const ArticleCard = ({ article, variant = 'medium' }: ArticleCardProps) => {
  if (variant === 'small') {
    return (
      <div className="group">
        <Link href={`/articles/${article.slug}`} className="block">
          <div className="relative aspect-video overflow-hidden rounded mb-2">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 className="font-semibold text-base line-clamp-2 group-hover:text-red-600 transition-colors">
            {article.title}
          </h3>
        </Link>
        <div className="mt-1 text-xs text-gray-500">
          {formatDate(article.date)}
        </div>
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div className="group">
        <Link href={`/articles/${article.slug}`} className="block">
          <div className="relative aspect-[16/9] overflow-hidden rounded-sm mb-3">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="uppercase text-xs font-bold text-red-600 mb-1">
            {article.category}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
            {article.title}
          </h2>
          <p className="text-gray-700 line-clamp-3 mb-3">
            {article.excerpt}
          </p>
        </Link>
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium">{article.author}</span>
          <span className="mx-2">·</span>
          <span>{formatDate(article.date)}</span>
        </div>
      </div>
    );
  }

  // Default: Medium
  return (
    <div className="group">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm mb-3">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="uppercase text-xs font-bold text-red-600 mb-1">
          {article.category}
        </div>
        <h3 className="text-lg font-bold line-clamp-2 group-hover:text-red-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-gray-700 text-sm line-clamp-2 mt-1">
          {article.excerpt}
        </p>
      </Link>
      <div className="mt-2 text-xs text-gray-500">
        <span>{article.author}</span>
        <span className="mx-1">·</span>
        <span>{formatDate(article.date)}</span>
      </div>
    </div>
  );
};

export default ArticleCard;