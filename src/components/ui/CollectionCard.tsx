import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Collection } from '@/types/database';

interface CollectionCardProps {
  collection: Collection;
  locale: string;
}

export default function CollectionCard({ collection, locale }: CollectionCardProps) {
  const venueCount = collection.venue_ids?.length ?? 0;

  return (
    <Link
      href={`/${locale}/search?collection=${collection.slug}`}
      className="group block relative aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900"
    >
      {/* Multi-layer gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/40 to-transparent" />

      {/* Gold accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-medium">
            {venueCount} {venueCount === 1 ? 'venue' : 'venues'}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors duration-300 line-clamp-2">
          {collection.name}
        </h3>

        {collection.description && (
          <p className="mt-1 text-sm text-gray-400 line-clamp-2">
            {collection.description}
          </p>
        )}

        <div className="mt-3 inline-flex items-center gap-1.5 text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          Explore
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Hover border */}
      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-amber-500/30 transition-colors duration-300" />
    </Link>
  );
}
