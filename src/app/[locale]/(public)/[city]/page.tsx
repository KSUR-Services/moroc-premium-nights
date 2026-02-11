import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import {
  getCityBySlug,
  getCities,
  getCategoriesForCity,
  getCollectionsForCity,
  getVenuesByCity,
} from '@/lib/supabase/queries';
import VenueCard from '@/components/venue/VenueCard';
import CategoryPills from '@/components/ui/CategoryPills';
import CollectionCard from '@/components/ui/CollectionCard';
import type { City, Venue, Category, Collection } from '@/types/database';

interface CityPageProps {
  params: Promise<{ locale: string; city: string }>;
}

export function generateStaticParams() {
  const CITY_SLUGS = ['casablanca', 'marrakech', 'rabat', 'tangier', 'agadir'];
  const locales = ['en', 'fr'];

  return locales.flatMap((locale) =>
    CITY_SLUGS.map((city) => ({
      locale,
      city,
    }))
  );
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { locale, city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  const t = await getTranslations('city');

  if (!city) {
    return { title: 'City Not Found' };
  }

  return {
    title: `${city.name} ${t('meta.titleSuffix')} | Moroc Premium Nights`,
    description: `${t('meta.description', { city: city.name })}`,
    openGraph: {
      title: `${city.name} ${t('meta.titleSuffix')}`,
      description: city.description ?? undefined,
      images: city.hero_image_url
        ? [
            {
              url: city.hero_image_url,
              width: 1200,
              height: 630,
              alt: city.name,
            },
          ]
        : [],
    },
    alternates: {
      canonical: `/${locale}/${city.slug}`,
      languages: {
        en: `/en/${city.slug}`,
        fr: `/fr/${city.slug}`,
        ar: `/ar/${city.slug}`,
      },
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { locale, city: citySlug } = await params;
  const t = await getTranslations('city');

  const [city, categories, collections, topPicksResult] = await Promise.all([
    getCityBySlug(citySlug),
    getCategoriesForCity(citySlug),
    getCollectionsForCity(citySlug, { limit: 6 }),
    getVenuesByCity(citySlug, { limit: 12 }),
  ]);

  const topPicks = topPicksResult.venues;
  const venueCount = topPicksResult.count;

  if (!city) {
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

  return (
    <main className="min-h-screen bg-gray-950">
      {/* City Hero */}
      <section className="relative h-[50vh] sm:h-[55vh] lg:h-[60vh] min-h-[360px]">
        <Image
          src={city.hero_image_url || '/images/placeholder-city.jpg'}
          alt={city.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-gray-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/60 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 sm:px-6 md:px-8 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href={`/${locale}`} className="hover:text-amber-400 transition-colors">
              {t('breadcrumb.home')}
            </Link>
            <span>/</span>
            <span className="text-white">{city.name}</span>
          </nav>

          <div className="flex items-center gap-2 text-amber-400 mb-3">
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">
              {t('hero.morocco')}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            {city.name}
          </h1>

          <p className="mt-3 text-lg text-gray-300 max-w-2xl line-clamp-3">
            {city.description}
          </p>

          <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400" />
              {venueCount} {t('hero.venues')}
            </span>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur-lg border-b border-gray-800/50">
        <div className="px-4 py-3 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <CategoryPills
            categories={categories}
            basePath={citySlug}
            locale={locale}
          />
        </div>
      </section>

      {/* Collections */}
      {collections.length > 0 && (
        <section className="py-12 overflow-hidden">
          <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {t('collections.title')}
              </h2>
              <Link
                href={`/${locale}/${citySlug}?view=collections`}
                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
              >
                {t('collections.viewAll')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto px-4 sm:px-6 md:px-8 pb-4 snap-x snap-mandatory scrollbar-hide">
            {collections.map((collection: Collection) => (
              <div key={collection.id} className="flex-none w-72 sm:w-80 snap-start">
                <CollectionCard collection={collection} locale={locale} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top Picks */}
      <section className="px-4 py-12 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {t('topPicks.title')}
            </h2>
            <p className="mt-1 text-gray-400 text-sm">
              {t('topPicks.subtitle', { city: city.name })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {topPicks.map((venue: Venue) => (
            <VenueCard key={venue.id} venue={venue} locale={locale} />
          ))}
        </div>
      </section>

      {/* All Venues Section */}
      <section className="px-4 py-12 sm:px-6 md:px-8 max-w-7xl mx-auto border-t border-gray-800/50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {t('allVenues.title', { city: city.name })}
          </h2>
          <div className="flex items-center gap-2">
            <select
              className="bg-gray-800/60 border border-gray-700/50 text-gray-300 text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
              defaultValue="priority"
            >
              <option value="priority">{t('allVenues.sort.priority')}</option>
              <option value="newest">{t('allVenues.sort.newest')}</option>
              <option value="price_asc">{t('allVenues.sort.priceAsc')}</option>
              <option value="price_desc">{t('allVenues.sort.priceDesc')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {topPicks.map((venue: Venue) => (
            <VenueCard key={venue.id} venue={venue} locale={locale} />
          ))}
        </div>

        {/* Load More */}
        <div className="mt-10 text-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-8 py-3 border border-gray-700 hover:border-amber-500/50 text-white font-medium rounded-xl transition-all duration-300 hover:bg-gray-800/50"
          >
            {t('allVenues.loadMore')}
          </button>
        </div>
      </section>
    </main>
  );
}
