import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbOps } from '../lib/db';
import { useI18n } from '../lib/i18n/context';

export function ThankYou() {
  const { id } = useParams();
  const { t } = useI18n();
  const [logoUrl, setLogoUrl] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialize DB with authentication
        await dbOps.initDb();
        
        // Load logo and ticket info in parallel
        const [logo, ticket] = await Promise.all([
          dbOps.getSetting('logo_url'),
          dbOps.getTicketById(id || '')
        ]);

        if (logo) setLogoUrl(logo);
        if (ticket) setTicketNumber(ticket.ticket_number);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error loading ticket information');
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800/50 p-8 rounded-lg shadow-xl backdrop-blur-sm ring-1 ring-white/10 text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <Link
            to="/public/tickets/new"
            className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg 
              hover:bg-purple-700 transition-colors duration-200"
          >
            Create New Ticket
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        {logoUrl && (
          <div className="flex justify-center mb-8">
            <img 
              src={logoUrl} 
              alt="Company Logo" 
              className="h-16 object-contain"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🖥️</text></svg>';
              }}
            />
          </div>
        )}

        <div className="bg-gray-800/50 p-8 rounded-lg shadow-xl backdrop-blur-sm ring-1 ring-white/10 text-center">
          <div className="mb-6">
            <svg className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold mb-4 text-white">
            {t('tickets.messages.thankYou')}
          </h1>

          <p className="text-gray-300 mb-6">
            {t('tickets.messages.ticketCreated')}
            {ticketNumber && (
              <span className="block mt-2 text-lg font-medium text-purple-400">
                {ticketNumber}
              </span>
            )}
          </p>

          <div className="space-y-4">
            <Link
              to={`/public/tickets/${id}`}
              className="inline-block w-full px-4 py-2 bg-purple-600 text-white rounded-lg 
                hover:bg-purple-700 transition-colors duration-200"
            >
              {t('tickets.actions.viewDetail')}
            </Link>

            <Link
              to="/public/tickets/new"
              className="inline-block w-full px-4 py-2 bg-gray-700 text-white rounded-lg 
                hover:bg-gray-600 transition-colors duration-200"
            >
              {t('tickets.actions.createAnother')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
