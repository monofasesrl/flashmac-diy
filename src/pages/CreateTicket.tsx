import { Layout } from '../components/Layout';
import { TicketForm } from '../components/TicketForm';
import { useI18n } from '../lib/i18n/context';

export function CreateTicket() {
  const { t } = useI18n();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          {t('tickets.createNew')}
        </h1>
        <TicketForm />
      </div>
    </Layout>
  );
}
