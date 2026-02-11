import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Phone,
  Globe,
  Instagram,
  Share2,
  Crown,
  DollarSign,
  Music,
  Shirt,
  Wine,
  Users,
  ChevronRight,
  ExternalLink,
  Navigation,
  MessageCircle,
} from 'lucide-react';
import {
  getVenueBySlug,
  getVenueContent,
  getVenueAttributes,
  getVenuePhotos,
  getNearbyVenues,
  type VenueWithJoins,
} from '@/lib/supabase/queries';
import PhotoGallery from '@/components/venue/PhotoGallery';
import type { VenueContent, VenuePhoto } from '@/types/database';

interface VenuePageProps {
  params: Promise<{ locale: string; city: string; category: string; slug: string }>;
}

/**
 * Map a price_range string like '€€', '€€€', '€€€€' to a numeric level (2-4).
 */
function priceRangeToNumber(range: string): number {
  return range.length;
}

export async function generateMetadata({ params }: VenuePageProps): Promise<Metadata> {
  const { locale, city, category, slug } = await params;

  const [venue, content] = await Promise.all([
    getVenueBySlug(slug),
    getVenueContent(slug, locale as 'fr' | 'en'),
  ]);

  if (!venue) {
    return { title: 'Venue Not Found' };
  }

  const title = content?.seo_title || `${venue.name} | Moroc Premium Nights`;
  const description =
    content?.seo_description ||
    content?.description?.substring(0, 160) ||
    `${venue.name} - ${venue.category_name} in ${venue.neighborhood}, ${venue.city_name}`;
  const keywords = content?.seo_keywords || [];

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title: venue.name,
      description,
      type: 'website',
      images: venue.cover_image_url
        ? [
            {
              url: venue.cover_image_url,
              width: 1200,
              height: 630,
              alt: venue.name,
            },
          ]
        : [],
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: venue.name,
      description,
      images: venue.cover_image_url ? [venue.cover_image_url] : [],
    },
    alternates: {
      canonical: `/${locale}/${city}/${category}/${slug}`,
      languages: {
        en: `/en/${city}/${category}/${slug}`,
        fr: `/fr/${city}/${category}/${slug}`,
        ar: `/ar/${city}/${category}/${slug}`,
      },
    },
  };
}

function generateJsonLd(
  venue: VenueWithJoins,
  content: (VenueContent & { seo_title?: string; seo_description?: string }) | null,
  attributes: Record<string, any> | null,
) {
  const latitude = venue.latlng?.coordinates?.[1] ?? null;
  const longitude = venue.latlng?.coordinates?.[0] ?? null;
  const priceLevel = priceRangeToNumber(venue.price_range);

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://morocpremium.nights/${venue.city_slug}/${venue.category_slug}/${venue.slug}`,
    name: venue.name,
    description: content?.description || '',
    image: venue.cover_image_url,
    url: `https://morocpremium.nights/${venue.city_slug}/${venue.category_slug}/${venue.slug}`,
    telephone: venue.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: venue.address,
      addressLocality: venue.city_name,
      addressCountry: 'MA',
    },
    geo:
      latitude !== null && longitude !== null
        ? {
            '@type': 'GeoCoordinates',
            latitude,
            longitude,
          }
        : undefined,
    priceRange: '$'.repeat(priceLevel),
    openingHoursSpecification:
      attributes?.opening_hours?.map(
        (hours: { day: string; open: string; close: string }) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: hours.day,
          opens: hours.open,
          closes: hours.close,
        }),
      ) || [],
    servesCuisine: attributes?.cuisine_type || undefined,
    acceptsReservations: attributes?.accepts_reservations || false,
  };
}

const priceRangeDisplay = (range: number) => {
  return Array.from({ length: 4 }, (_, i) => (
    <DollarSign
      key={i}
      className={`w-4 h-4 ${i < range ? 'text-amber-400' : 'text-gray-600'}`}
    />
  ));
};

