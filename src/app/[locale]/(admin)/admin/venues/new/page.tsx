'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import VenueForm from '@/components/admin/VenueForm';

export default function NewVenuePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <Link
          href={`/${locale}/admin/venues`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Venues
        </Link>
      </div>
      <VenueForm mode="create" />
    </div>
  );
}
