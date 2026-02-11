'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  SlidersHorizontal,
  MapPin,
  Tag,
  Layers,
  TrendingUp,
  Sparkles,
  Loader2,
} from 'lucide-react';
import VenueCard from '@/components/venue/VenueCard';
import VenueFilters from '@/components/venue/VenueFilters';
import type { Venue } from '@/types/database';

interface Suggestion {
  type: 'city' | 'category' | 'tag' | 'venue';
  label: string;
  slug: string;
  icon: 'map' | 'layers' | 'tag' | 'sparkles';
}

const POPULAR_SUGGESTIONS: Suggestion[] = [
  { type: 'city', label: 'Marrakech', slug: 'marrakech', icon: 'map' },
  { type: 'city', label: 'Casablanca', slug: 'casablanca', icon: 'map' },
  { type: 'category', label: 'Nightclubs', slug: 'nightclub', icon: 'layers' },
  { type: 'category', label: 'Rooftop Bars', slug: 'rooftop', icon: 'layers' },
  { type: 'tag', label: 'Live DJ', slug: 'live-dj', icon: 'tag' },
  { type: 'tag', label: 'Fine Dining', slug: 'fine-dining', icon: 'tag' },
  { type: 'tag', label: 'Ocean View', slug: 'ocean-view', icon: 'tag' },
  { type: 'tag', label: 'VIP', slug: 'vip', icon: 'tag' },
];

const suggestionIcons = {
  map: MapPin,
  layers: Layers,
  tag: Tag,
  sparkles: Sparkles,
};

export default function SearchPage() {
  const t = useTranslations('search');
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params.locale as string;

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState<Venue[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [total, setTotal] = useState(0);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounced query update
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}&locale=${locale}`
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, locale]);

  // Fetch search results
  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set('q', searchQuery);

      const response = await fetch(
        `/api/search?${currentParams.toString()}&locale=${locale}`
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data.venues || []);
        setTotal(data.total || 0);
        setNeighborhoods(data.neighborhoods || []);
        setAvailableTags(data.availableTags || []);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  // Trigger search on debounced query change
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchResults(debouncedQuery);
    }
  }, [debouncedQuery, fetchResults]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setShowSuggestions(false);

    switch (suggestion.type) {
      case 'city':
        router.push(`/${locale}/${suggestion.slug}`);
        break;
      case 'category':
        setQuery(suggestion.label);
        setDebouncedQuery(suggestion.label);
        break;
      case 'tag':
        setQuery(suggestion.label);
        setDebouncedQuery(suggestion.label);
        break;
      case 'venue':
        setQuery(suggestion.label);
        setDebouncedQuery(suggestion.label);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    fetchResults(query);
    router.replace(`/${locale}/search?q=${encodeURIComponent(query)}`, { scroll: false });
  };

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setHasSearched(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Search Header */}
      <section className="px-4 pt-24 pb-6 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          {t('title')}
        </h1>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder={t('placeholder')}
              className="w-full pl-12 pr-12 py-4 bg-gray-800/60 border border-gray-700/50 focus:border-amber-500/50 rounded-2xl text-white placeholder-gray-500 text-lg outline-none transition-colors"
              autoComplete="off"
              aria-label={t('placeholder')}
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                aria-label={t('clear')}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && (query.length >= 2 ? suggestions.length > 0 : true) && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
            >
              {suggestions.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('suggestions.results')}
                  </div>
                  {suggestions.map((suggestion, index) => {
                    const Icon = suggestionIcons[suggestion.icon];
                    return (
                      <button
                        key={`${suggestion.type}-${suggestion.slug}-${index}`}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{suggestion.label}</p>
                          <p className="text-xs text-gray-500 capitalize">{suggestion.type}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : query.length < 2 ? (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('suggestions.popular')}
                  </div>
                  {POPULAR_SUGGESTIONS.map((suggestion, index) => {
                    const Icon = suggestionIcons[suggestion.icon];
                    return (
                      <button
                        key={`popular-${index}`}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{suggestion.label}</p>
                          <p className="text-xs text-gray-500 capitalize">{suggestion.type}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}
        </form>
      </section>

      {/* Results Area */}
      <section className="px-4 pb-16 sm:px-6 md:px-8 max-w-7xl mx-auto">
        {isLoading ? (
          /* Loading State */
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">{t('loading')}</p>
          </div>
        ) : hasSearched && results.length > 0 ? (
          /* Results */
          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-20">
                <VenueFilters
                  neighborhoods={neighborhoods}
                  availableTags={availableTags}
                  activePrice={[]}
                  activeTags={[]}
                  activeNeighborhood=""
                  basePath={`/${locale}/search?q=${encodeURIComponent(query)}`}
                />
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {/* Results header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-400">
                  {t('results.count', { count: total })}
                </p>
                {/* Mobile filter trigger */}
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/60 border border-gray-700/50 text-sm text-gray-300 hover:border-amber-500/30 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {t('filters.title')}
                </button>
              </div>

              {/* Mobile Filters Drawer */}
              {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                  <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowMobileFilters(false)}
                  />
                  <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-gray-900 rounded-t-3xl overflow-y-auto">
                    <div className="sticky top-0 bg-gray-900 px-6 pt-4 pb-3 border-b border-gray-800/50">
                      <div className="w-12 h-1 rounded-full bg-gray-700 mx-auto mb-4" />
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">{t('filters.title')}</h3>
                        <button
                          type="button"
                          onClick={() => setShowMobileFilters(false)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-800 text-gray-400"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <VenueFilters
                        neighborhoods={neighborhoods}
                        availableTags={availableTags}
                        activePrice={[]}
                        activeTags={[]}
                        activeNeighborhood=""
                        basePath={`/${locale}/search?q=${encodeURIComponent(query)}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {results.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} locale={locale} />
                ))}
              </div>
            </div>
          </div>
        ) : hasSearched && results.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-800/50 flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {t('empty.title')}
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              {t('empty.message', { query })}
            </p>

            {/* Popular suggestions */}
            <div>
              <p className="text-sm text-gray-500 mb-4">{t('empty.tryPopular')}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={`empty-${index}`}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/60 border border-gray-700/50 hover:border-amber-500/30 text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {suggestion.type === 'city' && <MapPin className="w-3.5 h-3.5 text-amber-400" />}
                    {suggestion.type === 'category' && <Layers className="w-3.5 h-3.5 text-amber-400" />}
                    {suggestion.type === 'tag' && <Tag className="w-3.5 h-3.5 text-amber-400" />}
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Initial State - no search yet */
          <div className="py-12">
            {/* Trending section */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">
                  {t('initial.trending')}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={`trend-${index}`}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700/50 hover:border-amber-500/30 text-sm text-gray-300 hover:text-white transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {suggestion.type === 'city' && <MapPin className="w-3.5 h-3.5 text-amber-400" />}
                    {suggestion.type === 'category' && <Layers className="w-3.5 h-3.5 text-amber-400" />}
                    {suggestion.type === 'tag' && <Tag className="w-3.5 h-3.5 text-amber-400" />}
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular cities grid */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">
                {t('initial.exploreCities')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['Marrakech', 'Casablanca', 'Tangier', 'Agadir'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => router.push(`/${locale}/${city.toLowerCase()}`)}
                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-800/50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-transparent" />
                    <div className="absolute inset-0 border border-transparent group-hover:border-amber-500/30 rounded-2xl transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                        {city}
                      </h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
