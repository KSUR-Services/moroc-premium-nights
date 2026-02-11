// =============================================================================
// SEO utilities — Morocco Premium Nightlife Directory
// =============================================================================

import type { Metadata } from 'next';
import type {
  City,
  Category,
  VenueWithDetails,
  VenueCard,
} from '@/types/database';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://morocnights.com';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type Locale = 'fr' | 'en';

/**
 * Return the VenueContent entry that matches the requested locale.
 * Falls back to the first available content if the locale is not found.
 */
function getLocalizedContent(
  contents: VenueWithDetails['contents'],
  locale: Locale,
) {
  return (
    contents.find((c) => c.language === locale) ??
    contents[0] ??
    null
  );
}

/**
 * Build a canonical venue URL.
 */
function venueUrl(
  locale: Locale,
  citySlug: string,
  categorySlug: string,
  venueSlug: string,
): string {
  return [BASE_URL, locale, citySlug, categorySlug, venueSlug].join('/');
}

/**
 * Sort photos so that the cover comes first, then order by `order`.
 */
function sortedPhotos(photos: VenueWithDetails['photos']): VenueWithDetails['photos'] {
  return [...photos].sort((a, b) => {
    if (a.is_cover && !b.is_cover) return -1;
    if (!a.is_cover && b.is_cover) return 1;
    return a.order - b.order;
  });
}

// ---------------------------------------------------------------------------
// Metadata generators (Next.js App Router)
// ---------------------------------------------------------------------------

/**
 * Generate a full Next.js `Metadata` object for a venue detail page.
 */
export function generateVenueMetadata(
  venue: VenueWithDetails,
  locale: Locale,
): Metadata {
  const content = getLocalizedContent(venue.contents, locale);
  const description = content?.description ?? '';
  const title = venue.name;
  const citySlug = venue.city?.slug ?? '';
  const categorySlug = venue.category?.slug ?? '';
  const canonical = venueUrl(locale, citySlug, categorySlug, venue.slug);
  const images = sortedPhotos(venue.photos).map((p) => ({
    url: p.url,
    alt: p.alt ?? venue.name,
  }));

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        fr: venueUrl('fr', citySlug, categorySlug, venue.slug),
        en: venueUrl('en', citySlug, categorySlug, venue.slug),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'MorocNights',
      locale: locale === 'fr' ? 'fr_MA' : 'en_US',
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((img) => img.url),
    },
    keywords: content?.seo_keywords ?? [],
  };
}

/**
 * Generate a full Next.js `Metadata` object for a city landing page.
 */
export function generateCityMetadata(
  city: City,
  locale: Locale,
): Metadata {
  const title =
    locale === 'fr'
      ? "Sorties et vie nocturne \u00e0 " + city.name
      : 'Nightlife & going out in ' + city.name;
  const description = city.description ?? title;
  const canonical = [BASE_URL, locale, city.slug].join('/');

  const images = city.hero_image_url
    ? [{ url: city.hero_image_url, alt: city.name }]
    : [];

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        fr: [BASE_URL, 'fr', city.slug].join('/'),
        en: [BASE_URL, 'en', city.slug].join('/'),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'MorocNights',
      locale: locale === 'fr' ? 'fr_MA' : 'en_US',
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((img) => img.url),
    },
  };
}

/**
 * Generate a full Next.js `Metadata` object for a category listing page
 * within a specific city.
 */
export function generateCategoryMetadata(
  city: City,
  category: Category,
  locale: Locale,
): Metadata {
  const title =
    locale === 'fr'
      ? category.name + ' \u00e0 ' + city.name
      : category.name + ' in ' + city.name;
  const description =
    locale === 'fr'
      ? 'D\u00e9couvrez les meilleurs ' +
        category.name.toLowerCase() +
        ' \u00e0 ' +
        city.name
      : 'Discover the best ' +
        category.name.toLowerCase() +
        ' in ' +
        city.name;
  const canonical = [BASE_URL, locale, city.slug, category.slug].join('/');

  const images = city.hero_image_url
    ? [{ url: city.hero_image_url, alt: title }]
    : [];

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        fr: [BASE_URL, 'fr', city.slug, category.slug].join('/'),
        en: [BASE_URL, 'en', city.slug, category.slug].join('/'),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'MorocNights',
      locale: locale === 'fr' ? 'fr_MA' : 'en_US',
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((img) => img.url),
    },
  };
}

// ---------------------------------------------------------------------------
// JSON-LD generators (structured data)
// ---------------------------------------------------------------------------

/**
 * Build a Schema.org `LocalBusiness` JSON-LD object for a venue.
 */
export function generateVenueJsonLd(
  venue: VenueWithDetails,
  locale: Locale,
): Record<string, unknown> {
  const content = getLocalizedContent(venue.contents, locale);
  const citySlug = venue.city?.slug ?? '';
  const categorySlug = venue.category?.slug ?? '';
  const photos = sortedPhotos(venue.photos);
  const [lng, lat] = venue.latlng.coordinates;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: venue.name,
    description: content?.description ?? '',
    url: venueUrl(locale, citySlug, categorySlug, venue.slug),
    image: photos.map((p) => p.url),
    address: {
      '@type': 'PostalAddress',
      streetAddress: venue.address,
      addressLocality: venue.neighborhood ?? '',
      addressCountry: 'MA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: lat,
      longitude: lng,
    },
    priceRange: venue.price_range,
    ...(venue.phone ? { telephone: venue.phone } : {}),
    ...(venue.website ? { sameAs: venue.website } : {}),
  };
}

/**
 * Build a Schema.org `BreadcrumbList` JSON-LD object.
 */
export function generateBreadcrumbJsonLd(
  items: { name: string; href: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href.startsWith('http')
        ? item.href
        : BASE_URL + item.href,
    })),
  };
}

/**
 * Build a Schema.org `ItemList` JSON-LD object from an array of venue cards.
 */
export function generateItemListJsonLd(
  venues: VenueCard[],
  locale: Locale,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: venues.map((venue, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: venueUrl(locale, venue.city_slug, venue.category_slug, venue.slug),
      name: venue.name,
    })),
  };
}

// ---------------------------------------------------------------------------
// Script tag helper
// ---------------------------------------------------------------------------

/**
 * Return props suitable for a `<script>` tag to embed a JSON-LD object.
 *
 * Usage in a Next.js server component:
 * ```tsx
 * <script {...jsonLdScriptProps(data)} />
 * ```
 */
export function jsonLdScriptProps(
  data: Record<string, unknown>,
): {
  type: string;
  dangerouslySetInnerHTML: { __html: string };
} {
  return {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data),
    },
  };
}
