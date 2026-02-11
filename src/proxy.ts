import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

// Next.js 16: proxy.ts replaces middleware.ts
// next-intl's createMiddleware returns a compatible handler
export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
