import en from './i18n/en.json';
import ru from './i18n/ru.json';

export type Language = 'en' | 'ru';

const translations = {
  en,
  ru,
} as const;

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      value = translations.en;
      for (const fallbackKey of keys) {
        value = value?.[fallbackKey];
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

