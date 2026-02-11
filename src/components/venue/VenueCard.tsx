import Link from 'next/link';
import Image from 'next/image';
import { MapPin, DollarSign, Crown } from 'lucide-react';

/**
 * Flexible venue prop type that works with both the base Venue type
 * (from list queries) and enriched types like VenueWithJoins or VenueCard.
 */
interface VenueCardVenue {
  id: number;
  name: string;
  slug: string;
  neighborhood?: string | null;
  price_range?: string;
  is_sponsored?: boolean;
  // These fields come from VenueWithJoins or VenueCard:
  category_slug?: string;
  city_slug?: string;
  cover_image_url?: string | null;
  cover_photo?: string | null;
  category_name?: string;
  tags?: string[];
}

interface VenueCardProps {
  venue: VenueCardVenue;
  locale: string;
  showRank?: boolean;
  rank?: number;
}

/**
 * Convert a price_range string like '€€', '€€€', '€€€€' to a numeric level.
 */
function priceRangeToNumber(range: string | undefined): number {
  if (!range) return 0;
  // Count euro signs
  const euroCount = (range.match(/€/g) || []).length;
  if (euroCount > 0) return euroCount;
  // Count dollar signs
  const dollarCount = (range.match(/\$/g) || []).length;
  if (dollarCount > 0) return dollarCount;
  // Fallback: treat length as level
  return range.length;
}

const priceRangeDisplay = (range: number) => {
  return Array.from({ length: 4 }, (_, i) => (
    <DollarSign
      key={i}
      className={`w-3 h-3 ${i < range ? 'text-amber-400' : 'text-gray-600'}`}
    />
  ));
};

const categoryColors: Record<string, string> = {
  nightclub: 'bg-purple-500/20 text-purple-300',
  lounge: 'bg-blue-500/20 text-blue-300',
  restaurant: 'bg-emerald-500/20 text-emerald-300',
  'beach-club': 'bg-cyan-500/20 text-cyan-300',
  bar: 'bg-orange-500/20 text-orange-300',
  rooftop: 'bg-rose-500/20 text-rose-300',
};

export default function VenueCard({ venue, locale }: VenueCardProps) {
  const isSponsored = venue.is_sponsored ?? false;
  const categorySlug = venue.category_slug ?? '';
  const citySlug = venue.city_slug ?? '';
  const coverImage = venue.cover_image_url ?? venue.cover_photo ?? '/images/placeholder.jpg';
  const categoryName = venue.category_name ?? categorySlug;
  const categoryStyle = categoryColors[categorySlug] || 'bg-gray-500/20 text-gray-300';
  const priceLevel = priceRangeToNumber(venue.price_range);

  // Build href - if we have city/category slugs, use full path; otherwise link to slug only
  const href = citySlug && categorySlug
    ? `/${locale}/${citySlug}/${categorySlug}/${venue.slug}`
    : `/${locale}/${venue.slug}`;

  return (
    <Link
      href={href}
      className={`group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 ${
        isSponsored
          ? 'bg-gray-800/50 backdrop-blur-sm border border-amber-500/30 hover:border-amber-500/60'
          : 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50'
      }`}
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={coverImage}
          alt={venue.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />

        {/* Sponsored badge */}
        {isSponsored && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm">
            <Crown className="w-3 h-3 text-gray-950" />
            <span className="text-xs font-semibold text-gray-950">Featured</span>
          </div>
        )}

        {/* Category badge */}
        {categoryName && (
          <div className="absolute bottom-3 left-3">
            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${categoryStyle}`}>
              {categoryName}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Venue name */}
        <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors duration-200 line-clamp-1">
          {venue.name}
        </h3>

        {/* Location */}
        {venue.neighborhood && (
          <div className="flex items-center gap-1.5 mt-1.5 text-gray-400">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{venue.neighborhood}</span>
          </div>
        )}

        {/* Price range and tags row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
          {/* Price range */}
          <div className="flex items-center gap-0.5">
            {priceRangeDisplay(priceLevel)}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 overflow-hidden">
            {venue.tags?.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 rounded-md bg-gray-700/50 text-xs text-gray-400 whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
