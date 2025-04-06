import { useState, useEffect } from 'react';
import { dbOps } from '../lib/db';
import { useI18n } from '../lib/i18n/context';
import { emailService } from '../lib/email';

interface EmailSettings {
  email_new_ticket: boolean;
  email_status_change: boolean;
  email_admin_address: string;
  email_admin_old_tickets: boolean;
  email_admin_old_tickets_days: number;
}

export function EmailSettings() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<EmailSettings>({
    email_new_ticket: true,
    email_status_change: true,
    email_admin_address: '',
    email_admin_old_tickets: true,
    email_admin_old_tickets_days: 7
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const newSettings = { ...settings };
      for (const key of Object.keys(settings)) {
        const value = await dbOps.getSetting(key);
        if (value !== null) {
          switch (typeof settings[key as keyof EmailSettings]) {
            case 'boolean':
              (newSettings[key as keyof EmailSettings] as boolean) = value === 'true';
              break;
            case 'number':
              (newSettings[key as keyof EmailSettings] as number) = parseInt(value);
              break;
            case 'string':
              (newSettings[key as keyof EmailSettings] as string) = value;
              break;
          }
        }
      }
      setSettings(newSettings);
    } catch (err) {
      console.error('Error fetching email settings:', err);
      setError(t('settings.email.error'));
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      // Update each setting
      for (const [key, value] of Object.entries(settings)) {
        await dbOps.setSetting(key, value.toString());
      }
      setMessage(t('settings.email.success'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  
  const handleSendTestEmail = async () => {
    if (!settings.email_admin_address) {
      setError('Inserisci prima un indirizzo email amministratore');
      return;
    }
    
    setSaving(true);
    setMessage('');
    setError('');
    
    try {
      const result = await emailService.sendEmail({
        to: settings.email_admin_address,
        subject: 'FlashTicket - Email di Test',
        body: `
          <h2>Test Email FlashTicket</h2>
          <p>Questa è un'email di test dal tuo sistema FlashTicket.</p>
          <p>Se stai ricevendo questa email, le tue notifiche email funzionano correttamente.</p>
          <p>Impostazioni attuali:</p>
          <ul>
            <li>Invia email per nuovi ticket: ${settings.email_new_ticket ? 'Sì' : 'No'}</li>
            <li>Invia email per cambi di stato: ${settings.email_status_change ? 'Sì' : 'No'}</li>
            <li>Invia email per ticket vecchi: ${settings.email_admin_old_tickets ? 'Sì' : 'No'}</li>
            <li>Giorni prima della notifica ticket vecchi: ${settings.email_admin_old_tickets_days}</li>
          </ul>
          <p>Grazie per utilizzare FlashTicket!</p>
        `
      });
      
      if (result) {
        setMessage(t('settings.email.testSuccess'));
      } else {
        setError(t('settings.email.testError'));
      }
    } catch (err: any) {
      setError(err.message || t('settings.email.testError'));
    } finally {
      setSaving(false);
    }
  };
  
  const handleCheckOldTickets = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    
    try {
      const result = await dbOps.checkOldTickets();
      
      if (result) {
        setMessage('Notifica per i ticket vecchi inviata con successo!');
      } else {
        setMessage('Nessun ticket vecchio trovato o notifiche disabilitate.');
      }
    } catch (err: any) {
      setError(err.message || 'Impossibile controllare i ticket vecchi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {t('settings.email.title')}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('settings.email.adminEmail')}
            </label>
            <input
              type="email"
              value={settings.email_admin_address}
              onChange={(e) => setSettings({ ...settings, email_admin_address: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                        shadow-sm focus:border-purple-500 focus:ring-purple-500 
                        dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="email_new_ticket"
                checked={settings.email_new_ticket}
                onChange={(e) => setSettings({ ...settings, email_new_ticket: e.target.checked })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 
                          border-gray-300 rounded dark:border-gray-600"
              />
              <label htmlFor="email_new_ticket" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t('settings.email.newTicket')}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="email_status_change"
                checked={settings.email_status_change}
                onChange={(e) => setSettings({ ...settings, email_status_change: e.target.checked })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 
                          border-gray-300 rounded dark:border-gray-600"
              />
              <label htmlFor="email_status_change" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t('settings.email.statusChange')}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="email_admin_old_tickets"
                checked={settings.email_admin_old_tickets}
                onChange={(e) => setSettings({ ...settings, email_admin_old_tickets: e.target.checked })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 
                          border-gray-300 rounded dark:border-gray-600"
              />
              <label htmlFor="email_admin_old_tickets" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t('settings.email.oldTickets')}
              </label>
            </div>

            {settings.email_admin_old_tickets && (
              <div className="ml-6">
                <label className="block text-sm text-gray-700 dark:text-gray-300">
                  {t('settings.email.daysBeforeNotification')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.email_admin_old_tickets_days}
                  onChange={(e) => setSettings({ ...settings, email_admin_old_tickets_days: parseInt(e.target.value) })}
                  className="mt-1 block w-32 rounded-md border-gray-300 dark:border-gray-600 
                            shadow-sm focus:border-purple-500 focus:ring-purple-500 
                            dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-purple-600 text-white rounded-md 
                     hover:bg-purple-700 focus:outline-none focus:ring-2 
                     focus:ring-purple-500 focus:ring-offset-2 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? t('settings.email.saving') : t('settings.email.saveButton')}
          </button>
          
          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={saving || !settings.email_admin_address}
            className="px-4 py-2 bg-blue-600 text-white rounded-md 
                     hover:bg-blue-700 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:ring-offset-2 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('settings.email.testButton')}
          </button>
          
          <button
            type="button"
            onClick={handleCheckOldTickets}
            disabled={saving || !settings.email_admin_address || !settings.email_admin_old_tickets}
            className="px-4 py-2 bg-green-600 text-white rounded-md 
                     hover:bg-green-700 focus:outline-none focus:ring-2 
                     focus:ring-green-500 focus:ring-offset-2 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('settings.email.checkOldTickets')}
          </button>
        </div>
      </form>
      
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">{t('settings.email.setupInstructions')}</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          {t('settings.email.setupDescription')}
        </p>
        <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-2">
          <li>{t('settings.email.setupSteps.createFunction')} <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">send-email</code></li>
          <li>{t('settings.email.setupSteps.useService')}</li>
          <li>{t('settings.email.setupSteps.configureFunction')}</li>
          <li>{t('settings.email.setupSteps.setAdminEmail')}</li>
        </ol>
      </div>
    </div>
  );
}
