'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Maximize2,
} from 'lucide-react';
import type { VenuePhoto } from '@/types/database';

interface PhotoGalleryProps {
  photos: VenuePhoto[];
  venueName: string;
}

export default function PhotoGallery({ photos, venueName }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState<Record<number, boolean>>({});
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const totalPhotos = photos.length;
  const hasMultiplePhotos = totalPhotos > 1;

  const navigatePhoto = useCallback(
    (direction: 'prev' | 'next') => {
      setSelectedIndex((current) => {
        if (direction === 'next') {
          return current < totalPhotos - 1 ? current + 1 : 0;
        }
        return current > 0 ? current - 1 : totalPhotos - 1;
      });
    },
    [totalPhotos]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          navigatePhoto('prev');
          break;
        case 'ArrowRight':
          navigatePhoto('next');
          break;
        case 'Escape':
          setIsFullscreen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullscreen, navigatePhoto]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.children[selectedIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [selectedIndex]);

  // Touch swipe handling for fullscreen
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        navigatePhoto('next');
      } else {
        navigatePhoto('prev');
      }
    }

    setTouchStartX(null);
  };

  const handleImageLoad = (index: number) => {
    setIsLoaded((prev) => ({ ...prev, [index]: true }));
  };

  if (photos.length === 0) {
    return (
      <div className="aspect-[16/9] sm:aspect-[2/1] rounded-2xl bg-gray-800/50 flex items-center justify-center">
        <p className="text-gray-500">No photos available</p>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-3">
        {/* Cover Image */}
        <div className="relative group">
          <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-[21/9] rounded-2xl overflow-hidden bg-gray-800/50">
            {/* Loading skeleton */}
            {!isLoaded[selectedIndex] && (
              <div className="absolute inset-0 animate-pulse bg-gray-800/80">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/30 to-transparent animate-shimmer" />
              </div>
            )}

            <Image
              src={photos[selectedIndex].url}
              alt={photos[selectedIndex].alt || `${venueName} photo ${selectedIndex + 1}`}
              fill
              className={`object-cover transition-opacity duration-300 ${
                isLoaded[selectedIndex] ? 'opacity-100' : 'opacity-0'
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1200px"
              priority={selectedIndex === 0}
              onLoad={() => handleImageLoad(selectedIndex)}
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/30 via-transparent to-transparent" />

            {/* Navigation arrows */}
            {hasMultiplePhotos && (
              <>
                <button
                  type="button"
                  onClick={() => navigatePhoto('prev')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-950/60 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center text-white hover:bg-gray-950/80 hover:border-amber-500/30 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigatePhoto('next')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-950/60 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center text-white hover:bg-gray-950/80 hover:border-amber-500/30 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Counter + fullscreen button */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              {hasMultiplePhotos && (
                <span className="px-3 py-1.5 rounded-lg bg-gray-950/60 backdrop-blur-sm text-white text-sm font-medium">
                  {selectedIndex + 1}/{totalPhotos}
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="w-9 h-9 rounded-lg bg-gray-950/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-gray-950/80 transition-colors"
                aria-label="View fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Click to open fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="absolute inset-0 cursor-zoom-in"
              aria-label="Open fullscreen gallery"
            >
              <span className="sr-only">Open fullscreen</span>
            </button>
          </div>
        </div>

        {/* Thumbnail Strip */}
        {hasMultiplePhotos && (
          <div
            ref={thumbnailsRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
          >
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`flex-none relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-200 ${
                  index === selectedIndex
                    ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-gray-950 opacity-100'
                    : 'opacity-50 hover:opacity-80'
                }`}
                aria-label={`View photo ${index + 1}`}
              >
                <Image
                  src={photo.url}
                  alt={photo.alt || `${venueName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-gray-950/95 backdrop-blur-xl flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              {hasMultiplePhotos && (
                <span className="text-sm text-gray-400 font-medium">
                  {selectedIndex + 1} / {totalPhotos}
                </span>
              )}
              <span className="text-sm text-gray-500 truncate max-w-[200px]">
                {venueName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="w-10 h-10 rounded-full bg-gray-800/60 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors"
              aria-label="Close fullscreen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main image area */}
          <div className="flex-1 relative flex items-center justify-center px-4 sm:px-16">
            {/* Navigation arrows */}
            {hasMultiplePhotos && (
              <>
                <button
                  type="button"
                  onClick={() => navigatePhoto('prev')}
                  className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gray-800/60 border border-gray-700/50 items-center justify-center text-white hover:bg-gray-700/60 hover:border-amber-500/30 transition-all z-10"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => navigatePhoto('next')}
                  className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gray-800/60 border border-gray-700/50 items-center justify-center text-white hover:bg-gray-700/60 hover:border-amber-500/30 transition-all z-10"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Photo */}
            <div className="relative w-full h-full max-w-5xl mx-auto">
              <Image
                src={photos[selectedIndex].url}
                alt={photos[selectedIndex].alt || `${venueName} photo ${selectedIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>

          {/* Fullscreen Thumbnail Strip */}
          {hasMultiplePhotos && (
            <div className="flex justify-center gap-2 px-4 py-4 overflow-x-auto scrollbar-hide">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`flex-none relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                    index === selectedIndex
                      ? 'ring-2 ring-amber-500 opacity-100 scale-105'
                      : 'opacity-40 hover:opacity-70'
                  }`}
                  aria-label={`View photo ${index + 1}`}
                >
                  <Image
                    src={photo.url}
                    alt={photo.alt || `Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
