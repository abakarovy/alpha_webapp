import { useTranslation } from '../hooks/useTranslation';

export function TemplatesPage() {
  const { t } = useTranslation();

  return (
    <div className="chat-shell flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-2xl font-semibold">
            {t('templates.title')}
          </h1>
          <div className="surface-card space-y-4 rounded-2xl px-6 py-5">
            <p className="text-sm text-gray-500">
              {t('templates.comingSoon')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
