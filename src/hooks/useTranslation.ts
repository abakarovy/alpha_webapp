import { useI18nStore } from '../lib/i18n-store';
import { getTranslation } from '../lib/i18n';

export function useTranslation() {
  const language = useI18nStore((state) => state.language);
  
  const t = (key: string): string => {
    return getTranslation(language, key);
  };
  
  return { t, language };
}

