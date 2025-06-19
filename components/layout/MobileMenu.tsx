'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Search, User } from 'lucide-react';
import { categories } from '@/lib/data';

// Landing page routes for specific categories (same as Header)
const categoryRoutes = {
  'fitness': '/articles/ultimate-workout-guide',
  'nutrition': '/articles/nutrition-hub',
  'health': '/articles/welcome-to-mens-hub',
  'style': '/articles/style',
  'weight-loss': '/articles/weight-loss',
  'entertainment': '/articles/entertainment'
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-xl font-bold">Menu</span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition-colors"
            aria-label="Close Menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="py-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={categoryRoutes[category.id as keyof typeof categoryRoutes] || `/articles/${category.slug}`}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                onClick={onClose}
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <div className="border-t py-4 space-y-3 px-4">
            <Link
              href="/search"
              className="flex items-center space-x-3"
              onClick={onClose}
            >
              <Search size={20} className="text-gray-600" />
              <span className="text-base font-medium">Search</span>
            </Link>
            <Link
              href="/auth/signin"
              className="flex items-center space-x-3"
              onClick={onClose}
            >
              <User size={20} className="text-gray-600" />
              <span className="text-base font-medium">Account</span>
            </Link>
            <Link
              href="/subscribe"
              className="block w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-sm transition-colors mt-4 text-center"
              onClick={onClose}
            >
              Subscribe
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;