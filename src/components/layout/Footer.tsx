'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Globe, Instagram, Heart } from 'lucide-react';
import { locales, type Locale } from '@/i18n/config';

const cities = [
  { slug: 'casablanca', labelKey: 'casablanca' },
  { slug: 'marrakech', labelKey: 'marrakech' },
  { slug: 'rabat', labelKey: 'rabat' },
  { slug: 'tangier', labelKey: 'tangier' },
  { slug: 'agadir', labelKey: 'agadir' },
] as const;

const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/morocnights',
    icon: Instagram,
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com/@morocnights',
    // Using a custom SVG for TikTok since lucide doesn't have it
    icon: null,
  },
];

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const currentYear = new Date().getFullYear();

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split('/');
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/'));
  };

  const otherLocale = locale === 'fr' ? 'en' : 'fr';

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/50 pb-20 lg:pb-0">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <span className="text-zinc-950 font-bold text-sm">MN</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-white">
                Moroc{' '}
                <span className="text-amber-500">Nights</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
              {t('footer.aboutDescription')}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://instagram.com/morocnights"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4.5 h-4.5" />
              </a>
              <a
                href="https://tiktok.com/@morocnights"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                aria-label="TikTok"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.98a8.21 8.21 0 0 0 4.76 1.52V7.05a4.84 4.84 0 0 1-1-.36z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/morocnights"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                aria-label="Facebook"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Cities Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 mb-4">
              {t('navigation.cities')}
            </h3>
            <ul className="space-y-2.5">
              {cities.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/${locale}/${city.slug}`}
                    className="text-sm text-zinc-400 hover:text-amber-500 transition-colors"
                  >
                    {t(`footer.cities.${city.labelKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 mb-4">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-sm text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  {t('navigation.about')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/collections`}
                  className="text-sm text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  {t('navigation.collections')}
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${t('footer.contactEmail')}`}
                  className="text-sm text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  {t('footer.contact')}
                </a>
              </li>
              <li>
                <Link
                  href={`/${locale}/add-venue`}
                  className="text-sm text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  {t('footer.addVenue')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/advertise`}
                  className="text-sm text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  {t('footer.advertise')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Language Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 mb-4">
              {t('footer.legal')}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-sm text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="text-sm text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/cookies`}
                  className="text-sm text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  {t('footer.cookies')}
                </Link>
              </li>
            </ul>

            {/* Language Switcher */}
            <div className="mt-6">
              <button
                onClick={() => switchLocale(otherLocale)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-800 text-sm text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
              >
                <Globe className="w-4 h-4" />
                <span>{t(`navigation.languageSwitcher.${otherLocale}`)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-500">
              {t('footer.copyright', { year: currentYear.toString() })}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-zinc-500">
              {t('footer.madeWithLove').split('love').map((part, i) =>
                i === 0 ? (
                  <span key={i}>
                    {part}
                    <Heart className="inline w-3.5 h-3.5 text-red-500 fill-red-500 mx-0.5" />
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
