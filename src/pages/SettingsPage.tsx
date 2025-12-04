import { useI18nStore } from '../lib/i18n-store';
import { useThemeStore } from '../lib/theme-store';
import { useTranslation } from '../hooks/useTranslation';
import type { Language } from '../lib/i18n';
import { CustomSelect } from '../components/CustomSelect';

export function SettingsPage() {
  const { t, language } = useTranslation();
  const setLanguage = useI18nStore((state) => state.setLanguage);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);


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
                <CustomSelect
                  id="language-select"
                  value={language}
                  onChange={(value) => setLanguage(value as Language)}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'ru', label: 'Русский' },
                  ]}
                />
              </div>
            </div>
            <div className="surface-card rounded-xl px-6 py-5">
              <h2 className="mb-3 text-lg font-medium">
                {t('settings.appearance')}
              </h2>
              <div className="mt-4">
                <label htmlFor="theme-select" className="mb-2 block text-sm text-gray-500">
                  {t('settings.selectTheme')}
                </label>
                <CustomSelect
                  id="theme-select"
                  value={theme}
                  onChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
                  options={[
                    { value: 'light', label: t('settings.light') },
                    { value: 'dark', label: t('settings.dark') },
                    { value: 'system', label: t('settings.system') },
                  ]}
                />
              </div>
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
