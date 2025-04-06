import { Layout } from '../components/Layout';
import { EmailSettings } from '../components/EmailSettings';
import { TermsSettings } from '../components/TermsSettings';
import { LogoSettings } from '../components/LogoSettings';
import { useI18n } from '../lib/i18n/context';

export function Settings() {
  const { t } = useI18n();
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          {t('settings.title')}
        </h1>

        <div className="space-y-6">
          <LogoSettings />
          <EmailSettings />
          <TermsSettings />
        </div>
      </div>
    </Layout>
  );
}
