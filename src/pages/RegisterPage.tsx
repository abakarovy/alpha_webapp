import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../lib/auth-store';
import { useTranslation } from '../hooks/useTranslation';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    nickname: '',
    phone: '',
    country: '',
    gender: '',
    business_type: 'general',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(formData.email, formData.password, {
        full_name: formData.full_name || undefined,
        nickname: formData.nickname || undefined,
        phone: formData.phone || undefined,
        country: formData.country || undefined,
        gender: formData.gender || undefined,
        business_type: formData.business_type || undefined,
      });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-4">
      <div className="surface-card w-full max-w-md rounded-2xl border px-6 py-6">
        <h1 className="mb-4 text-xl font-semibold">{t('auth.register')}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium">
              {t('auth.email')} *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="surface-input w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD2023]/50"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium">
              {t('auth.password')} *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="surface-input w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD2023]/50"
            />
          </div>

          <div>
            <label htmlFor="full_name" className="mb-1 block text-xs font-medium">
              {t('auth.fullName')}
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              className="surface-input w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD2023]/50"
            />
          </div>

          <div>
            <label htmlFor="nickname" className="mb-1 block text-xs font-medium">
              {t('auth.nickname')}
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              value={formData.nickname}
              onChange={handleChange}
              className="surface-input w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD2023]/50"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-xs font-medium">
              {t('auth.phone')}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="surface-input w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD2023]/50"
            />
          </div>

          <div>
            <label htmlFor="country" className="mb-1 block text-xs font-medium">
              {t('auth.country')}
            </label>
            <input
              id="country"
              name="country"
              type="text"
              value={formData.country}
              onChange={handleChange}
              className="surface-input w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD2023]/50"
            />
          </div>

          <div>
            <label htmlFor="gender" className="mb-1 block text-xs font-medium">
              {t('auth.gender')}
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="surface-input w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD2023]/50"
            >
              <option value="">{t('auth.selectGender')}</option>
              <option value="male">{t('auth.male')}</option>
              <option value="female">{t('auth.female')}</option>
              <option value="other">{t('auth.other')}</option>
            </select>
          </div>

          <div>
            <label htmlFor="business_type" className="mb-1 block text-xs font-medium">
              {t('auth.businessType')}
            </label>
            <select
              id="business_type"
              name="business_type"
              value={formData.business_type}
              onChange={handleChange}
              className="surface-input w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD2023]/50"
            >
              <option value="general">{t('auth.general')}</option>
              <option value="retail">{t('auth.retail')}</option>
              <option value="ecommerce">{t('auth.ecommerce')}</option>
              <option value="service">{t('auth.service')}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-[#AD2023] px-4 py-2 text-sm font-medium text-white hover:bg-[#AD2023]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {isLoading ? t('auth.loading') : t('auth.register')}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-[#AD2023] hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}

