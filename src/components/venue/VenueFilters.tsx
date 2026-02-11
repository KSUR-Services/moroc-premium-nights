'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Check,
  DollarSign,
} from 'lucide-react';

interface VenueFiltersProps {
  neighborhoods: string[];
  availableTags: string[];
  activePrice: number[];
  activeTags: string[];
  activeNeighborhood: string;
  basePath: string;
  isMobile?: boolean;
}

const PRICE_RANGES = [
  { value: 1, label: '$' },
  { value: 2, label: '$$' },
  { value: 3, label: '$$$' },
  { value: 4, label: '$$$$' },
];

export default function VenueFilters({
  neighborhoods,
  availableTags,
  activePrice,
  activeTags,
  activeNeighborhood,
  basePath,
  isMobile = false,
}: VenueFiltersProps) {
  const t = useTranslations('filters');
  const router = useRouter();

  const [selectedPrice, setSelectedPrice] = useState<number[]>(activePrice);
  const [selectedTags, setSelectedTags] = useState<string[]>(activeTags);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(activeNeighborhood);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);

  const hasActiveFilters = selectedPrice.length > 0 || selectedTags.length > 0 || selectedNeighborhood !== '';

  const togglePrice = useCallback((value: number) => {
    setSelectedPrice((prev) =>
      prev.includes(value)
        ? prev.filter((p) => p !== value)
        : [...prev, value]
    );
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedPrice.length > 0) params.set('price', selectedPrice.join(','));
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (selectedNeighborhood) params.set('neighborhood', selectedNeighborhood);

    const separator = basePath.includes('?') ? '&' : '?';
    const url = params.toString()
      ? `${basePath}${separator}${params.toString()}`
      : basePath;

    router.push(url);

    if (isMobile) {
      setIsDrawerOpen(false);
    }
  }, [selectedPrice, selectedTags, selectedNeighborhood, basePath, router, isMobile]);

  const clearFilters = useCallback(() => {
    setSelectedPrice([]);
    setSelectedTags([]);
    setSelectedNeighborhood('');
    router.push(basePath);

    if (isMobile) {
      setIsDrawerOpen(false);
    }
  }, [basePath, router, isMobile]);

  const filterContent = (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-400" />
          {t('priceRange')}
        </h4>
        <div className="space-y-2">
          {PRICE_RANGES.map((price) => (
            <label
              key={price.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  selectedPrice.includes(price.value)
                    ? 'bg-amber-500 border-amber-500'
                    : 'border-gray-600 group-hover:border-gray-500'
                }`}
              >
                {selectedPrice.includes(price.value) && (
                  <Check className="w-3.5 h-3.5 text-gray-950" />
                )}
              </div>
              <button
                type="button"
                onClick={() => togglePrice(price.value)}
                className="flex items-center gap-2 text-sm text-gray-300 group-hover:text-white transition-colors"
              >
                <span className="font-medium">{price.label}</span>
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      {availableTags.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">
            {t('tags')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    : 'bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Neighborhood */}
      {neighborhoods.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">
            {t('neighborhood')}
          </h4>
          <div className="relative">
            <button
              type="button"
              onClick={() => setNeighborhoodOpen(!neighborhoodOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-xl text-sm text-gray-300 hover:border-gray-600 transition-colors"
            >
              <span className={selectedNeighborhood ? 'text-white' : 'text-gray-500'}>
                {selectedNeighborhood || t('allNeighborhoods')}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  neighborhoodOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {neighborhoodOpen && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-gray-800 border border-gray-700/50 rounded-xl shadow-xl shadow-black/20 overflow-hidden max-h-48 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNeighborhood('');
                    setNeighborhoodOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-700/50 transition-colors ${
                    !selectedNeighborhood ? 'text-amber-400 font-medium' : 'text-gray-300'
                  }`}
                >
                  {t('allNeighborhoods')}
                </button>
                {neighborhoods.map((nb) => (
                  <button
                    key={nb}
                    type="button"
                    onClick={() => {
                      setSelectedNeighborhood(nb);
                      setNeighborhoodOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-700/50 transition-colors ${
                      selectedNeighborhood === nb ? 'text-amber-400 font-medium' : 'text-gray-300'
                    }`}
                  >
                    {nb}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-700/50">
        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-700/50 text-sm font-medium text-gray-400 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('clear')}
        </button>
        <button
          type="button"
          onClick={applyFilters}
          className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-semibold transition-colors"
        >
          {t('apply')}
        </button>
      </div>
    </div>
  );

  // Mobile: Trigger button + Bottom sheet drawer
  if (isMobile) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700/50 text-sm text-gray-300 hover:border-amber-500/30 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t('title')}
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-gray-950 text-xs flex items-center justify-center font-bold">
              {selectedPrice.length + selectedTags.length + (selectedNeighborhood ? 1 : 0)}
            </span>
          )}
        </button>

        {/* Bottom sheet drawer */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Drawer */}
            <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-gray-900 rounded-t-3xl overflow-y-auto animate-slide-up">
              {/* Handle */}
              <div className="sticky top-0 bg-gray-900 px-6 pt-4 pb-3 border-b border-gray-800/50 z-10">
                <div className="w-12 h-1 rounded-full bg-gray-700 mx-auto mb-4" />
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{t('title')}</h3>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {filterContent}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop: Sidebar
  return (
    <div className="p-5 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30">
      <div className="flex items-center gap-2 mb-5">
        <SlidersHorizontal className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">{t('title')}</h3>
        {hasActiveFilters && (
          <span className="ml-auto w-5 h-5 rounded-full bg-amber-500 text-gray-950 text-xs flex items-center justify-center font-bold">
            {selectedPrice.length + selectedTags.length + (selectedNeighborhood ? 1 : 0)}
          </span>
        )}
      </div>
      {filterContent}
    </div>
  );
}
