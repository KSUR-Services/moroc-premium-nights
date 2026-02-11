'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Home, Search, MapPin, Bookmark } from 'lucide-react';
import { type Locale } from '@/i18n/config';

interface NavItem {
  labelKey: string;
  icon: typeof Home;
  href: (locale: Locale) => string;
  matchPatterns: string[];
}

const navItems: NavItem[] = [
  {
    labelKey: 'navigation.home',
    icon: Home,
    href: (locale) => `/${locale}`,
    matchPatterns: ['$'], // Only exact match for home
  },
  {
    labelKey: 'navigation.search',
    icon: Search,
    href: (locale) => `/${locale}/search`,
    matchPatterns: ['/search'],
  },
  {
    labelKey: 'navigation.map',
    icon: MapPin,
    href: (locale) => `/${locale}/map`,
    matchPatterns: ['/map'],
  },
  {
    labelKey: 'navigation.collections',
    icon: Bookmark,
    href: (locale) => `/${locale}/collections`,
    matchPatterns: ['/collections'],
  },
];

export default function BottomNav() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  const isActive = (item: NavItem): boolean => {
    const localePath = `/${locale}`;
    // Special case for home: only match exact locale path
    if (item.matchPatterns.includes('$')) {
      return pathname === localePath || pathname === `${localePath}/`;
    }
    return item.matchPatterns.some((pattern) =>
      pathname.includes(pattern)
    );
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/50"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Safe area padding for devices with home indicator */}
      <div className="flex items-center justify-around px-2 pt-2 pb-safe">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.labelKey}
              href={item.href(locale)}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 min-w-[64px] rounded-xl transition-colors ${
                active
                  ? 'text-amber-500'
                  : 'text-zinc-500 active:text-zinc-300'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {/* Active indicator dot */}
              {active && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
              )}

              <Icon
                className={`w-5 h-5 transition-colors ${
                  active ? 'text-amber-500' : ''
                }`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium leading-tight ${
                  active ? 'text-amber-500' : ''
                }`}
              >
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Bottom safe area spacer for iOS */}
      <div className="h-safe-area-inset-bottom bg-zinc-950" />
    </nav>
  );
}
