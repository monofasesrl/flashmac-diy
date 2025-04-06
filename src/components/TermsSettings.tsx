import { useState, useEffect } from 'react';
import { dbOps } from '../lib/db';
import { useI18n } from '../lib/i18n/context';

export function TermsSettings() {
  const { t } = useI18n();
  const [terms, setTerms] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const value = await dbOps.getSetting('terms_and_conditions');
      setTerms(value || '');
    } catch (err) {
      console.error('Error fetching terms:', err);
      setError(t('settings.terms.error'));
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await dbOps.setSetting('terms_and_conditions', terms);
      setMessage(t('settings.terms.success'));
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
        {t('settings.terms.title')}
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
            {t('settings.terms.text')}
          </label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                      shadow-sm focus:border-purple-500 focus:ring-purple-500 
                      dark:bg-gray-700 dark:text-white"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('settings.terms.description')}
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-purple-600 text-white rounded-md 
                   hover:bg-purple-700 focus:outline-none focus:ring-2 
                   focus:ring-purple-500 focus:ring-offset-2 
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? t('settings.terms.saving') : t('settings.terms.saveButton')}
        </button>
      </form>
    </div>
  );
}
