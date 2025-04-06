import { Layout } from '../components/Layout';
import { TicketList as TicketListComponent } from '../components/TicketList';
import { useI18n } from '../lib/i18n/context';
import { Link } from 'react-router-dom';

export function TicketList() {
  const { t } = useI18n();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t('tickets.allTickets')}
          </h1>
          <Link
            to="/tickets/new"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:ring-offset-gray-900"
          >
            {t('tickets.createNew')}
          </Link>
        </div>
        <TicketListComponent />
      </div>
    </Layout>
  );
}
