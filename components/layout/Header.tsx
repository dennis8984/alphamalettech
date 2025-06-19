'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { categories } from '@/lib/data';
import MobileMenu from './MobileMenu';

// Landing page routes for specific categories
const categoryRoutes = {
  'fitness': '/articles/ultimate-workout-guide',
  'nutrition': '/articles/nutrition-hub',
  'health': '/articles/welcome-to-mens-hub',
  'style': '/articles/style',
  'weight-loss': '/articles/weight-loss',
  'entertainment': '/articles/entertainment'
};

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white shadow-md py-2'
          : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/"
            className="text-2xl font-bold text-black"
          >
            <span className="bg-red-600 text-white px-2 py-1 mr-1">MEN&apos;S</span>
            HUB
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={categoryRoutes[category.id as keyof typeof categoryRoutes] || `/articles/${category.slug}`}
                className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/search"
              className="text-gray-700 hover:text-red-600 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </Link>
            <Link
              href="/auth/signin"
              className="text-gray-700 hover:text-red-600 transition-colors"
              aria-label="Account"
            >
              <User size={20} />
            </Link>
            <Link 
              href="/subscribe"
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-sm transition-colors"
            >
              Subscribe
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-red-600 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};

export default Header;