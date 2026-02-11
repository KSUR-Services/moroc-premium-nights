'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  Search,
  Menu,
  X,
  ChevronDown,
  MapPin,
  Globe,
} from 'lucide-react';
import { locales, type Locale } from '@/i18n/config';

const cities = [
  { slug: 'casablanca', name: { fr: 'Casablanca', en: 'Casablanca' } },
  { slug: 'marrakech', name: { fr: 'Marrakech', en: 'Marrakech' } },
  { slug: 'rabat', name: { fr: 'Rabat', en: 'Rabat' } },
  { slug: 'tangier', name: { fr: 'Tanger', en: 'Tangier' } },
  { slug: 'agadir', name: { fr: 'Agadir', en: 'Agadir' } },
];

export default function Header() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Detect current city from URL
  const currentCitySlug = cities.find((city) =>
    pathname.includes(`/${city.slug}`)
  )?.slug;

  const currentCity = cities.find((c) => c.slug === currentCitySlug);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close city dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split('/');
    // If the first segment after / is a locale, replace it
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/'));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchPath = currentCitySlug
        ? `/${locale}/${currentCitySlug}/search?q=${encodeURIComponent(searchQuery.trim())}`
        : `/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`;
      router.push(searchPath);
      setIsSearchExpanded(false);
      setSearchQuery('');
    }
  };

  const otherLocale = locale === 'fr' ? 'en' : 'fr';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-zinc-950/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-zinc-800/50'
            : 'bg-zinc-950/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2 shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <span className="text-zinc-950 font-bold text-sm">MN</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-white hidden sm:block">
                Moroc{' '}
                <span className="text-amber-500">Nights</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href={`/${locale}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === `/${locale}` || pathname === '/'
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                {t('navigation.home')}
              </Link>

              {/* City Selector */}
              <div ref={cityDropdownRef} className="relative">
                <button
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentCitySlug
                      ? 'text-amber-500 bg-amber-500/10'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>
                    {currentCity
                      ? currentCity.name[locale]
                      : t('navigation.cities')}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      isCityDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isCityDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl shadow-black/30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      {cities.map((city) => (
                        <Link
                          key={city.slug}
                          href={`/${locale}/${city.slug}`}
                          onClick={() => setIsCityDropdownOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                            currentCitySlug === city.slug
                              ? 'text-amber-500 bg-amber-500/10'
                              : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                          }`}
                        >
                          <MapPin className="w-4 h-4 text-amber-500/60" />
                          <span>{city.name[locale]}</span>
                          {currentCitySlug === city.slug && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href={`/${locale}/collections`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.includes('/collections')
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                {t('navigation.collections')}
              </Link>

              <Link
                href={`/${locale}/about`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.includes('/about')
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                {t('navigation.about')}
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Desktop Search */}
              <div className="hidden lg:block relative">
                {isSearchExpanded ? (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('search.placeholder')}
                      className="w-64 xl:w-80 h-10 pl-10 pr-4 bg-zinc-800/80 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchExpanded(false);
                        setSearchQuery('');
                      }}
                      className="ml-2 p-2 text-zinc-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchExpanded(true)}
                    className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                    aria-label={t('navigation.search')}
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Language Switcher */}
              <button
                onClick={() => switchLocale(otherLocale)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                aria-label={t('navigation.languageSwitcher.label')}
              >
                <Globe className="w-4 h-4" />
                <span className="uppercase text-xs font-semibold tracking-wide">
                  {otherLocale}
                </span>
              </button>

              {/* Mobile Search Button */}
              <button
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className="lg:hidden p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                aria-label={t('navigation.search')}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar (expandable) */}
          {isSearchExpanded && (
            <div className="lg:hidden pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <form onSubmit={handleSearch} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="w-full h-11 pl-11 pr-4 bg-zinc-800/80 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-16 right-0 bottom-0 w-full max-w-sm bg-zinc-950 border-l border-zinc-800 overflow-y-auto animate-in slide-in-from-right duration-300">
            <nav className="p-6 space-y-2">
              <Link
                href={`/${locale}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  pathname === `/${locale}` || pathname === '/'
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                {t('navigation.home')}
              </Link>

              {/* Cities in mobile menu */}
              <div className="pt-2">
                <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {t('navigation.cities')}
                </p>
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${locale}/${city.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base transition-colors ${
                      currentCitySlug === city.slug
                        ? 'text-amber-500 bg-amber-500/10'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-amber-500/60" />
                    <span>{city.name[locale]}</span>
                    {currentCitySlug === city.slug && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </Link>
                ))}
              </div>

              <div className="border-t border-zinc-800 my-4" />

              <Link
                href={`/${locale}/collections`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  pathname.includes('/collections')
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                {t('navigation.collections')}
              </Link>

              <Link
                href={`/${locale}/about`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  pathname.includes('/about')
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                {t('navigation.about')}
              </Link>

              <div className="border-t border-zinc-800 my-4" />

              {/* Language Switcher in mobile */}
              <button
                onClick={() => {
                  switchLocale(otherLocale);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
              >
                <Globe className="w-5 h-5 text-amber-500/60" />
                <span>
                  {t(`navigation.languageSwitcher.${otherLocale}`)}
                </span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
