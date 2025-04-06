import { useState, useEffect } from 'react';
import { dbOps } from '../lib/db';
import { useI18n } from '../lib/i18n/context';

export function LogoSettings() {
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { t } = useI18n();

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const value = await dbOps.getSetting('logo_url');
      setLogoUrl(value || '');
    } catch (err) {
      console.error('Error fetching logo URL:', err);
      setError(t('settings.logo.error'));
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await dbOps.setSetting('logo_url', logoUrl);
      setMessage(t('settings.logo.success'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {t('settings.logo.title')}
      </h2>

      {message && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('settings.logo.url')}
          </label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                      shadow-sm focus:border-purple-500 focus:ring-purple-500 
                      dark:bg-gray-700 dark:text-white"
            placeholder={t('settings.logo.urlPlaceholder')}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('settings.logo.description')}
          </p>
        </div>

        {logoUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.logo.preview')}
            </p>
            <div className="p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
              <img 
                src={logoUrl} 
                alt="Logo Preview" 
                className="h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🖥️</text></svg>';
                  setError(t('settings.logo.loadError'));
                }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-purple-600 text-white rounded-md 
                   hover:bg-purple-700 focus:outline-none focus:ring-2 
                   focus:ring-purple-500 focus:ring-offset-2 
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? t('settings.logo.saving') : t('settings.logo.saveButton')}
        </button>
      </form>
    </div>
  );
}