export default async function VenueDetailPage({ params }: VenuePageProps) {
  const { locale, city: citySlug, category: categorySlug, slug } = await params;

  const t = await getTranslations('venue');

  const [venue, content, attributes, photos] = await Promise.all([
    getVenueBySlug(slug),
    getVenueContent(slug, locale as 'fr' | 'en'),
    getVenueAttributes(slug),
    getVenuePhotos(slug),
  ]);

  if (!venue) {
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

  // Extract lat/lng from GeoJSON latlng (coordinates are [longitude, latitude])
  const latitude = venue.latlng?.coordinates?.[1] ?? null;
  const longitude = venue.latlng?.coordinates?.[0] ?? null;

  // Numeric price range for display (count of euro signs)
  const priceLevel = priceRangeToNumber(venue.price_range);

  // Fetch nearby venues using the venue's coordinates
  let nearbyVenues: Awaited<ReturnType<typeof getNearbyVenues>> = [];
  if (latitude !== null && longitude !== null) {
    nearbyVenues = await getNearbyVenues(latitude, longitude, 5000);
    // Filter out the current venue from nearby results
    nearbyVenues = nearbyVenues.filter((v) => v.id !== venue.id).slice(0, 4);
  }

  const jsonLd = generateJsonLd(venue, content, attributes);

  // Build the photo array for the gallery. Use cover image as the first entry if available.
  const allPhotos: VenuePhoto[] = [
    ...(venue.cover_image_url
      ? [
          {
            id: 0,
            venue_id: venue.id,
            url: venue.cover_image_url,
            alt: venue.name,
            is_cover: true,
            order: 0,
          },
        ]
      : []),
    ...photos.filter((p) => p.url !== venue.cover_image_url),
  ];

  const whatsappUrl = venue.whatsapp
    ? `https://wa.me/${venue.whatsapp.replace(/[^0-9]/g, '')}`
    : null;

  // Gather tags from venue attributes if present
  const tags: string[] = (attributes as Record<string, any>)?.tags ?? [];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-gray-950">
        {/* Breadcrumbs */}
        <nav className="px-4 pt-20 pb-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <ol className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
            <li>
              <Link href={`/${locale}`} className="hover:text-amber-400 transition-colors">
                {t('breadcrumb.home')}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li>
              <Link href={`/${locale}/${citySlug}`} className="hover:text-amber-400 transition-colors">
                {venue.city_name}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li>
              <Link
                href={`/${locale}/${citySlug}/${categorySlug}`}
                className="hover:text-amber-400 transition-colors"
              >
                {venue.category_name}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li className="text-white font-medium truncate max-w-[200px]">
              {venue.name}
            </li>
          </ol>
        </nav>

        {/* Photo Gallery */}
        <section className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <PhotoGallery photos={allPhotos} venueName={venue.name} />
        </section>

        {/* Main Content */}
        <div className="px-4 py-8 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Main Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {/* Category badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-800/60 border border-gray-700/50 text-sm font-medium text-gray-300">
                    {venue.category_name}
                  </span>

                  {/* Price range */}
                  <div className="flex items-center gap-0.5">
                    {priceRangeDisplay(priceLevel)}
                  </div>

                  {/* Sponsored badge */}
                  {venue.is_sponsored && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm font-medium text-amber-400">
                      <Crown className="w-3.5 h-3.5" />
                      {t('badges.featured')}
                    </span>
                  )}
                </div>

                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">
                    {venue.name}
                  </h1>

                  {/* Share button */}
                  <button
                    type="button"
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-800/60 border border-gray-700/50 flex items-center justify-center hover:border-amber-500/50 hover:text-amber-400 text-gray-400 transition-colors"
                    aria-label={t('actions.share')}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-2 text-gray-400">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-amber-400" />
                  <span>{venue.neighborhood}, {venue.city_name}</span>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-block px-3 py-1 rounded-full bg-gray-800/60 border border-gray-700/50 text-sm text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Editorial Description */}
              {content?.description && (
                <div className="prose prose-invert prose-amber max-w-none">
                  <div className="p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      {t('sections.about')}
                    </h2>
                    <div
                      className="text-gray-300 leading-relaxed space-y-4"
                      dangerouslySetInnerHTML={{ __html: content.description }}
                    />
                  </div>
                </div>
              )}

              {/* Info Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Address */}
                {venue.address && (
                  <div className="p-5 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-amber-400" />
                      </div>
                      <h3 className="font-semibold text-white">{t('info.address')}</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{venue.address}</p>
                    {latitude !== null && longitude !== null && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        {t('info.getDirections')}
                      </a>
                    )}
                  </div>
                )}

                {/* Hours */}
                {attributes?.opening_hours && attributes.opening_hours.length > 0 && (
                  <div className="p-5 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-400" />
                      </div>
                      <h3 className="font-semibold text-white">{t('info.hours')}</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {attributes.opening_hours.map((hours: { day: string; open: string; close: string }) => (
                        <li key={hours.day} className="flex justify-between text-sm">
                          <span className="text-gray-400">{hours.day}</span>
                          <span className="text-gray-300 font-medium">
                            {hours.open} - {hours.close}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dress Code */}
                {attributes?.dress_code && (
                  <div className="p-5 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Shirt className="w-5 h-5 text-amber-400" />
                      </div>
                      <h3 className="font-semibold text-white">{t('info.dressCode')}</h3>
                    </div>
                    <p className="text-gray-300 text-sm">{attributes.dress_code}</p>
                  </div>
                )}

                {/* Music Style */}
                {attributes?.music_style && (
                  <div className="p-5 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Music className="w-5 h-5 text-amber-400" />
                      </div>
                      <h3 className="font-semibold text-white">{t('info.musicStyle')}</h3>
                    </div>
                    <p className="text-gray-300 text-sm">{attributes.music_style}</p>
                  </div>
                )}

                {/* Age Policy */}
                {attributes?.age_policy && (
                  <div className="p-5 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-amber-400" />
                      </div>
                      <h3 className="font-semibold text-white">{t('info.agePolicy')}</h3>
                    </div>
                    <p className="text-gray-300 text-sm">{attributes.age_policy}</p>
                  </div>
                )}

                {/* Alcohol */}
                {attributes?.alcohol_policy && (
                  <div className="p-5 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Wine className="w-5 h-5 text-amber-400" />
                      </div>
                      <h3 className="font-semibold text-white">{t('info.alcohol')}</h3>
                    </div>
                    <p className="text-gray-300 text-sm">
                      {attributes.alcohol_policy === 'yes' ? t('info.alcoholYes') : t('info.alcoholNo')}
                    </p>
                  </div>
                )}
              </div>

              {/* Map Embed Placeholder */}
              {latitude !== null && longitude !== null && (
                <div className="rounded-2xl overflow-hidden border border-gray-700/30">
                  <div
                    className="relative w-full h-64 sm:h-80 bg-gray-800/50 flex items-center justify-center"
                    data-latitude={latitude}
                    data-longitude={longitude}
                    data-venue-name={venue.name}
                    id="venue-map"
                  >
                    <div className="text-center">
                      <MapPin className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">{t('map.placeholder')}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {latitude.toFixed(4)}, {longitude.toFixed(4)}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-4 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        {t('map.openInMaps')}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Contact & Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                {/* Contact Card */}
                <div className="p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-5">
                    {t('contact.title')}
                  </h3>

                  <div className="space-y-3">
                    {/* WhatsApp - Primary CTA */}
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2.5 w-full px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/20"
                      >
                        <MessageCircle className="w-5 h-5" />
                        {t('contact.whatsapp')}
                      </a>
                    )}

                    {/* Phone */}
                    {venue.phone && (
                      <a
                        href={`tel:${venue.phone}`}
                        className="flex items-center gap-3 w-full px-5 py-3.5 bg-gray-800/60 border border-gray-700/50 hover:border-amber-500/30 rounded-xl transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-amber-500/10">
                          <Phone className="w-4 h-4 text-gray-400 group-hover:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('contact.phone')}</p>
                          <p className="text-sm text-gray-300 font-medium">{venue.phone}</p>
                        </div>
                      </a>
                    )}

                    {/* Instagram */}
                    {venue.instagram && (
                      <a
                        href={`https://instagram.com/${venue.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full px-5 py-3.5 bg-gray-800/60 border border-gray-700/50 hover:border-amber-500/30 rounded-xl transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-amber-500/10">
                          <Instagram className="w-4 h-4 text-gray-400 group-hover:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('contact.instagram')}</p>
                          <p className="text-sm text-gray-300 font-medium">{venue.instagram}</p>
                        </div>
                      </a>
                    )}

                    {/* Website */}
                    {venue.website && (
                      <a
                        href={venue.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full px-5 py-3.5 bg-gray-800/60 border border-gray-700/50 hover:border-amber-500/30 rounded-xl transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-amber-500/10">
                          <Globe className="w-4 h-4 text-gray-400 group-hover:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('contact.website')}</p>
                          <p className="text-sm text-gray-300 font-medium truncate max-w-[180px]">
                            {venue.website.replace(/^https?:\/\//, '')}
                          </p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>

                {/* Quick Info Summary */}
                <div className="p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {t('quickInfo.title')}
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">{t('quickInfo.category')}</dt>
                      <dd className="text-sm text-gray-300 font-medium">{venue.category_name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">{t('quickInfo.priceRange')}</dt>
                      <dd className="flex items-center gap-0.5">
                        {priceRangeDisplay(priceLevel)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">{t('quickInfo.neighborhood')}</dt>
                      <dd className="text-sm text-gray-300 font-medium">{venue.neighborhood}</dd>
                    </div>
                    {attributes?.dress_code && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-400">{t('quickInfo.dressCode')}</dt>
                        <dd className="text-sm text-gray-300 font-medium">{attributes.dress_code}</dd>
                      </div>
                    )}
                    {attributes?.age_policy && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-400">{t('quickInfo.agePolicy')}</dt>
                        <dd className="text-sm text-gray-300 font-medium">{attributes.age_policy}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Venues */}
        {nearbyVenues.length > 0 && (
          <section className="px-4 py-12 sm:px-6 md:px-8 max-w-7xl mx-auto border-t border-gray-800/50">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
              {t('nearby.title')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {nearbyVenues.map((nearby) => (
                <div
                  key={nearby.id}
                  className="p-4 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 hover:border-gray-600/50 transition-colors"
                >
                  <h3 className="text-white font-semibold truncate">{nearby.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {nearby.distance_m < 1000
                      ? `${Math.round(nearby.distance_m)}m away`
                      : `${(nearby.distance_m / 1000).toFixed(1)}km away`}
                  </p>
                  <Link
                    href={`/${locale}/${citySlug}/${categorySlug}/${nearby.slug}`}
                    className="inline-flex items-center gap-1 mt-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    View details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
