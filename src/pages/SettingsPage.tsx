import { useI18nStore } from '../lib/i18n-store';
import { useTranslation } from '../hooks/useTranslation';
import type { Language } from '../lib/i18n';

export function SettingsPage() {
  const { t, language } = useTranslation();
  const setLanguage = useI18nStore((state) => state.setLanguage);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <div className="chat-shell flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-2xl font-semibold">
            {t('settings.title')}
          </h1>
          <div className="space-y-6">
            <div className="surface-card rounded-xl px-6 py-5">
              <h2 className="mb-3 text-lg font-medium">
                {t('settings.language')}
              </h2>
              <div className="mt-4">
                <label htmlFor="language-select" className="mb-2 block text-sm text-gray-500">
                  {t('settings.selectLanguage')}
                </label>
                <select
                  id="language-select"
                  value={language}
                  onChange={handleLanguageChange}
                  className="surface-input rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD2023]/50"
                >
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                </select>
              </div>
            </div>
            <div className="surface-card rounded-xl px-6 py-5">
              <h2 className="mb-3 text-lg font-medium">
                {t('settings.appearance')}
              </h2>
              <p className="text-sm text-gray-500">
                {t('settings.appearanceComingSoon')}
              </p>
            </div>
            <div className="surface-card rounded-xl px-6 py-5">
              <h2 className="mb-3 text-lg font-medium">
                {t('settings.account')}
              </h2>
              <p className="text-sm text-gray-500">
                {t('settings.accountComingSoon')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
