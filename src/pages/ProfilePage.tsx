import { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/auth-store';
import { authApi, type UserProfile } from '../lib/api';
import { useTranslation } from '../hooks/useTranslation';
import { CustomSelect } from '../components/CustomSelect';

export function ProfilePage() {
  const { user, token, updateProfile: updateAuthProfile } = useAuthStore();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    nickname: '',
    phone: '',
    country: '',
    gender: '',
    business_type: 'general',
    telegram_username: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);
      try {
        const userProfile = await authApi.getProfile(user.id);
        setProfile(userProfile);
        setFormData({
          full_name: userProfile.full_name || '',
          nickname: userProfile.nickname || '',
          phone: userProfile.phone || '',
          country: userProfile.country || '',
          gender: userProfile.gender || '',
          business_type: userProfile.business_type || 'general',
          telegram_username: userProfile.telegram_username || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedProfile = await authApi.updateProfile(token, formData);
      setProfile(updatedProfile);
      await updateAuthProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, country: value }));
  };

  if (isLoading) {
    return (
      <div className="chat-shell flex h-full flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-sm text-gray-500">{t('auth.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-shell flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-2xl font-semibold">{t('profile.title')}</h1>

          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
              {t('profile.updateSuccess')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="surface-card rounded-xl px-6 py-5 space-y-4">
              <h2 className="text-lg font-medium">{t('profile.personalInfo')}</h2>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm text-gray-500">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="surface-input w-full rounded-lg px-4 py-2 text-sm border disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">{t('profile.emailCannotChange')}</p>
              </div>

              <div>
                <label htmlFor="full_name" className="mb-2 block text-sm text-gray-500">
                  {t('auth.fullName')}
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="surface-input w-full rounded-lg px-4 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-[#AD2023]/50"
                />
              </div>

              <div>
                <label htmlFor="nickname" className="mb-2 block text-sm text-gray-500">
                  {t('auth.nickname')}
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  className="surface-input w-full rounded-lg px-4 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-[#AD2023]/50"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm text-gray-500">
                  {t('auth.phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="surface-input w-full rounded-lg px-4 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-[#AD2023]/50"
                />
              </div>

              <div>
                <label htmlFor="telegram_username" className="mb-2 block text-sm text-gray-500">
                  {t('auth.telegramUsername')}
                </label>
                <input
                  type="text"
                  id="telegram_username"
                  name="telegram_username"
                  value={formData.telegram_username}
                  onChange={handleChange}
                  placeholder="@username"
                  className="surface-input w-full rounded-lg px-4 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-[#AD2023]/50"
                />
              </div>

              <div>
                <label htmlFor="country" className="mb-2 block text-sm text-gray-500">
                  {t('auth.country')}
                </label>
                <CustomSelect
                  id="country"
                  value={formData.country}
                  onChange={handleCountryChange}
                  placeholder={t('auth.selectCountry')}
                  options={[
                    { value: 'russia', label: t('auth.russia') },
                    { value: 'america', label: t('auth.america') },
                    { value: 'britain', label: t('auth.britain') },
                  ]}
                />
              </div>

              <div>
                <label htmlFor="gender" className="mb-2 block text-sm text-gray-500">
                  {t('auth.gender')}
                </label>
                <CustomSelect
                  id="gender"
                  value={formData.gender}
                  onChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                  placeholder={t('auth.selectGender')}
                  options={[
                    { value: 'male', label: t('auth.male') },
                    { value: 'female', label: t('auth.female') },
                    { value: 'other', label: t('auth.other') },
                  ]}
                />
              </div>
            </div>

            <div className="surface-card rounded-xl px-6 py-5 space-y-4">
              <h2 className="text-lg font-medium">{t('profile.businessInfo')}</h2>

              <div>
                <label htmlFor="business_type" className="mb-2 block text-sm text-gray-500">
                  {t('auth.businessType')}
                </label>
                <CustomSelect
                  id="business_type"
                  value={formData.business_type}
                  onChange={(value) => setFormData((prev) => ({ ...prev, business_type: value }))}
                  placeholder={t('auth.selectBusinessType')}
                  options={[
                    { value: 'general', label: t('auth.general') },
                    { value: 'retail', label: t('auth.retail') },
                    { value: 'ecommerce', label: t('auth.ecommerce') },
                    { value: 'service', label: t('auth.service') },
                  ]}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-[#AD2023] px-6 py-2 text-sm font-medium text-white hover:bg-[#AD2023]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? t('profile.saving') : t('profile.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

