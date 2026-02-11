import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import {
  getCities,
  getCityBySlug,
  getCategoriesForCity,
  getVenuesByCategory,
  getCategoryBySlug,
} from '@/lib/supabase/queries';
import VenueCard from '@/components/venue/VenueCard';
import VenueFilters from '@/components/venue/VenueFilters';
import CategoryPills from '@/components/ui/CategoryPills';
import type { City, Venue, Category } from '@/types/database';

interface CategoryPageProps {
  params: Promise<{ locale: string; city: string; category: string }>;
  searchParams: Promise<{
    sort?: string;
    price?: string;
    tags?: string;
    neighborhood?: string;
    page?: string;
  }>;
}

const CATEGORIES = ['nightclub', 'lounge', 'restaurant', 'beach-club', 'bar', 'rooftop'];

export function generateStaticParams() {
  const CITY_SLUGS = ['casablanca', 'marrakech', 'rabat', 'tangier', 'agadir'];
  const locales = ['en', 'fr'];

  return locales.flatMap((locale) =>
    CITY_SLUGS.flatMap((city) =>
      CATEGORIES.map((category) => ({
        locale,
        city,
        category,
      }))
    )
  );
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, city: citySlug, category: categorySlug } = await params;

  const [city, category] = await Promise.all([
    getCityBySlug(citySlug),
    getCategoryBySlug(categorySlug),
  ]);
  const t = await getTranslations('category');

  if (!city || !category) {
    return { title: 'Not Found' };
  }

  const title = t('meta.title', { category: category.name, city: city.name });
  const description = t('meta.description', { category: category.name, city: city.name });

  return {
    title: `${title} | Moroc Premium Nights`,
    description,
    openGraph: {
      title,
      description,
      images: city.hero_image_url
        ? [
            {
              url: city.hero_image_url,
              width: 1200,
              height: 630,
              alt: `${category.name} in ${city.name}`,
            },
          ]
        : [],
    },
    alternates: {
      canonical: `/${locale}/${citySlug}/${categorySlug}`,
      languages: {
        en: `/en/${citySlug}/${categorySlug}`,
        fr: `/fr/${citySlug}/${categorySlug}`,
        ar: `/ar/${citySlug}/${categorySlug}`,
      },
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { locale, city: citySlug, category: categorySlug } = await params;
  const resolvedSearchParams = await searchParams;

  const t = await getTranslations('category');

  const sort = resolvedSearchParams.sort || 'priority';
  const priceFilter = resolvedSearchParams.price?.split(',').map(Number) || [];
  const tagFilter = resolvedSearchParams.tags?.split(',') || [];
  const neighborhoodFilter = resolvedSearchParams.neighborhood || '';
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const perPage = 12;

  const [city, category, allCategories, venuesResult] = await Promise.all([
    getCityBySlug(citySlug),
    getCategoryBySlug(categorySlug),
    getCategoriesForCity(citySlug),
    getVenuesByCategory(citySlug, categorySlug, {
      page,
      limit: perPage,
      tags: tagFilter.length > 0 ? tagFilter : undefined,
    }),
  ]);

  if (!city || !category) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">{t('notFound.title')}</h1>
          <p className="mt-2 text-gray-400">{t('notFound.message')}</p>
          <Link
            href={`/${locale}`}
            className="mt-6 inline-flex items-center gap-2 text-amber-400 hover:text-amber-300"
          >
            {t('notFound.back')}
          </Link>
        </div>
      </main>
    );
  }

  const { venues, count: total } = venuesResult;
  const neighborhoods: string[] = [...new Set(venues.map((v) => v.neighborhood).filter(Boolean))] as string[];
  const availableTags: string[] = [];
  const totalPages = Math.ceil(total / perPage);

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Category Header */}
      <section className="px-4 pt-24 pb-6 sm:px-6 md:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href={`/${locale}`} className="hover:text-amber-400 transition-colors">
            {t('breadcrumb.home')}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/${citySlug}`} className="hover:text-amber-400 transition-colors">
            {city.name}
          </Link>
          <span>/</span>
          <span className="text-white">{category.name}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {category.name}
            </h1>
            <p className="mt-2 text-gray-400">
              {t('header.count', { count: total, city: city.name })}
            </p>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-3">
            <label htmlFor="sort-select" className="text-sm text-gray-400">
              {t('sort.label')}
            </label>
            <select
              id="sort-select"
              defaultValue={sort}
              className="bg-gray-800/60 border border-gray-700/50 text-gray-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="priority">{t('sort.priority')}</option>
              <option value="newest">{t('sort.newest')}</option>
              <option value="price_asc">{t('sort.priceAsc')}</option>
              <option value="price_desc">{t('sort.priceDesc')}</option>
            </select>
          </div>
        </div>
      </section>

      {/* Category Pills (sticky) */}
      <section className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur-lg border-b border-gray-800/50">
        <div className="px-4 py-3 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <CategoryPills
            categories={allCategories}
            activeSlug={categorySlug}
            basePath={citySlug}
            locale={locale}
          />
        </div>
      </section>

      {/* Main content with filters */}
      <section className="px-4 py-8 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20">
              <VenueFilters
                neighborhoods={neighborhoods}
                availableTags={availableTags}
                activePrice={priceFilter}
                activeTags={tagFilter}
                activeNeighborhood={neighborhoodFilter}
                basePath={`/${locale}/${citySlug}/${categorySlug}`}
              />
            </div>
          </aside>

          {/* Venue Grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter trigger */}
            <div className="lg:hidden mb-6">
              <VenueFilters
                neighborhoods={neighborhoods}
                availableTags={availableTags}
                activePrice={priceFilter}
                activeTags={tagFilter}
                activeNeighborhood={neighborhoodFilter}
                basePath={`/${locale}/${citySlug}/${categorySlug}`}
                isMobile
              />
            </div>

            {/* Active Filters Display */}
            {(priceFilter.length > 0 || tagFilter.length > 0 || neighborhoodFilter) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-gray-400">{t('filters.active')}:</span>
                {priceFilter.map((p) => (
                  <span
                    key={`price-${p}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium"
                  >
                    {'$'.repeat(p)}
                    <button type="button" className="ml-1 hover:text-white" aria-label="Remove filter">
                      &times;
                    </button>
                  </span>
                ))}
                {tagFilter.map((tag) => (
                  <span
                    key={`tag-${tag}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-700/50 text-gray-300 text-xs font-medium"
                  >
                    {tag}
                    <button type="button" className="ml-1 hover:text-white" aria-label="Remove filter">
                      &times;
                    </button>
                  </span>
                ))}
                {neighborhoodFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-700/50 text-gray-300 text-xs font-medium">
                    {neighborhoodFilter}
                    <button type="button" className="ml-1 hover:text-white" aria-label="Remove filter">
                      &times;
                    </button>
                  </span>
                )}
                <Link
                  href={`/${locale}/${citySlug}/${categorySlug}`}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium ml-2"
                >
                  {t('filters.clearAll')}
                </Link>
              </div>
            )}

            {/* Results */}
            {venues.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {venues.map((venue: Venue) => (
                    <VenueCard key={venue.id} venue={venue} locale={locale} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                    {page > 1 && (
                      <Link
                        href={`/${locale}/${citySlug}/${categorySlug}?page=${page - 1}&sort=${sort}`}
                        className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 hover:border-amber-500/50 hover:text-white transition-colors text-sm"
                      >
                        {t('pagination.prev')}
                      </Link>
                    )}

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <Link
                          key={pageNum}
                          href={`/${locale}/${citySlug}/${categorySlug}?page=${pageNum}&sort=${sort}`}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${
                            pageNum === page
                              ? 'bg-amber-500 text-gray-950'
                              : 'border border-gray-700 text-gray-300 hover:border-amber-500/50 hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}

                    {page < totalPages && (
                      <Link
                        href={`/${locale}/${citySlug}/${categorySlug}?page=${page + 1}&sort=${sort}`}
                        className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 hover:border-amber-500/50 hover:text-white transition-colors text-sm"
                      >
                        {t('pagination.next')}
                      </Link>
                    )}
                  </nav>
                )}

                {/* Infinite scroll sentinel */}
                <div
                  id="infinite-scroll-trigger"
                  data-page={page}
                  data-total-pages={totalPages}
                  className="h-px"
                  aria-hidden="true"
                />
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
                  <SlidersHorizontal className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {t('empty.title')}
                </h3>
                <p className="mt-2 text-gray-400 max-w-md mx-auto">
                  {t('empty.message')}
                </p>
                <Link
                  href={`/${locale}/${citySlug}/${categorySlug}`}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold rounded-xl transition-colors"
                >
                  {t('empty.clearFilters')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
