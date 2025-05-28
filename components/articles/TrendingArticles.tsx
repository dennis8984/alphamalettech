'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Article } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TrendingArticlesProps {
  articles: Article[];
}

const TrendingArticles = ({ articles }: TrendingArticlesProps) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const maxIndex = articles.length - 1;
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle component mounting
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Auto-scroll functionality - only run after mounting
  useEffect(() => {
    if (!hasMounted) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [maxIndex, hasMounted]);

  const scrollToIndex = (index: number) => {
    if (containerRef.current) {
      const container = containerRef.current;
      const items = container.querySelectorAll('[data-item]');
      
      if (items[index]) {
        const targetItem = items[index] as HTMLElement;
        container.scrollLeft = targetItem.offsetLeft;
        setCurrentIndex(index);
      }
    }
  };

  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
    scrollToIndex(newIndex);
  };

  // Show a simple loading state before client-side hydration
  if (!hasMounted) {
    return (
      <div className="py-4">
        <h2 className="text-xl font-bold mb-3">Trending Now</h2>
        <div className="animate-pulse">
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 relative">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">Trending Now</h2>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrev}
            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
            aria-label="Previous article"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={handleNext}
            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
            aria-label="Next article"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 scroll-smooth"
      >
        {articles.map((article, index) => (
          <div 
            key={article.id} 
            data-item
            className="min-w-[85%] sm:min-w-[45%] md:min-w-[30%] flex-shrink-0 snap-start pr-4"
          >
            <Link 
              href={`/articles/${article.slug}`}
              className="block group"
            >
              <div className="border-l-4 border-red-600 pl-3 pr-2 py-2 hover:bg-gray-50 transition-colors">
                <span className="text-sm font-semibold mb-1 text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                  {article.title}
                </span>
                <span className="block text-xs text-gray-500 mt-1 uppercase">
                  {article.category}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      {/* Dots indicators */}
      <div className="flex justify-center space-x-2 mt-4">
        {articles.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              currentIndex === index ? 'bg-red-600' : 'bg-gray-300'
            }`}
            onClick={() => scrollToIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TrendingArticles;