'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Wine,
  Music,
  UtensilsCrossed,
  Umbrella,
  GlassWater,
  Telescope,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Category {
  slug: string;
  name: string;
  count?: number;
}

interface CategoryPillsProps {
  categories: Category[];
  activeSlug?: string;
  basePath: string;
  locale: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  nightclub: Music,
  lounge: GlassWater,
  restaurant: UtensilsCrossed,
  'beach-club': Umbrella,
  bar: Wine,
  rooftop: Telescope,
};

export default function CategoryPills({
  categories,
  activeSlug,
  basePath,
  locale,
}: CategoryPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      el?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -200 : 200;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Left fade + arrow */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-950 to-transparent pointer-events-none" />
          <button
            onClick={() => scroll('left')}
            className="relative ml-1 w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700 hover:border-amber-500/50 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide py-1 px-1"
      >
        {/* "All" pill */}
        <Link
          href={`/${locale}/${basePath}`}
          className={`flex-none inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            !activeSlug
              ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/20'
              : 'bg-gray-800/60 text-gray-300 border border-gray-700/50 hover:border-amber-500/30 hover:text-white'
          }`}
        >
          All
        </Link>

        {categories.map((category) => {
          const Icon = categoryIcons[category.slug] || Wine;
          const isActive = activeSlug === category.slug;

          return (
            <Link
              key={category.slug}
              href={`/${locale}/${basePath}/${category.slug}`}
              className={`flex-none inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/20'
                  : 'bg-gray-800/60 text-gray-300 border border-gray-700/50 hover:border-amber-500/30 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-gray-950' : 'text-amber-400'}`} />
              <span>{category.name}</span>
              {category.count !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-gray-950/20 text-gray-950' : 'bg-gray-700/50 text-gray-500'
                  }`}
                >
                  {category.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Right fade + arrow */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none" />
          <button
            onClick={() => scroll('right')}
            className="relative mr-1 w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700 hover:border-amber-500/50 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      )}
    </div>
  );
}
