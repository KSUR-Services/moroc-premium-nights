export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
};

export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
};

export function getMessages(locale: Locale) {
  return import(`./messages/${locale}.json`).then((m) => m.default);
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
