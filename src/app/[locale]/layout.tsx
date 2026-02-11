import { ReactNode } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales, type Locale } from '@/i18n/config';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  const seo = messages.seo;

  return {
    title: {
      default: seo.defaultTitle,
      template: seo.titlePattern.replace('{page}', '%s'),
    },
    description: seo.defaultDescription,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_BASE_URL || 'https://morocnights.com'
    ),
    openGraph: {
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      siteName: 'Moroc Nights',
      locale: locale === 'fr' ? 'fr_MA' : 'en_US',
      alternateLocale: locale === 'fr' ? 'en_US' : 'fr_MA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.defaultTitle,
      description: seo.defaultDescription,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        fr: '/fr',
        en: '/en',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Load messages for the current locale
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-zinc-950 focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      {/* Site Header */}
      <Header />

      {/* Main Content */}
      <main
        id="main-content"
        className="min-h-screen pt-16 lg:pt-18"
      >
        {children}
      </main>

      {/* Site Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </NextIntlClientProvider>
  );
}
