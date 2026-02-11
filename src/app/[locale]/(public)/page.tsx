import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight, Star, TrendingUp, Sparkles } from 'lucide-react';
import { getCities, getFeaturedVenues, getFeaturedCollections } from '@/lib/supabase/queries';
import VenueCard from '@/components/venue/VenueCard';
import CollectionCard from '@/components/ui/CollectionCard';
import type { City, Venue, Collection } from '@/types/database';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage(props: HomePageProps) {
  const { locale } = await props.params;
  const t = await getTranslations('home');

  const [cities, featuredVenues, collections] = await Promise.all([
    getCities(),
    getFeaturedVenues({ limit: 6 }),
    getFeaturedCollections({ limit: 8 }),
  ]);

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-400/5 via-transparent to-transparent animate-pulse delay-1000" />
          {/* Decorative gold particles */}
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-amber-400/40 rounded-full animate-ping" />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-amber-500/30 rounded-full animate-ping delay-500" />
          <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-amber-400/20 rounded-full animate-ping delay-1000" />
        </div>

        <div className="relative z-10 px-4 pt-24 pb-16 sm:px-6 md:px-8 lg:pt-32 lg:pb-24 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">
                {t('hero.badge')}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              {t('hero.title.prefix')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                {t('hero.title.highlight')}
              </span>{' '}
              {t('hero.title.suffix')}
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/${locale}/search`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25"
              >
                {t('hero.cta.explore')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href={`/${locale}/search`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-700 hover:border-amber-500/50 text-white font-medium rounded-xl transition-all duration-300 hover:bg-gray-800/50"
              >
                {t('hero.cta.search')}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-950 to-transparent" />
      </section>

      {/* City Selector */}
      <section className="px-4 py-16 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {t('cities.title')}
            </h2>
            <p className="mt-2 text-gray-400">
              {t('cities.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cities.map((city: City) => (
            <Link
              key={city.id}
              href={`/${locale}/${city.slug}`}
              className="group relative aspect-[3/4] sm:aspect-[4/5] rounded-2xl overflow-hidden"
            >
              {/* City image */}
              <Image
                src={city.hero_image_url || '/images/placeholder-city.jpg'}
                alt={city.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, 25vw"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

              {/* Gold border on hover */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-amber-500/50 transition-colors duration-300" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <div className="flex items-center gap-1.5 text-amber-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">
                    {t('cities.morocco')}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300">
                  {city.name}
                </h3>
                <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                  {t('cities.venues')}
                </p>
              </div>

              {/* Hover arrow */}
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-amber-500/0 group-hover:bg-amber-500 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                <ArrowRight className="w-5 h-5 text-gray-950" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Collections Carousel */}
      <section className="py-16 overflow-hidden">
        <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {t('collections.title')}
              </h2>
              <p className="mt-2 text-gray-400">
                {t('collections.subtitle')}
              </p>
            </div>
            <Link
              href={`/${locale}/search?view=collections`}
              className="hidden sm:inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              {t('collections.viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto px-4 sm:px-6 md:px-8 pb-4 snap-x snap-mandatory scrollbar-hide">
          {collections.map((collection: Collection) => (
            <div key={collection.id} className="flex-none w-72 sm:w-80 snap-start">
              <CollectionCard collection={collection} locale={locale} />
            </div>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            href={`/${locale}/search?view=collections`}
            className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            {t('collections.viewAll')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Trending Now */}
      <section className="px-4 py-16 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {t('trending.title')}
              </h2>
              <p className="mt-1 text-gray-400 text-sm">
                {t('trending.subtitle')}
              </p>
            </div>
          </div>
          <Link
            href={`/${locale}/search?sort=trending`}
            className="hidden sm:inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            {t('trending.viewAll')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featuredVenues.map((venue: Venue, index: number) => (
            <div key={venue.id} className="relative">
              {/* Trending rank badge */}
              <div className="absolute top-3 left-3 z-10 w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-950">
                  {index + 1}
                </span>
              </div>
              <VenueCard venue={venue} locale={locale} />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href={`/${locale}/search?sort=trending`}
            className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            {t('trending.viewAll')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-amber-500/20" />
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" />
          <div className="absolute inset-0 border border-amber-500/20 rounded-3xl" />

          <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-400" />
              <Star className="w-5 h-5 text-amber-400" />
              <Star className="w-5 h-5 text-amber-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white max-w-2xl mx-auto">
              {t('cta.title')}
            </h2>

            <p className="mt-4 text-gray-400 max-w-xl mx-auto">
              {t('cta.subtitle')}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/${locale}/search`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25"
              >
                {t('cta.button')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
