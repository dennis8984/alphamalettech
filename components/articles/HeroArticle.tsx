import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { formatDate } from '@/lib/utils';

interface HeroArticleProps {
  article: Article;
}

const HeroArticle = ({ article }: HeroArticleProps) => {
  return (
    <div className="relative group">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-4 md:p-8 w-full">
            <div className="uppercase text-xs md:text-sm font-bold text-red-500 mb-2">
              {article.category}
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4 leading-tight">
              {article.title}
            </h1>
            <p className="text-white/90 text-sm md:text-base mb-2 md:mb-4 max-w-3xl line-clamp-2 md:line-clamp-3">
              {article.excerpt}
            </p>
            <div className="flex items-center text-xs md:text-sm text-white/70">
              <span className="font-medium">{article.author}</span>
              <span className="mx-2">·</span>
              <span>{formatDate(article.date)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default HeroArticle;